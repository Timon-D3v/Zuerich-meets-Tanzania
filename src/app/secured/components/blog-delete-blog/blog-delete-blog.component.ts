import { Component, inject, PLATFORM_ID, signal, OnInit } from "@angular/core";
import { NotificationService } from "../../../services/notification.service";
import { ApiEndpointResponse, DatabaseApiEndpointResponse } from "../../../..";
import { PopupSelectionInputComponent } from "../../../components/popup-selection-input/popup-selection-input.component";
import { PopupConfirmComponent } from "../../../components/popup-confirm/popup-confirm.component";
import { BlogService } from "../../../services/blog.service";

@Component({
    imports: [PopupSelectionInputComponent, PopupConfirmComponent],
    selector: "app-blog-delete-blog",
    styleUrl: "./blog-delete-blog.component.scss",
    templateUrl: "./blog-delete-blog.component.html",
})
export class BlogDeleteBlogComponent implements OnInit {
    blogTitles = signal<string[]>([]);
    selectedBlogTitle = signal<string | null>(null);

    selectionOpen = signal<boolean>(true);
    confirmationOpen = signal<boolean>(false);

    private blogService = inject(BlogService);
    private notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.getAllBlogTitles();
    }

    getAllBlogTitles(): void {
        const blogTitlesRequest = this.blogService.getAllBlogLinks();

        blogTitlesRequest.subscribe({
            next: (response: DatabaseApiEndpointResponse) => {
                if (response.error || response.data?.data === null || !Array.isArray(response.data?.data)) {
                    this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden: " + response.message);

                    return;
                }

                this.blogTitles.set((response.data.data as { title: string }[]).map((blog) => blog.title));
            },
            error: (error) => {
                console.error("Error while fetching blog titles:", error);
                this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });
    }

    deleteBlog(title: string): void {
        this.selectedBlogTitle.set(title);

        this.closeSelection();
        this.openConfirmation();
    }

    confirmDeletion(confirmation: boolean): void {
        this.closeConfirmation();

        if (!confirmation) {
            this.notificationService.info("Löschen abgebrochen", "Der Blog wurde nicht gelöscht.");

            return;
        }

        const title = this.selectedBlogTitle();

        if (title === null) {
            this.notificationService.error("Fehler beim Löschen", "Der Blog konnte nicht gelöscht werden, da kein Blog ausgewählt wurde.");

            return;
        }

        const request = this.blogService.deleteBlog(title);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler beim Löschen", "Der Blog konnte nicht gelöscht werden: " + response.message);

                    return;
                }

                this.notificationService.success("Blog gelöscht", `Der Blog mit dem Titel "${title}" wurde erfolgreich gelöscht.`);

                // Refresh the blog titles
                this.getAllBlogTitles();

                // Reset the current active blog edit if it was the deleted blog
                this.selectedBlogTitle.set(null);
            },
            error: (error: unknown) => {
                console.error("Error while deleting blog:", error);

                this.notificationService.error("Fehler beim Löschen", "Der Blog konnte nicht gelöscht werden. Bitte versuche es später erneut.");

                this.selectedBlogTitle.set(null);
            },
        });
    }

    openSelection(): void {
        this.selectionOpen.set(true);
    }

    closeSelection(): void {
        this.selectionOpen.set(false);
    }

    openConfirmation(): void {
        this.confirmationOpen.set(true);
    }

    closeConfirmation(): void {
        this.confirmationOpen.set(false);
    }
}
