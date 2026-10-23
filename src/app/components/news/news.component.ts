import { Component, effect, inject, input, PLATFORM_ID, signal } from "@angular/core";
import { GetNewsApiEndpointResponse, News } from "../../..";
import { PUBLIC_CONFIG } from "../../../publicConfig";
import { NewsService } from "../../services/news.service";
import { NotificationService } from "../../services/notification.service";
import { isPlatformBrowser } from "@angular/common";
import { CustomTitleComponent } from "../custom-title/custom-title.component";
import { CustomSubtitleComponent } from "../custom-subtitle/custom-subtitle.component";
import { CustomParagraphComponent } from "../custom-paragraph/custom-paragraph.component";
import { CustomImageComponent } from "../custom-image/custom-image.component";
import { CustomImageCarouselComponent } from "../custom-image-carousel/custom-image-carousel.component";
import { CustomImageWithTextComponent } from "../custom-image-with-text/custom-image-with-text.component";
import { CustomLineComponent } from "../custom-line/custom-line.component";
import { TeamFromIdComponent } from "../team-from-id/team-from-id.component";
import { LoadingComponent } from "../loading/loading.component";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { SanitizerService } from "../../services/sanitizer.service";

@Component({
    selector: "app-news",
    imports: [CustomTitleComponent, CustomSubtitleComponent, CustomParagraphComponent, CustomImageComponent, CustomImageCarouselComponent, CustomImageWithTextComponent, CustomLineComponent, TeamFromIdComponent, LoadingComponent],
    templateUrl: "./news.component.html",
    styleUrl: "./news.component.scss",
})
export class NewsComponent {
    id = input<number>(-1);
    newsTitle = input<string | null>(null);

    news = signal<News>(PUBLIC_CONFIG.NEWS.LOADING(PUBLIC_CONFIG.FALLBACK_IMAGE_URL));

    failedFetching = signal<boolean>(false);

    private newsService = inject(NewsService);
    private sanitizerService = inject(SanitizerService);
    private notificationService = inject(NotificationService);

    private sanitizer = inject(DomSanitizer);

    private platformId = inject(PLATFORM_ID);

    pdfUrl = signal<SafeResourceUrl>(this.sanitizer.bypassSecurityTrustResourceUrl("about:blank"));

    private _updateContent = effect(() => {
        this.loadNews(this.id());
    });

    private _updatePdfUrl = effect(async () => {
        const pdfUrl = await this.sanitizePdfUrl(this.news().data?.pdfUrl);

        console.log("Sanitized PDF URL:", pdfUrl);

        this.pdfUrl.set(pdfUrl);
    });

    ngOnInit(): void {
        this.loadNews(this.id());
    }

    loadNews(id: number): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch when not in browser context.");

            this.news.set(PUBLIC_CONFIG.NEWS.ERROR(PUBLIC_CONFIG.FALLBACK_IMAGE_URL, "Cannot fetch when not in browser context."));

            this.failedFetching.set(true);

            return;
        }

        const request = id === -1 ? this.newsService.getLatestNews() : this.newsService.getNews(id);

        request.subscribe({
            next: (response: GetNewsApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler:", "Die News konnten nicht geladen werden: " + response.message);

                    this.news.set(PUBLIC_CONFIG.NEWS.ERROR(PUBLIC_CONFIG.FALLBACK_IMAGE_URL, response.message));

                    this.failedFetching.set(true);

                    return;
                }

                this.news.set(response.data);

                this.failedFetching.set(false);
            },
            error: (error) => {
                console.error("Error while fetching news:", error);
                this.notificationService.error("Fehler:", "Die News konnten nicht geladen werden. Bitte versuche es erneut.");

                this.news.set(PUBLIC_CONFIG.NEWS.ERROR(PUBLIC_CONFIG.FALLBACK_IMAGE_URL, "Unbekannter Fehler. Bitte versuche es erneut."));

                this.failedFetching.set(true);
            },
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("de-CH", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    formatTitleDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("de-DE", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    async sanitizePdfUrl(url: any): Promise<SafeResourceUrl> {
        const backupUrl = this.sanitizer.bypassSecurityTrustResourceUrl("about:blank");

        if (typeof url === "string") {
            const isTrusted = await this.sanitizerService.verifyUrlIsTrusted(url);

            if (isTrusted) {
                return this.sanitizer.bypassSecurityTrustResourceUrl(url);
            }
        }

        return backupUrl;
    }
}
