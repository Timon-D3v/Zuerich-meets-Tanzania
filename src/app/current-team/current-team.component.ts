import { Component, inject, OnInit, PLATFORM_ID, signal } from "@angular/core";
import { TeamService } from "../services/team.service";
import { GetTeamApiEndpointResponse, AssembledTeam } from "../..";
import { NotificationService } from "../services/notification.service";
import { PUBLIC_CONFIG } from "../../publicConfig";
import { LoadingComponent } from "../components/loading/loading.component";
import { HeroComponent } from "../components/hero/hero.component";
import { isPlatformBrowser } from "@angular/common";
import { TeamComponent } from "../components/team/team.component";

@Component({
    selector: "app-current-team",
    imports: [LoadingComponent, HeroComponent, TeamComponent],
    templateUrl: "./current-team.component.html",
    styleUrl: "./current-team.component.scss",
})
export class CurrentTeamComponent implements OnInit {
    team = signal<AssembledTeam>({
        id: -1,
        motto: "",
        text: "",
        picture: "",
        members: [],
        date: "",
    });

    failedFetching = signal<boolean>(false);

    private teamService = inject(TeamService);
    private notificationService = inject(NotificationService);

    private platformId = inject(PLATFORM_ID);

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) {
            console.error("Cannot fetch when not in browser context.");

            this.failedFetching.set(true);

            this.team.set({
                id: -2,
                motto: "Fehler beim Laden des Teams",
                text: "",
                picture: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                members: [],
                date: "",
            });

            return;
        }

        this.loadCurrentTeam();
    }

    loadCurrentTeam(): void {
        const request = this.teamService.getCurrentTeam();

        request.subscribe({
            next: (response: GetTeamApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler beim Laden des Teams:", response.message);

                    this.team.set({
                        id: -2,
                        motto: "Fehler beim Laden des Teams",
                        text: "",
                        picture: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                        members: [],
                        date: "",
                    });

                    this.failedFetching.set(true);

                    return;
                }

                this.team.set(response.data);

                this.failedFetching.set(false);
            },
            error: (error: unknown) => {
                console.error("Error while loading current team:", error);
                this.notificationService.error("Fehler beim Laden des Teams:", "Das aktuelle Team konnte nicht geladen werden. Bitte versuche es erneut.");

                this.team.set({
                    id: -2,
                    motto: "Fehler beim Laden des Teams",
                    text: "",
                    picture: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                    members: [],
                    date: "",
                });

                this.failedFetching.set(true);
            },
        });
    }
}
