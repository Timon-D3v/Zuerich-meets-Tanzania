import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { PUBLIC_CONFIG } from "../../publicConfig";
import { GetStaticSiteApiEndpointResponse, StaticSite, StaticSiteNames } from "../..";
import { SubpagesService } from "../services/subpages.service";
import { NotificationService } from "../services/notification.service";
import { HeroComponent } from "../components/hero/hero.component";
import { BoardComponent } from "../components/board/board.component";
import { LoadingComponent } from "../components/loading/loading.component";
import { CustomLineComponent } from "../components/custom-line/custom-line.component";
import { TeamFromIdComponent } from "../components/team-from-id/team-from-id.component";
import { CustomImageComponent } from "../components/custom-image/custom-image.component";
import { CustomTitleComponent } from "../components/custom-title/custom-title.component";
import { CustomTableComponent } from "../components/custom-table/custom-table.component";
import { CustomVideoComponent } from "../components/custom-video/custom-video.component";
import { CustomSourceComponent } from "../components/custom-source/custom-source.component";
import { CustomSubtitleComponent } from "../components/custom-subtitle/custom-subtitle.component";
import { CustomParagraphComponent } from "../components/custom-paragraph/custom-paragraph.component";
import { CustomPdfViewerComponent } from "../components/custom-pdf-viewer/custom-pdf-viewer.component";
import { CustomImageCarouselComponent } from "../components/custom-image-carousel/custom-image-carousel.component";
import { CustomMultipleListsComponent } from "../components/custom-multiple-lists/custom-multiple-lists.component";
import { CustomImageWithTextComponent } from "../components/custom-image-with-text/custom-image-with-text.component";
import { CustomMultipleButtonsComponent } from "../components/custom-multiple-buttons/custom-multiple-buttons.component";

@Component({
    selector: "app-static-site",
    imports: [
        HeroComponent,
        LoadingComponent,
        TeamFromIdComponent,
        CustomLineComponent,
        CustomImageWithTextComponent,
        CustomImageCarouselComponent,
        CustomImageComponent,
        CustomParagraphComponent,
        CustomSubtitleComponent,
        CustomTitleComponent,
        CustomMultipleListsComponent,
        CustomVideoComponent,
        CustomTableComponent,
        CustomSourceComponent,
        CustomPdfViewerComponent,
        CustomMultipleButtonsComponent,
        BoardComponent,
    ],
    templateUrl: "./static-site.component.html",
    styleUrl: "./static-site.component.scss",
})
export class StaticSiteComponent {
    siteName: StaticSiteNames = "zurich-meets-tanzania"; // Default, will be overwritten in ngOnInit

    site = signal<StaticSite>(PUBLIC_CONFIG.STATIC_SITES.LOADING(this.siteName, PUBLIC_CONFIG.FALLBACK_IMAGE_URL));
    date = signal<string>("");

    failedFetching = signal<boolean>(false);

    private subpagesService = inject(SubpagesService);
    private notificationService = inject(NotificationService);

    private route = inject(ActivatedRoute);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        this.siteName = this.route.snapshot.data["siteName"] as StaticSiteNames;

        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch when not in browser context.");

            this.site.set(PUBLIC_CONFIG.STATIC_SITES.ERROR(this.siteName, PUBLIC_CONFIG.FALLBACK_IMAGE_URL, "Cannot fetch when not in browser context."));

            this.failedFetching.set(true);

            return;
        }

        this.loadSite();
    }

    loadSite(): void {
        const request = this.subpagesService.getStaticSite(this.siteName);

        request.subscribe({
            next: (response: GetStaticSiteApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler beim Laden der Seite", `Die Seite '${this.siteName}' konnte nicht geladen werden: ` + response.message);

                    // Set a Warning as the sites content
                    this.site.set(PUBLIC_CONFIG.STATIC_SITES.ERROR(this.siteName, PUBLIC_CONFIG.FALLBACK_IMAGE_URL, response.message));

                    this.failedFetching.set(true);

                    return;
                }

                this.site.set(response.data.site);
                this.date.set(
                    new Date(response.data.date).toLocaleDateString("de-CH", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                    }),
                );

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while fetching static site:", error);
                this.notificationService.error("Fehler beim Laden der Seite", `Die Seite '${this.siteName}' konnte nicht geladen werden. Bitte versuche es später erneut.`);

                // Set a Warning as the sites content
                this.site.set(PUBLIC_CONFIG.STATIC_SITES.ERROR(this.siteName, PUBLIC_CONFIG.FALLBACK_IMAGE_URL, "Fehler beim Laden der Seite. Bitte versuche es später erneut."));

                this.failedFetching.set(true);
            },
        });
    }
}
