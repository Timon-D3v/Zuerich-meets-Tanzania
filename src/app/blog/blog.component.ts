import { Component, effect, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { PUBLIC_CONFIG } from "../../publicConfig";
import { Blog, GetBlogApiEndpointResponse } from "../..";
import { BlogService } from "../services/blog.service";
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
    selector: "app-blog",
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
    templateUrl: "./blog.component.html",
    styleUrl: "./blog.component.scss",
})
export class BlogComponent implements OnInit {
    private name = signal("");

    blog = signal<Blog>(PUBLIC_CONFIG.BLOGS.LOADING(this.name(), PUBLIC_CONFIG.FALLBACK_IMAGE_URL));

    failedFetching = signal<boolean>(false);

    private blogService = inject(BlogService);
    private notificationService = inject(NotificationService);

    private route = inject(ActivatedRoute);
    private router = inject(Router);

    private platformId = inject(PLATFORM_ID);

    private _updateContent = effect(() => {
        this.getBlog(this.name());
    });

    ngOnInit(): void {
        if (typeof this.route.snapshot.params["name"] !== "string") {
            this.notificationService.warn("Kein Titel", "Es konnte kein Blog geladen werden, da kein Titel angegeben wurde.");

            this.router.navigate(["/"]);

            return;
        }

        this.name.set(this.route.snapshot.params["name"]);

        this.route.params.subscribe({
            next: (params) => {
                const name = params["name"];

                if (typeof name !== "string") {
                    this.notificationService.warn("Kein Titel", "Es konnte kein Blog geladen werden, da kein Titel angegeben wurde.");

                    this.router.navigate(["/"]);

                    return;
                }

                this.name.set(name);
            },
            error: (error: unknown) => {
                console.error("Error while subscribing to route params:", error);
                this.notificationService.error("Fehler", "Es konnte kein Blog geladen werden. Bitte versuche es erneut.");

                this.router.navigate(["/"]);
            },
        });

        this.getBlog(this.name());
    }

    getBlog(name: string): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch when not in browser context.");

            this.blog.set(PUBLIC_CONFIG.BLOGS.ERROR(this.name().replaceAll("%20", " "), PUBLIC_CONFIG.FALLBACK_IMAGE_URL, "Cannot fetch when not in browser context."));

            this.failedFetching.set(true);

            return;
        }

        const request = this.blogService.getBlog(name);

        request.subscribe({
            next: (response: GetBlogApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler:", "Der Blog konnte nicht geladen werden: " + response.message);

                    this.router.navigate(["/"]);
                    this.failedFetching.set(true);

                    return;
                }

                this.blog.set(response.data);
                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while fetching blog:", error);
                this.notificationService.error("Fehler", "Der Blog konnte nicht geladen werden. Bitte versuche es erneut.");

                this.router.navigate(["/"]);
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
}
