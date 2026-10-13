import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { FileService } from "../../../services/file.service";
import { LoadingComponent } from "../../../components/loading/loading.component";
import { FilePreviewComponent } from "../../../components/file-preview/file-preview.component";
import { GetAllFileInformationApiEndpointResponse, LocalFile } from "../../../..";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "../../../services/notification.service";
import { PublicEnvService } from "../../../services/public-env.service";

@Component({
    selector: "app-admin-file-explorer",
    imports: [LoadingComponent, FilePreviewComponent],
    templateUrl: "./admin-file-explorer.component.html",
    styleUrl: "./admin-file-explorer.component.scss",
})
export class AdminFileExplorerComponent implements OnInit {
    files = signal<LocalFile[]>([]);

    delivApiUrl = signal<string>("");
    delivApiUser = signal<string>("");

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

        this.delivApiUrl.set(await this.publicEnvService.getDelivApiUrl());
        this.delivApiUser.set(await this.publicEnvService.getDelivApiUser());
    }

    getAllFiles(): void {
        const request = this.fileService.getAllFiles();

        request.subscribe({
            next: (response: GetAllFileInformationApiEndpointResponse) => {
                if (response.error || !response.data) {
                    console.error("Die Datei Informationen konnten nicht abgerufen werden. Weitere Informationen: " + response.message);
                    this.notificationService.error("Fehler", "Die Datei Informationen konnten nicht abgerufen werden. Bitte versuche es erneut.");

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
}
