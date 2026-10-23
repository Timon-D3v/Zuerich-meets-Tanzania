import { Component, signal, inject, PLATFORM_ID, OnInit } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CalendarEvent } from "../../..";
import { CalendarItemComponent } from "../calendar-item/calendar-item.component";
import { CalendarService } from "../../services/calendar.service";
import { NotificationService } from "../../services/notification.service";
import { GetCalendarEventsApiEndpointResponse } from "../../..";
import { LoadingComponent } from "../loading/loading.component";

@Component({
    selector: "app-calendar",
    imports: [CalendarItemComponent, LoadingComponent],
    templateUrl: "./calendar.component.html",
    styleUrl: "./calendar.component.scss",
})
export class CalendarComponent implements OnInit {
    events = signal<CalendarEvent[]>([]);

    private calendarService = inject(CalendarService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    numberOfEvents = signal(5);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot make API calls on the server side. Calendar events will not be loaded.");

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
