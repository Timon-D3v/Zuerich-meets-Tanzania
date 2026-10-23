import { Component, inject, OnInit, signal, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GalleryService } from "../services/gallery.service";
import { NotificationService } from "../services/notification.service";
import { GetGalleryImagesApiEndpointResponse, Gallery } from "../..";
import { HeroComponent } from "../components/hero/hero.component";
import { GalleryImageComponent } from "../components/gallery-image/gallery-image.component";
import { GalleryImagePreviewComponent } from "../components/gallery-image-preview/gallery-image-preview.component";
import { LoadingComponent } from "../components/loading/loading.component";
import { PUBLIC_CONFIG } from "../../publicConfig";
import { isPlatformBrowser } from "@angular/common";

@Component({
    selector: "app-gallery",
    imports: [HeroComponent, GalleryImageComponent, GalleryImagePreviewComponent, LoadingComponent],
    templateUrl: "./gallery.component.html",
    styleUrl: "./gallery.component.scss",
})
export class GalleryComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];

    heroImage = signal<string>(PUBLIC_CONFIG.FALLBACK_IMAGE_URL);
    name = signal<string>("");
    gallery = signal<Gallery>({
        id: -1,
        title: "Laden...",
        subtitle: "",
        date: "2000-01-01T00:00:01.000Z",
        data: [],
    });

    currentOpenIndex = signal<number>(-1);

    failedFetching = signal<boolean>(false);

    private galleryService = inject(GalleryService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        this.route.paramMap.subscribe(async (params) => {
            const name = params.get("name");

            if (name === null) {
                this.router.navigate(["/"]);
                return;
            }

            this.name.set(decodeURIComponent(this.route.snapshot.params["name"]));

            this.getGallery();

            this.heroImage.set(await this.generateObjectUrl(this.COLORS));
        });
    }

    getGallery(): void {
        const request = this.galleryService.getGalleryWithName(this.name());

        request.subscribe({
            next: (response: GetGalleryImagesApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler:", "Diese Galerie konnte nicht geladen werden: " + response.message);

                    this.failedFetching.set(true);

                    this.router.navigate(["/"]);

                    return;
                }

                this.gallery.set(response.data || this.gallery());

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while loading gallery:", error);
                this.notificationService.error("Fehler:", "Diese Galerie konnte nicht geladen werden. Bitte versuche es erneut.");

                this.failedFetching.set(true);

                this.router.navigate(["/"]);
            },
        });
    }

    async generateObjectUrl(colors: string[]): Promise<string> {
        if (!isPlatformBrowser(this.platformId)) {
            throw new Error("generateObjectUrl can only be called in the browser");
        }

        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;

        const ctx = canvas.getContext("2d");

        const color = colors[Math.floor(Math.random() * colors.length)];

        if (ctx === null) {
            throw new Error("Canvas context is null");
        }

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 100, 100);

        const blob = await new Promise((resolve: (blob: Blob | null) => void) => canvas.toBlob(resolve, "image/png"));

        if (blob === null) {
            throw new Error("Failed to create blob from canvas");
        }

        return URL.createObjectURL(blob);
    }

    openImagePreview(event: Event, index: number): void {
        event.preventDefault();
        event.stopPropagation();

        this.currentOpenIndex.set(index);

        const file = this.gallery().data[index];

        if (!file) {
            this.notificationService.error("Fehler:", "Die Datei konnte nicht gefunden werden.");

            return;
        }

        console.log("Opening image preview for file:", file);
    }

    closeImagePreview(): void {
        this.currentOpenIndex.set(-1);
    }

    showNextImage(): void {
        if (this.currentOpenIndex() === -1 || this.currentOpenIndex() === this.gallery().data.length - 1) {
            this.currentOpenIndex.set(0);
        } else {
            this.currentOpenIndex.update((currentIndex) => currentIndex + 1);
        }
    }

    showPreviousImage(): void {
        if (this.currentOpenIndex() === -1) {
            this.currentOpenIndex.set(0);
        } else if (this.currentOpenIndex() === 0) {
            this.currentOpenIndex.set(this.gallery().data.length - 1);
        } else {
            this.currentOpenIndex.update((currentIndex) => currentIndex - 1);
        }
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
