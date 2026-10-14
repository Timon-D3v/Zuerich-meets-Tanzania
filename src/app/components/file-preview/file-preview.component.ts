import { Component, inject, input, PLATFORM_ID, signal, effect } from "@angular/core";
import { ApiEndpointResponse, LocalFile } from "../../..";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "../../services/notification.service";
import { PopupFileInputComponent } from "../popup-file-input/popup-file-input.component";
import { FileService } from "../../services/file.service";
import { PUBLIC_CONFIG } from "../../../publicConfig";
import { PopupConfirmComponent } from "../popup-confirm/popup-confirm.component";
import { PopupTitleInputComponent } from "../popup-title-input/popup-title-input.component";
import { PublicEnvService } from "../../services/public-env.service";

@Component({
    selector: "app-file-preview",
    imports: [PopupFileInputComponent, PopupConfirmComponent, PopupTitleInputComponent],
    templateUrl: "./file-preview.component.html",
    styleUrl: "./file-preview.component.scss",
})
export class FilePreviewComponent {
    file = input.required<LocalFile>();
    delivApiUrl = input.required<string>();
    delivApiUser = input.required<string>();

    contextMenuOpen = signal<boolean>(false);
    contextMenuPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

    fileInputOpen = signal<boolean>(false);
    confirmInputOpen = signal<boolean>(false);
    titleInputOpen = signal<boolean>(false);

    hideFilePreview = signal<boolean>(false);
    fileTimestamp = signal<number>(0);
    filename = signal<string>("");

    private _updateFileNameEffect = effect(() => {
        this.filename.set(this.file().filename ?? this.file().uuid);
    });

    readonly DEVELOPER_EMAIL = PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email;

    private platformId = inject(PLATFORM_ID);

    private fileService = inject(FileService);
    private publicEnvService = inject(PublicEnvService);
    private notificationService = inject(NotificationService);

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

    getFilePreview(file: LocalFile, transform: boolean = false, timestamp: number = 0): { url: string; alt: string } {
        if (file.mimeType.startsWith("image/")) {
            const width = 200;
            const height = (width / 10) * 5.5;

            if (this.file().mimeType === "image/svg+xml") {
                transform = false; // Do not transform SVG files, as they are vector graphics and do not need resizing
            }

            return {
                url: this.getFileUrl(file) + (transform ? `?width=${width}&height=${height}&fit=inside&position=centre&format=webp&quality=80&timestamp=${timestamp}` : ""),
                alt: file.uuid,
            };
        } else if (file.mimeType.startsWith("video/") || file.mimeType === "audio/mp4" || file.mimeType === "audio/mpeg") {
            return {
                url: "/svg/video.svg",
                alt: "Video",
            };
        } else if (file.mimeType.startsWith("audio/")) {
            return {
                url: "/svg/audio.svg",
                alt: "Audio",
            };
        } else if (file.mimeType === "application/pdf") {
            return {
                url: "/svg/pdf.svg",
                alt: "PDF",
            };
        } else {
            return {
                url: "/svg/template.svg",
                alt: "Unbekannter Dateityp",
            };
        }
    }

    getFileUrl(file: LocalFile): string {
        return `${this.delivApiUrl()}/cdn/${this.delivApiUser()}/${file.uuid}`;
    }

    openFile(): void {
        if (isPlatformBrowser(this.platformId)) {
            document?.getElementById(`file-preview-${this.file().uuid}`)?.click();
        }

        this.contextMenuOpen.set(false);
    }

    renameFile(newName: string): void {
        this.closeTitleInput();

        if (typeof newName !== "string" || newName.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_FILENAME.test(newName)) {
            this.notificationService.error("Fehler:", "Bitte gib einen gültigen Dateinamen ein. Der Name darf nur aus Buchstaben, Zahlen, Bindestrichen und Unterstrichen bestehen. Leerzeichen und Sonderzeichen sind nicht erlaubt.");

            return;
        }

        const request = this.fileService.renameFile(this.file().uuid, newName);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Die Datei konnte nicht umbenannt werden: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg:", "Die Datei wurde erfolgreich umbenannt.");
                this.filename.set(newName);
            },
            error: (error: Error) => {
                console.error("Failed to rename file", error);
                this.notificationService.error("Fehler:", "Die Datei konnte nicht umbenannt werden. Bitte versuche es später noch einmal.");
            },
        });
    }

    openTitleInput(): void {
        console.log("Benenne Datei um: " + this.file().uuid);
        this.titleInputOpen.set(true);
        this.contextMenuOpen.set(false);
    }

    closeTitleInput(): void {
        this.titleInputOpen.set(false);
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

                const request = await fetch(this.getFileUrl(this.file()));

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

                const request = await fetch(this.getFileUrl(this.file()));

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
                    .writeText(this.getFileUrl(this.file()))
                    .then((): void => {
                        this.notificationService.success("Erfolg:", "Der direkte Link zur Datei wurde in die Zwischenablage kopiert. (" + this.getFileUrl(this.file()) + ")");
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

    async sharePrettyFile(): Promise<void> {
        console.log("Teile schönen Link zurDatei: " + this.file().uuid);

        if (isPlatformBrowser(this.platformId)) {
            try {
                this.contextMenuOpen.set(false);

                const ORIGIN = await this.publicEnvService.getOrigin();
                const prettyUrl = `${ORIGIN}/redirects/${this.filename()}`;

                navigator.clipboard
                    .writeText(prettyUrl)
                    .then((): void => {
                        this.notificationService.success("Erfolg:", "Der schöne Link zur Datei wurde in die Zwischenablage kopiert. Beachte allerdings, dass dieser Link nur solange funktioniert, bis diese Datei umbenannt wird. (" + prettyUrl + ")");
                    })
                    .catch((error: Error): void => {
                        console.error(error);
                        this.notificationService.error("Fehler:", "Der schöne Link zur Datei konnte nicht in die Zwischenablage kopiert werden.");
                    });
            } catch (error) {
                this.notificationService.error("Fehler", "Der schöne Link zur Datei konnte nicht in die Zwischenablage kopiert werden. Es ist ein Fehler aufgetreten: " + (error instanceof Error ? error.message : String(error)));
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

                this.fileTimestamp.set(Date.now());
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
