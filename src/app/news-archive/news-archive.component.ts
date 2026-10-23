import { Component, inject, OnInit, signal } from "@angular/core";
import { GetLastXNewsIdsApiEndpointResponse, News } from "../..";
import { NewsService } from "../services/news.service";
import { NotificationService } from "../services/notification.service";
import { NewsComponent } from "../components/news/news.component";
import { LoadingComponent } from "../components/loading/loading.component";

@Component({
    selector: "app-news-archive",
    imports: [NewsComponent, LoadingComponent],
    templateUrl: "./news-archive.component.html",
    styleUrl: "./news-archive.component.scss",
})
export class NewsArchiveComponent implements OnInit {
    loaded = signal<number>(5);

    newsIds = signal<number[]>([]);

    failedFetching = signal<boolean>(false);

    private newsService = inject(NewsService);
    private notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.loadLastXNews(true);
    }

    loadLastXNews(initial: boolean = false): void {
        const request = this.newsService.getLastXNews(this.loaded());

        request.subscribe({
            next: (response: GetLastXNewsIdsApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", (initial ? "Das News-Archiv konnte nicht geladen werden: " : "Es konnten keine älteren News mehr geladen werden: ") + response.message);

                    this.failedFetching.set(true);

                    return;
                }

                this.newsIds.set(response.data);
                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while loading news archive:", error);
                this.notificationService.error("Fehler", "Das News-Archiv konnte nicht geladen werden. Bitte versuche es erneut.");

                this.failedFetching.set(true);
            },
        });
    }

    load(event: Event): void {
        event.preventDefault();

        this.loaded.update((value) => value + 5);

        this.loadLastXNews();
    }
}
