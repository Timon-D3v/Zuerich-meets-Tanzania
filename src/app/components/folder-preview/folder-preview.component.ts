import { Component, inject, input, PLATFORM_ID, signal, effect } from "@angular/core";
import { ApiEndpointResponse, LocalFolder } from "../../..";
import { isPlatformBrowser } from "@angular/common";
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

    contextMenuOpen = signal<boolean>(false);
    contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

    confirmInputOpen = signal<boolean>(false);
    titleInputOpen = signal<boolean>(false);

    private platformId = inject(PLATFORM_ID);

    private fileService = inject(FileService);
    private notificationService = inject(NotificationService);

    rightClick(event: MouseEvent): void {
        event.preventDefault();

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

    renameFolder(newName: string): void {
        // this.closeTitleInput();
        // if (typeof newName !== "string" || newName.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_FILENAME.test(newName)) {
        //     this.notificationService.error("Fehler:", "Bitte gib einen gültigen Dateinamen ein. Der Name darf nur aus Buchstaben, Zahlen, Bindestrichen und Unterstrichen bestehen. Leerzeichen und Sonderzeichen sind nicht erlaubt.");
        //     return;
        // }
        // const request = this.fileService.renameFile(this.file().uuid, newName);
        // request.subscribe({
        //     next: (response: ApiEndpointResponse) => {
        //         if (response.error) {
        //             this.notificationService.error("Fehler:", "Die Datei konnte nicht umbenannt werden: " + response.message);
        //             return;
        //         }
        //         this.notificationService.success("Erfolg:", "Die Datei wurde erfolgreich umbenannt.");
        //         this.filename.set(newName);
        //     },
        //     error: (error: Error) => {
        //         console.error("Failed to rename file", error);
        //         this.notificationService.error("Fehler:", "Die Datei konnte nicht umbenannt werden. Bitte versuche es später noch einmal.");
        //     },
        // });
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
        // this.closeConfirmInput();
        // if (!confirmation) {
        //     this.notificationService.info("Abgebrochen:", "Die Datei wurde nicht gelöscht.");
        //     return;
        // }
        // const request = this.fileService.deleteFile(this.file().uuid);
        // request.subscribe({
        //     next: (response: ApiEndpointResponse) => {
        //         if (response.error) {
        //             this.notificationService.error("Fehler:", "Die Datei konnte nicht gelöscht werden: " + response.message);
        //             return;
        //         }
        //         this.notificationService.success("Erfolg:", "Die Datei wurde erfolgreich gelöscht.");
        //         this.hideFolderPreview.set(true);
        //     },
        //     error: (error) => {
        //         console.error("Failed to delete file", error);
        //         this.notificationService.error("Fehler:", "Die Datei konnte nicht gelöscht werden. Bitte versuche es später noch einmal.");
        //     },
        // });
    }

    openConfirmInput(): void {
        console.log("Lösche Datei: " + this.folder().id);
        this.confirmInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeConfirmInput(): void {
        this.confirmInputOpen.set(false);
    }
}
