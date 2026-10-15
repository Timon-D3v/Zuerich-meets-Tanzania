import { Component, inject, input, signal, effect, output } from "@angular/core";
import { ApiEndpointResponse, LocalFolder } from "../../..";
import { NotificationService } from "../../services/notification.service";
import { FileService } from "../../services/file.service";
import { PopupConfirmComponent } from "../popup-confirm/popup-confirm.component";
import { PopupTitleInputComponent } from "../popup-title-input/popup-title-input.component";

@Component({
    selector: "app-folder-preview",
    imports: [PopupConfirmComponent, PopupTitleInputComponent],
    templateUrl: "./folder-preview.component.html",
    styleUrl: "./folder-preview.component.scss",
})
export class FolderPreviewComponent {
    folder = input.required<LocalFolder>();
    selectionActive = input<boolean>();
    selectionStatus = input<"disabled" | "selected" | "unselected">("unselected");
    foldername = signal<string>("");

    contextMenuOpen = signal<boolean>(false);
    contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

    hideFolderPreview = signal<boolean>(false);

    confirmInputOpen = signal<boolean>(false);
    titleInputOpen = signal<boolean>(false);

    moveFileStart = output<number>();

    private fileService = inject(FileService);
    private notificationService = inject(NotificationService);

    private _updateFoldernameEffect = effect(() => {
        this.foldername.set(this.folder().foldername);
    });

    rightClick(event: MouseEvent): void {
        event.preventDefault();

        if (this.selectionActive()) {
            console.log("Selection active, not opening context menu.");
            return;
        }

        this.contextMenuOpen.set(true);
        this.contextMenuPosition.set({ x: event?.clientX || 100, y: event?.clientY || 100 });

        // Close the context menu when clicking outside of it
        const closeContextMenu = (closeEvent: Event) => {
            if (typeof closeEvent?.target === "object" && closeEvent.target !== null && closeEvent.target instanceof HTMLElement && closeEvent.target.closest(`#folder-preview-${this.folder().id} > ul.context-menu`) !== null) {
                // Clicked inside the context menu, do not close it
                return;
            }
            this.contextMenuOpen.set(false);

            window.removeEventListener("click", closeContextMenu);
            window.removeEventListener("contextmenu", closeContextMenu);
            window.removeEventListener("scroll", closeContextMenu);
            window.removeEventListener("resize", closeContextMenu);
        };

        setTimeout(() => {
            window.addEventListener("click", closeContextMenu);
            window.addEventListener("contextmenu", closeContextMenu);
            window.addEventListener("scroll", closeContextMenu);
            window.addEventListener("resize", closeContextMenu);
        }, 100);
    }

    doNotCloseContextMenu(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    moveFilesSelectionStart(): void {
        this.contextMenuOpen.set(false);

        this.moveFileStart.emit(this.folder().id);
    }

    renameFolder(newName: string): void {
        this.closeTitleInput();

        if (typeof newName !== "string" || newName.trim() === "" || newName.length > 255) {
            this.notificationService.error("Fehler:", "Bitte gib einen gültigen Ordnernamen ein. Der Name darf nicht leer sein und darf nicht länger als 255 Zeichen sein.");
            return;
        }

        const request = this.fileService.renameFolder(this.folder().id, newName);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Der Ordner konnte nicht umbenannt werden: " + response.message);
                    return;
                }
                this.notificationService.success("Erfolg:", "Der Ordner wurde erfolgreich umbenannt.");
                this.foldername.set(newName);
            },
            error: (error: Error) => {
                console.error("Failed to rename folder", error);
                this.notificationService.error("Fehler:", "Der Ordner konnte nicht umbenannt werden. Bitte versuche es später noch einmal.");
            },
        });
    }

    openTitleInput(): void {
        console.log("Benenne Ordner um: " + this.folder().id);
        this.titleInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeTitleInput(): void {
        this.titleInputOpen.set(false);
    }

    deleteFolder(confirmation: boolean): void {
        this.closeConfirmInput();

        if (!confirmation) {
            this.notificationService.info("Abgebrochen:", "Der Ordner wurde nicht gelöscht.");
            return;
        }

        const request = this.fileService.deleteFolder(this.folder().id);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Der Ordner konnte nicht gelöscht werden: " + response.message);
                    return;
                }
                this.notificationService.success("Erfolg:", "Der Ordner wurde erfolgreich gelöscht.");
                this.hideFolderPreview.set(true);
            },
            error: (error) => {
                console.error("Failed to delete folder", error);
                this.notificationService.error("Fehler:", "Der Ordner konnte nicht gelöscht werden. Bitte versuche es später noch einmal.");
            },
        });
    }

    openConfirmInput(): void {
        console.log("Lösche Ordner: " + this.folder().id);
        this.confirmInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeConfirmInput(): void {
        this.confirmInputOpen.set(false);
    }
}
