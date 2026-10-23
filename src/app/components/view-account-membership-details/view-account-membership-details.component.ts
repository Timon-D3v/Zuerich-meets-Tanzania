import { Component, input, OnInit, signal, inject, effect } from "@angular/core";
import { PublicUser, Invoice, GetInvoicesApiEndpointResponse, ApiEndpointResponse } from "../../../";
import { RouterLink } from "@angular/router";
import { LoadingComponent } from "../loading/loading.component";
import { AccountService } from "../../services/account.service";
import { NotificationService } from "../../services/notification.service";

@Component({
    selector: "app-view-account-membership-details",
    imports: [RouterLink, LoadingComponent],
    templateUrl: "./view-account-membership-details.component.html",
    styleUrl: "./view-account-membership-details.component.scss",
})
export class ViewAccountMembershipDetailsComponent implements OnInit {
    user = input.required<PublicUser>();
    isLegacyMember = signal<"true" | "false" | "pending">("pending");

    invoices = signal<Invoice[]>([]);

    failedFetching = signal<boolean>(false);

    private accountService = inject(AccountService);
    private notificationService = inject(NotificationService);

    private _loadInvoicesIfNeeded = effect((): void => {
        if (this.isLegacyMember() === "false") {
            console.log("Fetching invoices because user is not a legacy member.");
            this.getInvoices();
        }
    });

    ngOnInit(): void {
        this.isLegacyMemberCheck();
    }

    getInvoices(): void {
        const request = this.accountService.getInvoices();

        request.subscribe({
            next: (response: GetInvoicesApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler beim Laden:", "Deine Rechnungen konnten nicht geladen werden. Bitte versuche es später erneut.");

                    this.failedFetching.set(true);

                    return;
                }

                this.invoices.set(response.data || []);

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while fetching invoices:", error);
                this.notificationService.error("Fehler beim Laden:", "Deine Rechnungen konnten nicht geladen werden. Bitte versuche es später erneut.");

                this.failedFetching.set(true);
            },
        });
    }

    isLegacyMemberCheck(): void {
        const request = this.accountService.isLegacyMemberCheck();

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler beim Laden:", "Dein Mitgliedschaftsstatus konnte nicht geladen werden. Bitte versuche es später erneut.");

                    this.failedFetching.set(true);

                    return;
                }

                this.isLegacyMember.set(response.message === "true" ? "true" : "false");

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while checking legacy member status:", error);
                this.notificationService.error("Fehler beim Laden:", "Dein Mitgliedschaftsstatus konnte nicht geladen werden. Bitte versuche es später erneut.");

                this.failedFetching.set(true);
            },
        });
    }

    reload(): void {
        this.isLegacyMemberCheck();
        this.getInvoices();
    }

    formatDate(dateInput: string | number): string {
        const date = new Date(dateInput);

        return date.toLocaleDateString("de-CH", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }
}
