import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { GetPasswordsApiEndpointResponse, LoginInformation } from "../../../..";
import { NotificationService } from "../../../services/notification.service";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { LoadingComponent } from "../../../components/loading/loading.component";

@Component({
    selector: "app-admin-passwords-page",
    imports: [LoadingComponent],
    templateUrl: "./admin-passwords-page.component.html",
    styleUrl: "./admin-passwords-page.component.scss",
})
export class AdminPasswordsPageComponent implements OnInit {
    failedFetching = signal<boolean>(false);

    passwords = signal<LoginInformation[]>([]);

    private notificationService = inject(NotificationService);

    private http = inject(HttpClient);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch when not in browser context.");

            this.failedFetching.set(true);

            return;
        }

        this.fetchPasswords();
    }

    fetchPasswords(): void {
        const request = this.http.get<GetPasswordsApiEndpointResponse>("/api/secured/admin/management/getPasswords");

        request.subscribe({
            next: (response: GetPasswordsApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Laden fehlgeschlagen: ", response.message);

                    this.failedFetching.set(true);

                    return;
                }

                this.passwords.set(response.data);
                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while fetching passwords:", error);
                this.notificationService.error("Fehler", "Die Passwörter konnten nicht geladen werden. Bitte versuche es erneut.");
                this.failedFetching.set(true);
            },
        });
    }
}
