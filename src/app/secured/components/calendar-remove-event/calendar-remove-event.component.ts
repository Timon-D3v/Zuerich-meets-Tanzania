import { Component, inject, PLATFORM_ID, signal, OnInit } from "@angular/core";
import { NotificationService } from "../../../services/notification.service";
import { ApiEndpointResponse, CalendarEvent, GetCalendarEventsApiEndpointResponse } from "../../../..";
import { CalendarService } from "../../../services/calendar.service";
import { PopupSelectionInputComponent } from "../../../components/popup-selection-input/popup-selection-input.component";
import { formatDateRangeString } from "../../../../shared/utils";

@Component({
    imports: [PopupSelectionInputComponent],
    selector: "app-calendar-remove-event",
    styleUrl: "./calendar-remove-event.component.scss",
    templateUrl: "./calendar-remove-event.component.html",
})
export class CalendarRemoveEventComponent implements OnInit {
    events = signal<CalendarEvent[]>([]);
    selectionOpen = signal<boolean>(true);

    private calendarService = inject(CalendarService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        this.getAllEvents();
    }

    getAllEvents(): void {
        const calendarRequest = this.calendarService.getAllEvents();

        calendarRequest.subscribe({
            next: (response: GetCalendarEventsApiEndpointResponse) => {
                if (response.error || response.data === null || !Array.isArray(response.data)) {
                    this.notificationService.error("Fehler beim Laden der Events", "Die Events konnten nicht geladen werden: " + response.message);

                    return;
                }

                this.events.set(response.data);
            },
            error: (error) => {
                console.error("Error while fetching calendar events:", error);
                this.notificationService.error("Fehler beim Laden der Events", "Die Events konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });
    }

    deleteEvent(formattedEvent: string): void {
        this.closeSelection();

        // Since we only have the formatted event, we have to find the corresponding event ID first
        const getEventId = (formattedEvent: string): number => {
            for (const event of this.events()) {
                if (`${formatDateRangeString(new Date(event.startDate), new Date(event.endDate))} - ${event.title}` === formattedEvent) {
                    return event.id;
                }
            }

            return -1; // Return -1 if no matching event is found
        };

        const eventId = getEventId(formattedEvent);

        if (eventId === -1) {
            this.notificationService.error("Event nicht gefunden", "Das Event konnte nicht gefunden werden. Bitte aktualisiere die Seite und versuche es erneut.");

            return;
        }

        const request = this.calendarService.deleteEvent(eventId);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler beim Löschen", "Das Event konnte nicht gelöscht werden: " + response.message);

                    this.closeSelection();

                    return;
                }

                this.notificationService.success("Event gelöscht", "Das Event wurde erfolgreich gelöscht.");

                // Refresh the events
                this.getAllEvents();
            },
            error: (error: unknown) => {
                console.error("Error while deleting event:", error);

                this.notificationService.error("Fehler beim Löschen", "Das Event konnte nicht gelöscht werden. Bitte versuche es später erneut.");
            },
        });
    }

    openSelection(): void {
        this.selectionOpen.set(true);
    }

    closeSelection(): void {
        this.selectionOpen.set(false);
    }

    getEventTitle(events: CalendarEvent[]): string[] {
        return events.map((event) => `${formatDateRangeString(new Date(event.startDate), new Date(event.endDate))} - ${event.title}`);
    }
}
