import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { HeroComponent } from "../components/hero/hero.component";
import { NewsComponent } from "../components/news/news.component";
import { RouterLink } from "@angular/router";
import { CalendarComponent } from "../components/calendar/calendar.component";
import { BlogPreviewComponent } from "../components/blog-preview/blog-preview.component";
import { CalendarEvent, GetCalendarEventsApiEndpointResponse } from "../..";
import { CalendarService } from "../services/calendar.service";
import { isPlatformBrowser } from "@angular/common";
import { NotificationService } from "../services/notification.service";
import { BoardComponent } from "../components/board/board.component";
import { CustomMultipleButtonsComponent } from "../components/custom-multiple-buttons/custom-multiple-buttons.component";

@Component({
    selector: "app-home",
    imports: [HeroComponent, NewsComponent, RouterLink, CalendarComponent, BlogPreviewComponent, BoardComponent, CustomMultipleButtonsComponent],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
    HERO_IMAGE_URL = "/redirects/heroImage";
    readonly HERO_IMAGE_ALT = "Das Titelbild unserer Seite";

    readonly titleHtml = "Medizinische Hilfe<br>in Tanzania";
    readonly subtitle = "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren.";

    readonly newsTitle = "Aktuell:";

    private calendarService = inject(CalendarService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    numberOfEvents = signal(5);
    events = signal<CalendarEvent[]>([]);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot make API calls on the server side. Calendar events will not be loaded.");
            return;
        }

        this.getEvents();
    }

    loadMoreEvents(event: Event): void {
        event.preventDefault();

        this.numberOfEvents.update((n) => n + 5);

        this.getEvents();
    }

    getEvents(): void {
        const request = this.calendarService.getLastXEvents(this.numberOfEvents());

        request.subscribe({
            next: (response: GetCalendarEventsApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler:", "Die Kalenderdaten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.");

                    this.events.set([
                        {
                            startDate: new Date().toISOString(),
                            endDate: new Date().toISOString(),
                            title: "Fehler beim Laden der Kalenderdaten",
                            id: -1,
                        },
                    ]);

                    return;
                }

                this.events.set(response.data);
            },
            error: (error: unknown) => {
                console.error("Error while loading calendar events:", error);
                this.notificationService.error("Fehler", "Die Kalenderdaten konnten nicht geladen werden. Bitte versuche es erneut.");

                this.events.set([
                    {
                        startDate: new Date().toISOString(),
                        endDate: new Date().toISOString(),
                        title: "Fehler beim Laden der Kalenderdaten",
                        id: -1,
                    },
                ]);
            },
        });
    }
}
