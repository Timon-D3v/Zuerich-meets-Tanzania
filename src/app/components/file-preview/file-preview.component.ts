import { Component, inject, input, PLATFORM_ID, signal, effect } from "@angular/core";
import { ApiEndpointResponse, DelivApiFile } from "../../..";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "../../services/notification.service";
import { PopupFileInputComponent } from "../popup-file-input/popup-file-input.component";
import { FileService } from "../../services/file.service";
import { PUBLIC_CONFIG } from "../../../publicConfig";
import { PopupConfirmComponent } from "../popup-confirm/popup-confirm.component";

@Component({
    selector: "app-file-preview",
    imports: [PopupFileInputComponent, PopupConfirmComponent],
    templateUrl: "./file-preview.component.html",
    styleUrl: "./file-preview.component.scss",
})
export class FilePreviewComponent {
    file = input.required<DelivApiFile>();
    filePreviewUrl = signal<string>("/svg/template.svg");
    filePreviewAlt = signal<string>("Unbekannter Dateityp");

    contextMenuOpen = signal<boolean>(false);
    contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

    fileInputOpen = signal<boolean>(false);
    confirmInputOpen = signal<boolean>(false);

    hideFilePreview = signal<boolean>(false);

    readonly DEVELOPER_EMAIL = PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email;

    private platformId = inject(PLATFORM_ID);

    private fileService = inject(FileService);
    private notificationService = inject(NotificationService);

    private _updateFilePreviewEffect = effect(() => {
        this.getFilePreview(this.file());
    });

