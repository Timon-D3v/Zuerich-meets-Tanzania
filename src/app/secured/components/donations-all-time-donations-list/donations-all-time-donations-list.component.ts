import { Component, inject, OnInit, signal } from "@angular/core";
import { Donor, GetAllDonorsApiEndpointResponse, GetAllUsersApiEndpointResponse, PrivateUser } from "../../../..";
import { LoadingComponent } from "../../../components/loading/loading.component";
import { PopupSelectionInputComponent } from "../../../components/popup-selection-input/popup-selection-input.component";
import { NotificationService } from "../../../services/notification.service";
import { SpreadsheetsService } from "../../../services/spreadsheets.service";
import { DonationService } from "../../../services/donation.service";

@Component({
    imports: [LoadingComponent, PopupSelectionInputComponent],
    selector: "app-donations-all-time-donations-list",
    templateUrl: "./donations-all-time-donations-list.component.html",
    styleUrl: "./donations-all-time-donations-list.component.scss",
})
export class DonationsAllTimeDonationsListComponent implements OnInit {
    donors = signal<Donor[]>([]);

    fileTypeSelectionOpen = signal<boolean>(false);
    failedFetching = signal<boolean>(false);

    private donationService = inject(DonationService);
    private spreadsheetsService = inject(SpreadsheetsService);
    private notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.loadAllDonors();
    }

    loadAllDonors(): void {
        const request = this.donationService.getDonorList();

        request.subscribe({
            next: (response: GetAllDonorsApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die Spenderliste konnte nicht geladen werden: " + response.error);

                    this.failedFetching.set(true);

                    return;
                }

                this.donors.set(response.data);
                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while loading all donors:", error);
                this.notificationService.error("Fehler:", "Die Spenderliste konnte nicht geladen werden. Bitte versuchen Sie es erneut.");

                this.failedFetching.set(true);
            },
        });
    }

    initiateDownload(): void {
        this.fileTypeSelectionOpen.set(true);
    }

    download(result: string): void {
        this.fileTypeSelectionOpen.set(false);

        switch (result) {
            case "CSV":
                this.spreadsheetsService.exportDataToCSV(this.donors(), "donors");
                break;
            case "Excel":
                this.spreadsheetsService.exportDataToExcel(this.donors(), "donors", "Spender");
                break;
            case "OpenDocument":
                this.spreadsheetsService.exportDataToOpenDocumentSpreadsheet(this.donors(), "donors", "Spender");
                break;
            default:
                console.info("No file type selected for export.");
        }
    }

    formatNumber(value: number): string {
        return new Intl.NumberFormat("de-CH").format(value);
    }
}
