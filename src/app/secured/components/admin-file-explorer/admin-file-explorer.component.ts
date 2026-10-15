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
                if (response.error || !response.data) {
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

    openTitleInput(): void {
        this.titleInputOpen.set(true);
    }

    closeTitleInput(): void {
        this.titleInputOpen.set(false);
    }
}
