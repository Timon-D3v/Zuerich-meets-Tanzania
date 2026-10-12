import { Component, inject, PLATFORM_ID, signal, OnInit } from "@angular/core";
import { PUBLIC_CONFIG } from "../../../../publicConfig";
import { NotificationService } from "../../../services/notification.service";
import { ApiEndpointResponse, GetAllUsersApiEndpointResponse, PrivateUser } from "../../../..";
import { isPlatformBrowser } from "@angular/common";
import { PopupSelectionInputComponent } from "../../../components/popup-selection-input/popup-selection-input.component";
import { AdminManagementService } from "../../../services/admin-management.service";
import { AnalyticsService } from "../../../services/analytics.service";

@Component({
    imports: [PopupSelectionInputComponent],
    selector: "app-admin-add-admin",
    templateUrl: "./admin-add-admin.component.html",
    styleUrl: "./admin-add-admin.component.scss",
})
export class AdminAddAdminComponent implements OnInit {
    users = signal<PrivateUser[]>([]);
    selectionOpen = signal<boolean>(true);

    private analyticsService = inject(AnalyticsService);
    private notificationService = inject(NotificationService);
    private adminManagementService = inject(AdminManagementService);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        this.getAllUsers();
    }

    getAllUsers(): void {
        const request = this.analyticsService.getAllUsers();

        request.subscribe({
            next: (response: GetAllUsersApiEndpointResponse) => {
                if (response.error) {
                    console.error(response.message);
                    this.notificationService.error("Fehler:", "Beim Abrufen der E-Mail-Adressen ist ein Fehler aufgetreten: " + response.message);
                    return;
                }

                this.users.set(response.data);
            },
            error: (error) => {
                console.error("Error while fetching users:", error);
                this.notificationService.error("Fehler:", "Beim Abrufen der E-Mail-Adressen ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
            },
        });
    }

    addAdmin(email: string): void {
        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            this.notificationService.error("Eingabefehler:", "Bitte gib eine gültige E-Mail-Adresse ein.");

            return;
        }

        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot send post request if not in browser context.");

            return;
        }

        this.closeSelection();

        const request = this.adminManagementService.addAdmin(email);

        request.subscribe({
            next: (response: ApiEndpointResponse): void => {
                if (response.error && response.message === "Der Benutzer ist bereits ein Admin.") {
                    this.notificationService.info("Info:", response.message);

                    return;
                } else if (response.error) {
                    this.notificationService.error("Fehler:", "Beim Hinzufügen des Admins ist ein Fehler aufgetreten: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg:", `Der Benutzer mit der E-Mail "${email}" wurde erfolgreich zum Admin ernannt.`);

                this.getAllUsers();
            },
            error: (error: unknown): void => {
                console.error("Error while adding admin:", error);
                this.notificationService.error("Fehler", "Beim Hinzufügen des Admins ist ein Fehler aufgetreten. Bitte versuche es erneut.");
            },
        });
    }

    openSelection(): void {
        this.selectionOpen.set(true);
    }

    closeSelection(): void {
        this.selectionOpen.set(false);
    }
}
