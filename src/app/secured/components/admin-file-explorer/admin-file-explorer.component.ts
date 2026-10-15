import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { FileService } from "../../../services/file.service";
import { LoadingComponent } from "../../../components/loading/loading.component";
import { FilePreviewComponent } from "../../../components/file-preview/file-preview.component";
import { ApiEndpointResponse, GetAllFileInformationApiEndpointResponse, GetAllLocalFoldersApiEndpointResponse, LocalFile, LocalFolder } from "../../../..";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "../../../services/notification.service";
import { PublicEnvService } from "../../../services/public-env.service";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { FolderPreviewComponent } from "../../../components/folder-preview/folder-preview.component";
import { PopupTitleInputComponent } from "../../../components/popup-title-input/popup-title-input.component";

@Component({
    selector: "app-admin-file-explorer",
    imports: [LoadingComponent, FilePreviewComponent, BreadcrumbComponent, FolderPreviewComponent, PopupTitleInputComponent],
    templateUrl: "./admin-file-explorer.component.html",
    styleUrl: "./admin-file-explorer.component.scss",
})
export class AdminFileExplorerComponent implements OnInit {
    files = signal<LocalFile[]>([]);
    folders = signal<LocalFolder[]>([]);
    currentFolder = signal<LocalFolder | null>(null);

    delivApiUrl = signal<string>("");
    delivApiUser = signal<string>("");

    titleInputOpen = signal<boolean>(false);
    jobRunning = signal<boolean>(false);
    fileSelectionActive = signal<boolean>(false);
    fileSelectionFolderId = signal<number>(-1);
    selectedFolderIds = signal<number[]>([]);
    selectedFileUuids = signal<string[]>([]);

    private fileService = inject(FileService);
    private publicEnvService = inject(PublicEnvService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    async ngOnInit(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch outside of a browser context.");
            return;
        }

        this.getAllFiles();
        this.getAllFolders();

        this.delivApiUrl.set(await this.publicEnvService.getDelivApiUrl());
        this.delivApiUser.set(await this.publicEnvService.getDelivApiUser());
    }