    rightClick(event: MouseEvent): void {
        event.preventDefault();

        this.contextMenuOpen.set(true);
        this.contextMenuPosition.set({ x: event?.clientX || 100, y: event?.clientY || 100 });

        // Close the context menu when clicking outside of it
        const closeContextMenu = (closeEvent: Event) => {
            if (typeof closeEvent?.target === "object" && closeEvent.target !== null && closeEvent.target instanceof HTMLElement && closeEvent.target.closest(`#file-preview-${this.file().uuid} > ul.context-menu`) !== null) {
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

    getFilePreview(file: DelivApiFile): void {
        if (file.mimetype.startsWith("image/")) {
            this.filePreviewUrl.set(file.url);
            this.filePreviewAlt.set(file.uuid);
        } else if (file.mimetype.startsWith("video/") || file.mimetype === "audio/mp4" || file.mimetype === "audio/mpeg") {
            this.filePreviewUrl.set("/svg/video.svg");
            this.filePreviewAlt.set("Video");
        } else if (file.mimetype.startsWith("audio/")) {
            this.filePreviewUrl.set("/svg/audio.svg");
            this.filePreviewAlt.set("Audio");
        } else if (file.mimetype === "application/pdf") {
            this.filePreviewUrl.set("/svg/pdf.svg");
            this.filePreviewAlt.set("PDF");
        } else if (file.mimetype === "application/json") {
            const request = this.fileService.getMimeType(file.url);

            request.subscribe({
                next: (response) => {
                    const contentType = response?.headers?.get("Content-Type");

                    if (contentType === "application/json") {
                        this.filePreviewUrl.set("/svg/template.svg");
                        this.filePreviewAlt.set("JSON");

                        return;
                    }

                    this.getFilePreview({ ...file, mimetype: contentType ?? "application/octet-stream" });
                },
                error: (error) => {
                    console.error("Error fetching MIME type:", error);
                    this.filePreviewUrl.set("/svg/template.svg");
                },
            });
        } else {
            this.filePreviewUrl.set("/svg/template.svg");
            this.filePreviewAlt.set("Unbekannter Dateityp");
        }
    }

    openFile(): void {
        if (isPlatformBrowser(this.platformId)) {
            document?.getElementById(`file-preview-${this.file().uuid}`)?.click();
        }

        this.contextMenuOpen.set(false);
    }

    renameFile(): void {
        console.log("Benenne Datei um: " + this.file().uuid);
    }

    async downloadFile(): Promise<void> {
        if (isPlatformBrowser(this.platformId)) {
            try {
                // const a = document.createElement("a");
                // a.href = this.file().url + "?download=1";
                // a.target = "_blank";
                // a.download = this.file().uuid;

                // a.click();
                this.contextMenuOpen.set(false);
                this.notificationService.info("Download gestartet", "Der Download der Datei '" + this.file().uuid + "' wurde gestartet.");

                const request = await fetch(this.file().url);

                if (!request.ok) {
                    this.notificationService.error("Download fehlgeschlagen", "Die Datei konnte nicht heruntergeladen werden. Der Server antwortete mit einem Staus von: " + request.status);
                }

                const fileBlob = await request.blob();
                const url = window.URL.createObjectURL(fileBlob);

                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.download = this.file().uuid;

                document.body.appendChild(a);
                a.click();
                a.remove();

                window.URL.revokeObjectURL(url);
            } catch (error) {
                this.notificationService.error("Download fehlgeschlagen", "Die Datei konnte nicht heruntergeladen werden. Es ist ein Fehler aufgetreten: " + (error instanceof Error ? error.message : String(error)));
            }
        }
    }

    async copyFile(): Promise<void> {
        console.log("Kopiere Datei: " + this.file().uuid);

        if (isPlatformBrowser(this.platformId)) {
            try {
                // const a = document.createElement("a");
                // a.href = this.file().url + "?download=1";
                // a.target = "_blank";
                // a.download = this.file().uuid;

                // a.click();
                this.contextMenuOpen.set(false);
                this.notificationService.info("Download gestartet", "Der Download der Datei '" + this.file().uuid + "' wurde gestartet.");

                const request = await fetch(this.file().url);

                if (!request.ok) {
                    this.notificationService.error("Download fehlgeschlagen", "Die Datei konnte nicht in die Zwischenablage kopiert werden, da die Datei nicht heruntergeladen werden konnte.");
                }

                const fileBlob = await request.blob();
                const item = new ClipboardItem({ [fileBlob.type]: fileBlob });

                navigator.clipboard
                    .write([item])
                    .then((): void => {
                        this.notificationService.success("Erfolg:", "Datei wurde in die Zwischenablage kopiert.");
                    })
                    .catch((error: Error): void => {
                        console.error(error);
                        this.notificationService.error("Fehler:", "Datei konnte nicht in die Zwischenablage kopiert werden.");
                    });
            } catch (error) {
                this.notificationService.error("Download fehlgeschlagen", "Die Datei konnte nicht in die Zwischenablage kopiert werden. Es ist ein Fehler aufgetreten: " + (error instanceof Error ? error.message : String(error)));
            }
        }
    }

    shareFile(): void {
        console.log("Teile Datei: " + this.file().uuid);

        if (isPlatformBrowser(this.platformId)) {
            try {
                this.contextMenuOpen.set(false);

                navigator.clipboard
                    .writeText(this.file().url)
                    .then((): void => {
                        this.notificationService.success("Erfolg:", "Der direkte Link zur Datei wurde in die Zwischenablage kopiert. (" + this.file().url + ")");
                    })
                    .catch((error: Error): void => {
                        console.error(error);
                        this.notificationService.error("Fehler:", "Der direkte Link zur Datei konnte nicht in die Zwischenablage kopiert werden.");
                    });
            } catch (error) {
                this.notificationService.error("Fehler", "Der direkte Link zur Datei konnte nicht in die Zwischenablage kopiert werden. Es ist ein Fehler aufgetreten: " + (error instanceof Error ? error.message : String(error)));
            }
        }
    }

    replaceFile(file: File | null): void {
        this.closeFileInput();

        if (file === null) {
            this.notificationService.error("Fehler:", "Es wurde keine Datei ausgewählt.");

            return;
        }

        const request = this.fileService.replaceFile(this.file().uuid, file);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Die Datei konnte nicht ersetzt werden: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg:", "Die Datei wurde erfolgreich ersetzt und wird nun verwendet.");
            },
            error: (error: Error) => {
                console.error("Failed to replace file", error);
                this.notificationService.error("Fehler:", "Die Datei konnte nicht ersetzt werden. Bitte versuche es später noch einmal.");
            },
        });
    }

    openFileInput(): void {
        console.log("Ersetze Datei: " + this.file().uuid);
        this.fileInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeFileInput(): void {
        this.fileInputOpen.set(false);
    }

    deleteFile(confirmation: boolean): void {
        this.closeConfirmInput();

        if (!confirmation) {
            this.notificationService.info("Abgebrochen:", "Die Datei wurde nicht gelöscht.");

            return;
        }

        const request = this.fileService.deleteFile(this.file().uuid);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Die Datei konnte nicht gelöscht werden: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg:", "Die Datei wurde erfolgreich gelöscht.");
                this.hideFilePreview.set(true);
            },
            error: (error) => {
                console.error("Failed to delete file", error);
                this.notificationService.error("Fehler:", "Die Datei konnte nicht gelöscht werden. Bitte versuche es später noch einmal.");
            },
        });
    }

    openConfirmInput(): void {
        console.log("Lösche Datei: " + this.file().uuid);
        this.confirmInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeConfirmInput(): void {
        this.confirmInputOpen.set(false);
    }
}