    getAllFiles(): void {
        const request = this.fileService.getAllFiles();

        request.subscribe({
            next: (response: GetAllFileInformationApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die Datei Informationen konnten nicht abgerufen werden: " + response.message);

                    return;
                }

                this.files.set(response.data);
            },
            error: (error: unknown) => {
                console.error("Error while fetching files:", error);
                this.notificationService.error("Fehler", "Die Datei Informationen konnten nicht abgerufen werden. Bitte versuche es erneut.");
            },
        });
    }

    getAllFolders(): void {
        const request = this.fileService.getAllFolders();

        request.subscribe({
            next: (response: GetAllLocalFoldersApiEndpointResponse) => {
                if (response.error || !response.data) {
                    this.notificationService.error("Fehler", "Die Ordner Informationen konnten nicht abgerufen werden: " + response.message);

                    return;
                }

                this.folders.set(response.data);
            },
            error: (error: unknown) => {
                console.error("Error while fetching folders:", error);
                this.notificationService.error("Fehler", "Die Ordner Informationen konnten nicht abgerufen werden. Bitte versuche es erneut.");
            },
        });
    }

    changeFolder(folderId: number): void {
        if (this.fileSelectionActive()) {
            return this.selectFolder(folderId);
        }

        console.log("Change folder to: " + folderId);
        if (folderId === -1) {
            this.currentFolder.set(null);
            return;
        }

        this.currentFolder.set(this.folders().find((folder) => folder.id === folderId) || null);
    }

    getParentFolder(folder: LocalFolder | null): LocalFolder | null {
        if (folder === null || folder.folderId === null) {
            return null;
        }

        return this.folders().find((parentFolder) => parentFolder.id === folder.folderId) || null;
    }

    createFolder(name: string): void {
        if (typeof name !== "string" || name.trim() === "" || name.length > 255) {
            this.notificationService.error("Fehler", "Der Ordnername ist ungültig. Bitte gib einen gültigen Namen ein (1-255 Zeichen).");
            return;
        }

        this.closeTitleInput();

        const request = this.fileService.createFolder(name, this.currentFolder()?.id || null);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Der Ordner konnte nicht erstellt werden: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg", "Der Ordner wurde erfolgreich erstellt.");
                this.getAllFolders();
            },
            error: (error: unknown) => {
                console.error("Error while creating folder:", error);
                this.notificationService.error("Fehler", "Der Ordner konnte nicht erstellt werden. Bitte versuche es erneut.");
            },
        });
    }

    rerunUpdateLocalFilesMetadataDatabaseJob(): void {
        if (this.jobRunning()) {
            this.notificationService.info("Info", "Das Update der lokalen Datei-Metadaten-Datenbank läuft bereits. Bitte warte, bis es abgeschlossen ist.");
            return;
        }

        this.jobRunning.set(true);

        const request = this.fileService.rerunUpdateLocalFilesMetadataDatabaseJob();

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Das Update der lokalen Datei-Metadaten-Datenbank konnte nicht ausgeführt werden: " + response.message);

                    return;
                }

                this.notificationService.info("Erfolg", "Das Update der lokalen Datei-Metadaten-Datenbank wurde ausgeführt. (Falls Fehler auftreten, werden die Admins per E-Mail benachrichtigt.)");

                this.getAllFolders();
                this.getAllFiles();

                this.jobRunning.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while rerunning update local files metadata database job:", error);
                this.notificationService.error("Fehler", "Das Update der lokalen Datei-Metadaten-Datenbank konnte nicht ausgeführt werden. Bitte versuche es erneut.");
            },
        });
    }

    openTitleInput(): void {
        this.titleInputOpen.set(true);
    }

    closeTitleInput(): void {
        this.titleInputOpen.set(false);
    }

    startFileSelection(folderId: number): void {
        console.log("Start file selection for folder: " + folderId);

        this.fileSelectionActive.set(true);
        this.fileSelectionFolderId.set(folderId); // -1 Corresponds to the root folder
    }

    cancelFileSelection(): void {
        console.log("Cancel file selection");

        this.fileSelectionActive.set(false);
        this.fileSelectionFolderId.set(-1);

        this.selectedFolderIds.set([]);
        this.selectedFileUuids.set([]);
    }

    submitFileSelection(): void {
        console.log("Submit file selection for folder: " + this.fileSelectionFolderId());

        // Here you would implement the logic to move the selected files to the folder with ID this.fileSelectionFolderId()
        // For now, we just reset the selection state
        const targetFolderId = this.fileSelectionFolderId() == -1 ? null : this.fileSelectionFolderId();
        const folderIds = this.selectedFolderIds();
        const fileUuids = this.selectedFileUuids();

        console.log("Selected folder IDs:", folderIds);
        console.log("Selected file UUIDs:", fileUuids);

        // Reset selection state
        this.fileSelectionActive.set(false);
        this.fileSelectionFolderId.set(-1);
        this.selectedFolderIds.set([]);
        this.selectedFileUuids.set([]);

        this.moveFilesToFolder(fileUuids, targetFolderId);
        this.moveFoldersToFolder(folderIds, targetFolderId);
    }

    moveFilesToFolder(fileUuids: string[], targetFolderId: number | null): void {
        if (fileUuids.length === 0) {
            this.notificationService.info("Info", "Es wurden keine Dateien ausgewählt.");
            return;
        }

        const filesRequest = this.fileService.moveFilesToFolder(fileUuids, targetFolderId);

        filesRequest.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die ausgewählten Dateien konnten nicht verschoben werden: " + response.message);
                    return;
                }

                this.notificationService.success("Erfolg", "Die ausgewählten Dateien wurden erfolgreich verschoben.");
                this.getAllFiles();
            },
            error: (error: unknown) => {
                console.error("Error while moving files:", error);
                this.notificationService.error("Fehler", "Die ausgewählten Dateien konnten nicht verschoben werden. Bitte versuche es erneut.");
            },
        });
    }

    moveFoldersToFolder(folderIds: number[], targetFolderId: number | null): void {
        if (folderIds.length === 0) {
            this.notificationService.info("Info", "Es wurden keine Ordner ausgewählt.");
            return;
        }

        const foldersRequest = this.fileService.moveFoldersToFolder(folderIds, targetFolderId);

        foldersRequest.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die ausgewählten Ordner konnten nicht verschoben werden: " + response.message);
                    return;
                }

                this.notificationService.success("Erfolg", "Die ausgewählten Ordner wurden erfolgreich verschoben.");
                this.getAllFolders();
            },
            error: (error: unknown) => {
                console.error("Error while moving folders:", error);
                this.notificationService.error("Fehler", "Die ausgewählten Ordner konnten nicht verschoben werden. Bitte versuche es erneut.");
            },
        });
    }

    selectFolder(folderId: number): void {
        if (folderId === -1 || folderId === this.fileSelectionFolderId() || folderId === null) {
            return;
        }

        this.selectedFolderIds.update((ids) => {
            if (ids.includes(folderId)) {
                return ids.filter((id) => id !== folderId);
            } else {
                return [...ids, folderId];
            }
        });
    }

    toggleFileSelection(fileUuid: string): void {
        if (!this.fileSelectionActive()) {
            return;
        }

        this.selectedFileUuids.update((uuids) => {
            if (uuids.includes(fileUuid)) {
                return uuids.filter((uuid) => uuid !== fileUuid);
            } else {
                return [...uuids, fileUuid];
            }
        });
    }
}
