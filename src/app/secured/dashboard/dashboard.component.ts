import { Component, inject, OnInit, PLATFORM_ID, signal, WritableSignal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Subject, take } from "rxjs";
import {
    ApiEndpointResponse,
    BlogContent,
    CustomImageWithTextElement,
    DashboardEditTypes,
    DashboardNavigationOptions,
    DatabaseApiEndpointResponse,
    GetAllBlogsApiEndpointResponse,
    GetAllNewsApiEndpointResponse,
    GetAllStaticSitesApiEndpointResponse,
    GetBlogApiEndpointResponse,
    GetStaticSiteApiEndpointResponse,
    GetTeamApiEndpointResponse,
    News,
    StaticSite,
    StaticSiteNames,
    CustomTableElement,
    CustomSourceElement,
    CustomMultipleButtonsElement,
    CustomMultipleListsElement,
} from "../../..";
import { PUBLIC_CONFIG } from "../../../publicConfig";
import { TeamService } from "../../services/team.service";
import { BlogService } from "../../services/blog.service";
import { EditService } from "../../services/edit.service";
import { SubpagesService } from "../../services/subpages.service";
import { NotificationService } from "../../services/notification.service";
import { AdminNavElementComponent } from "../components/admin-nav-element/admin-nav-element.component";
import { AdminPasswordsPageComponent } from "../components/admin-passwords-page/admin-passwords-page.component";
import { AdminHomepagePicturePageComponent } from "../components/admin-homepage-picture-page/admin-homepage-picture-page.component";
import { EditStaticSiteComponent } from "../components/edit-static-site/edit-static-site.component";
import { AdminAddAdminComponent } from "../components/admin-add-admin/admin-add-admin.component";
import { AdminRemoveAdminComponent } from "../components/admin-remove-admin/admin-remove-admin.component";
import { AdminCreateAccountComponent } from "../components/admin-create-account/admin-create-account.component";
import { StatsWebsiteAnalyticsComponent } from "../components/stats-website-analytics/stats-website-analytics.component";
import { StatsUserListComponent } from "../components/stats-user-list/stats-user-list.component";
import { DonationsAllTimeDonationsListComponent } from "../components/donations-all-time-donations-list/donations-all-time-donations-list.component";
import { DonationsDeleteShopItemComponent } from "../components/donations-delete-shop-item/donations-delete-shop-item.component";
import { DonationsCreateShopItemComponent } from "../components/donations-create-shop-item/donations-create-shop-item.component";
import { DonationsPushDonationMeterComponent } from "../components/donations-push-donation-meter/donations-push-donation-meter.component";
import { DonationsRemoveDonationMeterComponent } from "../components/donations-remove-donation-meter/donations-remove-donation-meter.component";
import { DonationsCreateDonationMeterComponent } from "../components/donations-create-donation-meter/donations-create-donation-meter.component";
import { DonationsFormEntriesComponent } from "../components/donations-form-entries/donations-form-entries.component";
import { MembersAddManualMemberComponent } from "../components/members-add-manual-member/members-add-manual-member.component";
import { MembersRemoveManualMemberComponent } from "../components/members-remove-manual-member/members-remove-manual-member.component";
import { MembersMembersListComponent } from "../components/members-members-list/members-members-list.component";
import { MembersManualMembersListComponent } from "../components/members-manual-members-list/members-manual-members-list.component";
import { MembersStripeMembersListComponent } from "../components/members-stripe-members-list/members-stripe-members-list.component";
import { GalleryEditImagesComponent } from "../components/gallery-edit-images/gallery-edit-images.component";
import { GalleryDeleteGalleryComponent } from "../components/gallery-delete-gallery/gallery-delete-gallery.component";
import { GalleryCreateGalleryComponent } from "../components/gallery-create-gallery/gallery-create-gallery.component";
import { TeamRemoveMemberComponent } from "../components/team-remove-member/team-remove-member.component";
import { TeamAddMemberComponent } from "../components/team-add-member/team-add-member.component";
import { TeamCreateTeamComponent } from "../components/team-create-team/team-create-team.component";
import { CalendarCreateEventComponent } from "../components/calendar-create-event/calendar-create-event.component";
import { CalendarRemoveEventComponent } from "../components/calendar-remove-event/calendar-remove-event.component";
import { NewsEditNewsComponent } from "../components/news-edit-news/news-edit-news.component";
import { PopupTitleInputComponent } from "../../components/popup-title-input/popup-title-input.component";
import { PopupTextInputComponent } from "../../components/popup-text-input/popup-text-input.component";
import { PopupImageInputComponent } from "../../components/popup-image-input/popup-image-input.component";
import { PopupMultipleImagesInputComponent } from "../../components/popup-multiple-images-input/popup-multiple-images-input.component";
import { PopupSelectionInputComponent } from "../../components/popup-selection-input/popup-selection-input.component";
import { PopupConfirmComponent } from "../../components/popup-confirm/popup-confirm.component";
import { PopupAlertComponent } from "../../components/popup-alert/popup-alert.component";
import { LoadingComponent } from "../../components/loading/loading.component";
import { NewsService } from "../../services/news.service";
import { PopupFileInputComponent } from "../../components/popup-file-input/popup-file-input.component";
import { AdminFileExplorerComponent } from "../components/admin-file-explorer/admin-file-explorer.component";
import { PopupTableInputComponent } from "../../components/popup-table-input/popup-table-input.component";
import { PopupMultipleButtonsInputComponent } from "../../components/popup-multiple-buttons-input/popup-multiple-buttons-input.component";
import { PopupMultipleListsInputComponent } from "../../components/popup-multiple-lists-input/popup-multiple-lists-input.component";
import { AdminEditBoardComponent } from "../components/admin-edit-board/admin-edit-board.component";
import { GalleryEditDetailsComponent } from "../components/gallery-edit-details/gallery-edit-details.component";
import { TeamEditTeamComponent } from "../components/team-edit-team/team-edit-team.component";
import { TeamEditMembersComponent } from "../components/team-edit-members/team-edit-members.component";
import { BlogDeleteBlogComponent } from "../components/blog-delete-blog/blog-delete-blog.component";

@Component({
    selector: "app-dashboard",
    imports: [
        AdminNavElementComponent,
        AdminPasswordsPageComponent,
        AdminHomepagePicturePageComponent,
        EditStaticSiteComponent,
        AdminAddAdminComponent,
        AdminRemoveAdminComponent,
        MembersAddManualMemberComponent,
        MembersRemoveManualMemberComponent,
        MembersMembersListComponent,
        MembersManualMembersListComponent,
        MembersStripeMembersListComponent,
        AdminCreateAccountComponent,
        BlogDeleteBlogComponent,
        StatsWebsiteAnalyticsComponent,
        StatsUserListComponent,
        DonationsAllTimeDonationsListComponent,
        DonationsDeleteShopItemComponent,
        DonationsCreateShopItemComponent,
        DonationsPushDonationMeterComponent,
        DonationsRemoveDonationMeterComponent,
        DonationsCreateDonationMeterComponent,
        DonationsFormEntriesComponent,
        GalleryEditImagesComponent,
        GalleryEditDetailsComponent,
        GalleryDeleteGalleryComponent,
        GalleryCreateGalleryComponent,
        TeamCreateTeamComponent,
        TeamEditTeamComponent,
        TeamRemoveMemberComponent,
        TeamAddMemberComponent,
        TeamEditMembersComponent,
        CalendarCreateEventComponent,
        CalendarRemoveEventComponent,
        NewsEditNewsComponent,
        PopupTitleInputComponent,
        PopupTextInputComponent,
        PopupImageInputComponent,
        PopupMultipleImagesInputComponent,
        PopupSelectionInputComponent,
        PopupConfirmComponent,
        PopupAlertComponent,
        LoadingComponent,
        PopupFileInputComponent,
        AdminFileExplorerComponent,
        PopupTableInputComponent,
        PopupMultipleButtonsInputComponent,
        PopupMultipleListsInputComponent,
        AdminEditBoardComponent,
    ],
    templateUrl: "./dashboard.component.html",
    styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
    /*
     * ===============================================================
     *                           GLOBAL
     * ===============================================================
     */

    mobileNavOpen = signal<boolean>(false);

    /*
     * ===============================================================
     *                      BLOG TITLE LIST
     * ===============================================================
     */

    allEditableBlogs: string[] = [];
    allEditableNews: string[] = [];

    /*
     * ===============================================================
     *                        ACTIVE SIGNALS
     * ===============================================================
     */

    currentActiveSection = signal<string>("stats-website-analytics");
    currentActiveNavigation = signal<DashboardNavigationOptions>("main");
    currentActiveSiteEdit = signal<StaticSiteNames>("vision");
    currentActiveBlogEdit = signal<string>("awaitSelection");
    currentActiveNewsEdit = signal<string>("awaitSelection");
    currentActionToPerform = signal<DashboardEditTypes>("addTitle");
    currentIndexToEdit = signal<number>(-1);

    /*
     * ===============================================================
     *                     SUBMISSION BUTTON
     * ===============================================================
     */

    submitEditsButton = signal<string>("Abschliessen");

    /*
     * ===============================================================
     *                       OPEN SIGNALS
     * ===============================================================
     */

    titleInputOpen = signal<boolean>(false);
    textInputOpen = signal<boolean>(false);
    imageInputOpen = signal<boolean>(false);
    fileInputOpen = signal<boolean>(false);
    multipleImagesInputOpen = signal<boolean>(false);
    tableInputOpen = signal<boolean>(false);
    multipleButtonsInputOpen = signal<boolean>(false);
    multipleListsInputOpen = signal<boolean>(false);
    selectionInputOpen = signal<boolean>(false);
    confirmInputOpen = signal<boolean>(false);
    alertOpen = signal<boolean>(false);

    titleEditInputOpen = signal<boolean>(false);
    textEditInputOpen = signal<boolean>(false);
    imageEditInputOpen = signal<boolean>(false);
    multipleImagesEditInputOpen = signal<boolean>(false);
    fileEditInputOpen = signal<boolean>(false);
    tableEditInputOpen = signal<boolean>(false);
    multipleButtonsEditInputOpen = signal<boolean>(false);
    multipleListsEditInputOpen = signal<boolean>(false);

    /*
     * ===============================================================
     *                         OBSERVABLES
     * ===============================================================
     */

    confirmInputObservable = new Subject<boolean>();
    selectionInputObservable = new Subject<string>();

    /*
     * ===============================================================
     *                       ALERT INPUTS
     * ===============================================================
     */

    alertTitle = signal<string>("");
    alertMessage = signal<string>("");
    alertButtonText = signal<string>("");

    titleInputTitle = signal<string>("");
    titleInputDescription = signal<string>("");
    titleInputLabel = signal<string>("");
    titleInputPlaceholder = signal<string>("");

    confirmInputTitle = signal<string>("");
    confirmInputDescription = signal<string>("");
    confirmInputAcceptButtonText = signal<string>("");
    confirmInputCancelButtonText = signal<string>("");
    confirmInputEqualOptions = signal<boolean>(false);

    titleEditInputTitle = signal<string>("");
    titleEditInputDescription = signal<string>("");
    titleEditInputLabel = signal<string>("");
    titleEditInputPlaceholder = signal<string>("");
    titleEditInputValue = signal<string>("");

    textEditInputTitle = signal<string>("");
    textEditInputDescription = signal<string>("");
    textEditInputLabel = signal<string>("");
    textEditInputPlaceholder = signal<string>("");
    textEditInputValue = signal<string>("");

    imageEditInputTitle = signal<string>("");
    imageEditInputDescription = signal<string>("");
    imageEditInputLabel = signal<string>("");
    imageEditInputPlaceholderUrl = signal<string>("");

    multipleImagesEditInputTitle = signal<string>("");
    multipleImagesEditInputDescription = signal<string>("");
    multipleImagesEditInputLabel = signal<string>("");
    multipleImagesEditInputValue = signal<{ imageUrl: string; imageAlt: string }[]>([]);

    multipleButtonsEditInputTitle = signal<string>("");
    multipleButtonsEditInputDescription = signal<string>("");
    multipleButtonsEditInputValue = signal<CustomMultipleButtonsElement["buttons"]>([]);

    multipleListsEditInputTitle = signal<string>("");
    multipleListsEditInputDescription = signal<string>("");
    multipleListsEditInputValue = signal<CustomMultipleListsElement["lists"]>([]);

    selectionInputTitle = signal<string>("");
    selectionInputDescription = signal<string>("");
    selectionInputLabel = signal<string>("");
    selectionInputPlaceholder = signal<string>("");
    selectionInputOptions = signal<string[]>([]);

    fileInputAccept = signal<string>("*");
    fileEditInputAccept = signal<string>("*");
    fileEditInputDescription = signal<string>("");
    fileEditInputTitle = signal<string>("");

    tableEditInputTitle = signal<string>("");
    tableEditInputDescription = signal<string>("");
    tableEditInputInitialHeaders = signal<CustomTableElement["headers"]>([]);
    tableEditInputInitialRows = signal<CustomTableElement["rows"]>([]);
    tableEditInputInitialSourceName = signal<string>("");
    tableEditInputInitialSourceUrl = signal<string>("");

    /*
     * ===============================================================
     *                     SHORT TERM CACHE
     * ===============================================================
     */

    textWithImageTextCache = signal<string>("");
    sourceNameCache = signal<string>("");

    /*
     * ===============================================================
     *                    STATIC SITES EDIT CACHE
     * ===============================================================
     */

    siteEdits = {
        "vision": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "board": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "beginning": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "finances": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "income-statement": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "general-meeting": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "statutes": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "zurich-meets-tanzania": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "tanzania-meets-zurich": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "mbuzi": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "gynecology": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "meducation": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "bajaji": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "cardiology": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "surgery": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        "history": signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
    };

    siteEditImages: { [key: string]: { url: string; file: File }[] } = {
        "vision": [],
        "board": [],
        "beginning": [],
        "finances": [],
        "income-statement": [],
        "general-meeting": [],
        "statutes": [],
        "zurich-meets-tanzania": [],
        "tanzania-meets-zurich": [],
        "mbuzi": [],
        "gynecology": [],
        "meducation": [],
        "bajaji": [],
        "cardiology": [],
        "surgery": [],
        "history": [],
    };

    /*
     * ===============================================================
     *                       BLOG EDIT CACHE
     * ===============================================================
     */

    blogs: { newBlog: WritableSignal<BlogContent>; existingBlogs: { [key: string]: WritableSignal<BlogContent> } } = {
        newBlog: signal<BlogContent>({ metadata: { title: "Bearbeite mich :)", subtitle: "", author: "", imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL, imageAlt: "" }, data: [] }),
        existingBlogs: {
            awaitSelection: signal<StaticSite>({ metadata: { title: "", subtitle: "", author: "", imageUrl: "", imageAlt: "" }, data: [] }),
        },
    };

    blogImages: { newBlog: { url: string; file: File }[]; existingBlogs: { [key: string]: { url: string; file: File }[] } } = {
        newBlog: [],
        existingBlogs: {},
    };

    /*
     * ===============================================================
     *                       NEWS EDIT CACHE
     * ===============================================================
     */

    news: { newNews: WritableSignal<News>; existingNews: { [key: string]: WritableSignal<News> } } = {
        newNews: signal<News>({ id: -1, date: "1900/12/22", data: { type: "image", imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL, imageAlt: "", imagePosition: "center", content: [] } }),
        existingNews: {
            awaitSelection: signal<News>({ id: -2, date: "1900/12/22", data: { type: "image", imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL, imageAlt: "", imagePosition: "center", content: [] } }),
        },
    };

    newsImages: { newNews: { url: string; file: File }[]; existingNews: { [key: string]: { url: string; file: File }[] } } = {
        newNews: [],
        existingNews: {},
    };

    /*
     * ===============================================================
     *                          SERVICES
     * ===============================================================
     */

    private teamService = inject(TeamService);
    private blogService = inject(BlogService);
    private newsService = inject(NewsService);
    private editService = inject(EditService);
    private subpagesService = inject(SubpagesService);
    private notificationService = inject(NotificationService);

    /*
     * ===============================================================
     *                         PLATFORM ID
     * ===============================================================
     */

    private platformId = inject(PLATFORM_ID);

    /*
     * ===============================================================
     *                       GLOBAL FUNCTIONS
     * ===============================================================
     */

    ngOnInit(): void {
        // Get all static sites for editing
        const staticSitesRequest = this.subpagesService.getAllStaticSites();

        staticSitesRequest.subscribe({
            next: (response: GetAllStaticSitesApiEndpointResponse) => {
                if (response.error || response.data === null || !Array.isArray(response.data)) {
                    this.notificationService.error("Fehler beim Laden der Seiten", "Die statischen Seiten konnten nicht geladen werden: " + response.message);

                    return;
                }

                for (const site of response.data) {
                    this.siteEdits[site.title].set(site.data);
                    this.siteEditImages[site.title] = [];
                }
            },
            error: (error) => {
                console.error("Error while fetching static sites:", error);
                this.notificationService.error("Fehler beim Laden der Seiten", "Die statischen Seiten konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });

        // Get all existing blog titles for editing
        this.getAllBlogTitles();

        // Get all blogs for editing
        const getAllBlogsRequest = this.blogService.getAllBlogs();

        getAllBlogsRequest.subscribe({
            next: (response: GetAllBlogsApiEndpointResponse) => {
                if (response.error || response.data === null) {
                    this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden: " + response.message);

                    return;
                }

                for (const blog of response.data) {
                    this.blogs.existingBlogs[blog.title] = signal<BlogContent>(blog.data);
                    this.blogImages.existingBlogs[blog.title] = [];
                }
            },
            error: (error) => {
                console.error("Error while fetching blogs:", error);
                this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });

        // Get all news for editing
        this.getAllNews();
    }

    getAllBlogTitles(): void {
        const blogTitlesRequest = this.blogService.getAllBlogLinks();

        blogTitlesRequest.subscribe({
            next: (response: DatabaseApiEndpointResponse) => {
                if (response.error || response.data?.data === null || !Array.isArray(response.data?.data)) {
                    this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden: " + response.message);

                    return;
                }

                this.allEditableBlogs = (response.data.data as { title: string }[]).map((blog) => blog.title);
            },
            error: (error) => {
                console.error("Error while fetching blog titles:", error);
                this.notificationService.error("Fehler beim Laden der Blogs", "Die Blogs konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });
    }

    getAllNews(): void {
        this.allEditableNews = [];

        const newsRequest = this.newsService.getAllNews();

        newsRequest.subscribe({
            next: (response: GetAllNewsApiEndpointResponse) => {
                if (response.error || response.data === null || !Array.isArray(response.data)) {
                    this.notificationService.error("Fehler beim Laden der News", "Die News konnten nicht geladen werden: " + response.message);

                    return;
                }

                const getNewsName = (news: News, round = 0): string => {
                    const date = new Date(news["date"]).toLocaleDateString();

                    const newsName = round === 0 ? date : `${date} (${round})`;

                    if (this.allEditableNews.includes(newsName)) {
                        return getNewsName(news, round + 1);
                    }

                    return newsName;
                };

                for (const news of response.data) {
                    const newsName = getNewsName(news);

                    this.allEditableNews.push(newsName);

                    this.news.existingNews[newsName] = signal<News>(news);
                    this.newsImages.existingNews[newsName] = [];
                }
            },
            error: (error) => {
                console.error("Error while fetching news:", error);
                this.notificationService.error("Fehler beim Laden der News", "Die News konnten nicht geladen werden. Bitte versuche es später erneut.");
            },
        });
    }

    toggleMobileNav(): void {
        this.mobileNavOpen.update((value) => !value);
    }

    /*
     * ===============================================================
     *                      HELPER FUNCTIONS
     * ===============================================================
     */

    getIndicesToRemoveUnusedImagesFromStorage(
        content: object,
        images: {
            url: string;
            file: File;
        }[],
    ): number[] {
        const json = JSON.stringify(content);

        const indicesToRemove: number[] = [];

        for (let i = 0; i < images.length; i++) {
            if (!json.includes(images[i].url)) {
                indicesToRemove.push(i);
            }
        }

        return indicesToRemove;
    }

    async awaitConfirmation(title: string, message: string, accept: string = "Ok", reject: string = "Abbrechen", equalOptions: boolean = false): Promise<boolean> {
        this.confirmInputOpen.set(true);

        this.confirmInputTitle.set(title);
        this.confirmInputDescription.set(message);
        this.confirmInputAcceptButtonText.set(accept);
        this.confirmInputCancelButtonText.set(reject);
        this.confirmInputEqualOptions.set(equalOptions);

        return new Promise<boolean>((resolve) => {
            this.confirmInputObservable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result || false);
                },
                error: (error) => {
                    console.error("Error in awaitConfirmation:", error);

                    // If an error occurs, just go save and don't confirm the action, so resolve with false
                    resolve(false);
                },
            });
        });
    }

    async awaitSelection(options: string[], title: string, message: string, label: string, placeholder: string): Promise<string> {
        this.selectionInputOpen.set(true);

        this.selectionInputTitle.set(title);
        this.selectionInputDescription.set(message);
        this.selectionInputLabel.set(label);
        this.selectionInputPlaceholder.set(placeholder);
        this.selectionInputOptions.set(options);

        return new Promise<string>((resolve) => {
            this.selectionInputObservable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (error) => {
                    console.error("Error in awaitSelection:", error);

                    this.notificationService.error("Fehler bei der Auswahl", "Es ist ein Fehler bei der Auswahl aufgetreten. Bitte versuche es erneut.");

                    // If an error occurs, just go save and return an empty string
                    resolve("");
                },
            });
        });
    }

    showAlert(title: string, message: string, buttonText: string = "Schliessen"): void {
        this.alertOpen.set(true);

        this.alertTitle.set(title);
        this.alertMessage.set(message);
        this.alertButtonText.set(buttonText);
    }

    handleAlertClose(): void {
        this.alertOpen.set(false);
    }

    /*
     * ===============================================================
     *                     NAVIGATION FUNCTIONS
     * ===============================================================
     */

    setCurrentActiveNavigation(navigation: DashboardNavigationOptions): void {
        this.currentActiveNavigation.set(navigation);
    }

    activate(section: string): void {
        this.currentActiveSection.set(section);

        // Close the mobile nav after selecting an item
        this.mobileNavOpen.set(false);

        // Scroll to the top of the page
        if (isPlatformBrowser(this.platformId)) {
            window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        }
    }

    generateActivateFunction(section: string, navigation: DashboardNavigationOptions = "main"): Function {
        const _this = this;

        const activationFunction = () => {
            _this.activate(section);
            _this.setCurrentActiveNavigation(navigation);

            if (_this.currentActiveSection().startsWith("edit-static-")) {
                _this.currentActiveSiteEdit.set(section.replace("edit-static-", "") as StaticSiteNames);
            }
        };

        return activationFunction;
    }

    generateSelectBlogToEditFunction(): Function {
        const _this = this;

        const activationFunction = () => {
            _this.selectBlogToEdit();
            _this.generateActivateFunction("blog-edit-blog", "edit-blog")();
        };

        return activationFunction;
    }

    selectBlogToEdit(): void {
        this.selectionInputOpen.set(true);

        this.selectionInputTitle.set("Blog bearbeiten");
        this.selectionInputDescription.set("Bitte gib den Titel des Blogs ein, den du bearbeiten möchtest.");
        this.selectionInputLabel.set("Titel:");
        this.selectionInputPlaceholder.set("Titel suchen");
        this.selectionInputOptions.set(this.allEditableBlogs);
    }

    generateSelectNewsToEditFunction(): Function {
        const _this = this;

        const activationFunction = () => {
            _this.selectNewsToEdit();
            _this.generateActivateFunction("news-edit-news", "edit-news")();
        };

        return activationFunction;
    }

    selectNewsToEdit(): void {
        this.selectionInputOpen.set(true);

        this.selectionInputTitle.set("News bearbeiten");
        this.selectionInputDescription.set("Bitte gib das Datum der News ein, die du bearbeiten möchtest.");
        this.selectionInputLabel.set("Datum:");
        this.selectionInputPlaceholder.set("Datum suchen");
        this.selectionInputOptions.set(this.allEditableNews);
    }

    /*
     * ===============================================================
     *                       CLOSE FUNCTIONS
     * ===============================================================
     */

    async closeEditNavigation(): Promise<void> {
        const confirmClose = await this.awaitConfirmation(
            "Verlassen bestätigen",
            "Vergiss nicht deine Arbeit zu speichern.\nMöchtest du die aktuelle Seite wirklich verlassen? (Dein Fortschritt wird gespeichert, solange du das Dashboard nicht verlässt oder neu lädst)",
            "Verlassen",
            "Abbrechen",
        );

        if (!confirmClose) {
            return;
        }

        this.setCurrentActiveNavigation("main");
    }

    closeNewsEditNavigation(): void {
        this.closeEditNavigation();
    }

    async closePopup(): Promise<void> {
        const yes = await this.awaitConfirmation("Popup schliessen", "Möchtest du das Popup wirklich schliessen? Alle ungespeicherten Änderungen gehen verloren.", "Schliessen", "Abbrechen");

        if (!yes) {
            return;
        }

        this.closePopupWithoutConfirmation();
    }

    closePopupWithoutConfirmation(): void {
        this.titleInputOpen.set(false);
        this.textInputOpen.set(false);
        this.imageInputOpen.set(false);
        this.fileInputOpen.set(false);
        this.multipleImagesInputOpen.set(false);
        this.multipleButtonsInputOpen.set(false);
        this.multipleListsInputOpen.set(false);
        this.tableInputOpen.set(false);

        this.titleEditInputOpen.set(false);
        this.textEditInputOpen.set(false);
        this.imageEditInputOpen.set(false);
        this.multipleImagesEditInputOpen.set(false);
        this.multipleButtonsEditInputOpen.set(false);
        this.multipleListsEditInputOpen.set(false);
        this.fileEditInputOpen.set(false);
        this.tableEditInputOpen.set(false);

        this.selectionInputOpen.set(false);
    }

    /*
     * ===============================================================
     *                    EDIT HELPER FUNCTION
     * ===============================================================
     */

    getCurrentEditSignal(): WritableSignal<StaticSite | BlogContent> {
        switch (this.currentActiveNavigation()) {
            case "edit-sites":
                return this.siteEdits[this.currentActiveSiteEdit()];
            case "edit-blog":
                return this.blogs.existingBlogs[this.currentActiveBlogEdit()];
            case "create-blog":
                return this.blogs.newBlog;
            default:
                throw new Error("Unbekannte Navigation: " + this.currentActiveNavigation());
        }
    }

    getCurrentNewsEditSignal(): WritableSignal<News> {
        switch (this.currentActiveNavigation()) {
            case "create-news":
                return this.news.newNews;
            case "edit-news":
                return this.news.existingNews[this.currentActiveNewsEdit()];
            default:
                throw new Error("Unbekannte Navigation: " + this.currentActiveNavigation());
        }
    }

    getCurrentImageStorage(): { url: string; file: File }[] {
        switch (this.currentActiveNavigation()) {
            case "edit-sites":
                return this.siteEditImages[this.currentActiveSiteEdit()];
            case "create-blog":
                return this.blogImages.newBlog;
            case "edit-blog":
                return this.blogImages.existingBlogs[this.currentActiveBlogEdit()];
            case "create-news":
                return this.newsImages.newNews;
            case "edit-news":
                return this.newsImages.existingNews[this.currentActiveNewsEdit()];
            default:
                throw new Error("Unbekannte Navigation: " + this.currentActiveNavigation());
        }
    }

    /*
     * ===============================================================
     *                   SUBMIT EDITS FUNCTIONS
     * ===============================================================
     */

    submitEdits(): void {
        if (this.currentActiveNavigation() === "edit-sites") {
            this.submitSiteEdits();
        } else if (this.currentActiveNavigation() === "edit-blog") {
            this.submitBlogEdits();
        } else if (this.currentActiveNavigation() === "create-blog") {
            this.submitNewBlog();
        } else if (this.currentActiveNavigation() === "create-news") {
            this.submitNewNews();
        } else if (this.currentActiveNavigation() === "edit-news") {
            this.submitNewsEdits();
        } else {
            this.notificationService.error("Fehler beim Speichern", "Unbekannte Navigation: " + this.currentActiveNavigation());
        }
    }

    submitSiteEdits(): void {
        this.submitEditsButton.set("Speichern...");

        // Remove unused images from storage
        const indicesToRemove = this.getIndicesToRemoveUnusedImagesFromStorage(this.siteEdits[this.currentActiveSiteEdit()](), this.siteEditImages[this.currentActiveSiteEdit()]);

        for (const index of indicesToRemove.reverse()) {
            this.siteEditImages[this.currentActiveSiteEdit()].splice(index, 1);
        }

        // Submit the edits to the backend
        const request = this.subpagesService.updateStaticSite(this.currentActiveSiteEdit(), this.siteEdits[this.currentActiveSiteEdit()](), this.siteEditImages[this.currentActiveSiteEdit()]);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                this.submitEditsButton.set("Abschliessen");

                if (response.error) {
                    this.notificationService.error("Fehler beim Speichern", "Die Änderungen konnten nicht gespeichert werden: " + response.message);

                    return;
                }

                this.notificationService.success("Änderungen gespeichert", response.message);

                // Reset the siteEdits
                this.siteEditImages[this.currentActiveSiteEdit()] = [];

                const request = this.subpagesService.getStaticSite(this.currentActiveSiteEdit());

                request.subscribe({
                    next: (response: GetStaticSiteApiEndpointResponse) => {
                        if (response.error || response.data === null) {
                            this.notificationService.error("Fehler beim Laden der Seite", `Die Seite '${this.currentActiveSiteEdit()}' konnte nicht geladen werden: ` + response.message);

                            // Set a Warning as the sites content
                            this.siteEdits[this.currentActiveSiteEdit()].set({
                                data: [],
                                metadata: {
                                    title: "Fehler beim Laden der Seite",
                                    subtitle: "",
                                    author: "",
                                    imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                    imageAlt: "",
                                },
                            });

                            return;
                        }

                        this.siteEdits[this.currentActiveSiteEdit()].set(response.data.site);
                    },
                    error: (error) => {
                        console.error("Error while fetching site:", error);
                        this.notificationService.error("Fehler beim Laden der Seite", `Die Seite '${this.currentActiveSiteEdit()}' konnte nicht geladen werden. Bitte versuche es später erneut.`);

                        // Set a Warning as the sites content
                        this.siteEdits[this.currentActiveSiteEdit()].set({
                            data: [],
                            metadata: {
                                title: "Fehler beim Laden der Seite",
                                subtitle: "",
                                author: "",
                                imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                imageAlt: "",
                            },
                        });
                    },
                });
            },
            error: (error) => {
                console.error("Error while updating site:", error);
                this.notificationService.error("Fehler beim Speichern", "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es später erneut.");
            },
        });
    }

    submitNewBlog(): void {
        this.submitEditsButton.set("Speichern...");

        // Remove unused images from storage
        const indicesToRemove = this.getIndicesToRemoveUnusedImagesFromStorage(this.blogs.newBlog(), this.blogImages.newBlog);

        for (const index of indicesToRemove.reverse()) {
            this.blogImages.newBlog.splice(index, 1);
        }

        // Submit the edits to the backend
        const request = this.blogService.createBlog(this.blogs.newBlog().metadata.title, this.blogs.newBlog(), this.blogImages.newBlog);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                this.submitEditsButton.set("Abschliessen");

                this.getAllBlogTitles();

                if (response.error) {
                    this.notificationService.error("Fehler beim Erstellen", "Der Blog konnte nicht erstellt werden: " + response.message);

                    return;
                }

                this.notificationService.success("Blog erstellt", response.message);

                const blogName = this.blogs.newBlog().metadata.title;

                // Reset the blogEdits
                this.currentActiveBlogEdit.set("awaitSelection");

                this.blogImages.newBlog = [];
                this.blogs.newBlog = signal<BlogContent>({ metadata: { title: "Bearbeite mich :)", subtitle: "", author: "", imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL, imageAlt: "" }, data: [] });

                this.blogImages.existingBlogs[blogName] = [];

                const request = this.blogService.getBlog(blogName);

                request.subscribe({
                    next: (response: GetBlogApiEndpointResponse) => {
                        if (response.error || response.data === null) {
                            this.notificationService.error("Fehler beim Laden des Blogs", `Der Blog '${blogName}' konnte nicht geladen werden: ` + response.message);

                            // Set a Warning as the sites content
                            this.blogs.existingBlogs[blogName].set({
                                data: [],
                                metadata: {
                                    title: "Fehler beim Laden der Seite",
                                    subtitle: "",
                                    author: "",
                                    imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                    imageAlt: "",
                                },
                            });

                            this.currentActiveBlogEdit.set(blogName);

                            return;
                        }

                        this.blogs.existingBlogs[blogName] = signal<BlogContent>(response.data.data);

                        this.currentActiveBlogEdit.set(blogName);
                    },
                    error: (error) => {
                        console.error("Error while fetching blog:", error);
                        this.notificationService.error("Fehler beim Laden des Blogs", `Der Blog '${blogName}' konnte nicht geladen werden. Bitte versuche es später erneut.`);

                        // Set a Warning as the sites content
                        this.blogs.existingBlogs[blogName].set({
                            data: [],
                            metadata: {
                                title: "Fehler beim Laden der Seite",
                                subtitle: "",
                                author: "",
                                imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                imageAlt: "",
                            },
                        });

                        this.currentActiveBlogEdit.set(blogName);
                    },
                });
            },
            error: (error) => {
                console.error("Error while creating blog:", error);
                this.notificationService.error("Fehler beim Erstellen", "Der Blog konnte nicht erstellt werden. Bitte versuche es später erneut.");
            },
        });
    }

    submitBlogEdits(): void {
        this.submitEditsButton.set("Speichern...");

        // Remove unused images from storage
        const indicesToRemove = this.getIndicesToRemoveUnusedImagesFromStorage(this.blogs.newBlog(), this.blogImages.newBlog);

        for (const index of indicesToRemove.reverse()) {
            this.blogImages.newBlog.splice(index, 1);
        }

        // Submit the edits to the backend
        const request = this.blogService.updateBlog(this.currentActiveBlogEdit(), this.blogs.existingBlogs[this.currentActiveBlogEdit()](), this.blogImages.existingBlogs[this.currentActiveBlogEdit()]);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                this.submitEditsButton.set("Abschliessen");

                this.getAllBlogTitles();

                if (response.error) {
                    this.notificationService.error("Fehler beim Speichern", "Die Änderungen konnten nicht gespeichert werden: " + response.message);

                    return;
                }

                this.notificationService.success("Änderungen gespeichert", response.message);

                // Reset the blogEdits
                const oldBlogTitle = this.currentActiveBlogEdit();
                const newBlogTitle = this.blogs.existingBlogs[this.currentActiveBlogEdit()]().metadata.title;

                this.currentActiveBlogEdit.set("awaitSelection");

                // Delete the existing images array since the blog name might have changed
                delete this.blogImages.existingBlogs[oldBlogTitle];
                delete this.blogs.existingBlogs[oldBlogTitle];

                this.blogImages.existingBlogs[newBlogTitle] = [];

                const request = this.blogService.getBlog(newBlogTitle);

                request.subscribe({
                    next: (response: GetBlogApiEndpointResponse) => {
                        if (response.error || response.data === null) {
                            this.notificationService.error("Fehler beim Laden des Blogs", `Der Blog '${newBlogTitle}' konnte nicht geladen werden: ` + response.message);

                            // Set a Warning as the sites content
                            this.blogs.existingBlogs[newBlogTitle].set({
                                data: [],
                                metadata: {
                                    title: "Fehler beim Laden der Seite",
                                    subtitle: "",
                                    author: "",
                                    imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                    imageAlt: "",
                                },
                            });

                            this.currentActiveBlogEdit.set(newBlogTitle);

                            return;
                        }

                        this.blogs.existingBlogs[newBlogTitle] = signal<BlogContent>(response.data.data);

                        this.currentActiveBlogEdit.set(newBlogTitle);
                    },
                    error: (error) => {
                        console.error("Error while fetching blog after update:", error);
                        this.notificationService.error("Fehler beim Laden des Blogs", `Der Blog '${newBlogTitle}' konnte nicht geladen werden. Bitte versuche es später erneut.`);

                        this.blogs.existingBlogs[newBlogTitle].set({
                            data: [],
                            metadata: {
                                title: "Fehler beim Laden der Seite",
                                subtitle: "",
                                author: "",
                                imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL,
                                imageAlt: "",
                            },
                        });

                        this.currentActiveBlogEdit.set(newBlogTitle);
                    },
                });
            },
            error: (error) => {
                console.error("Error while updating blog:", error);
                this.notificationService.error("Fehler beim Speichern", "Die Änderungen konnten nicht gespeichert werden. Bitte versuche es später erneut.");
            },
        });
    }

    async submitNewNews(): Promise<void> {
        this.submitEditsButton.set("Speichern...");

        // Remove unused images from storage
        const indicesToRemove = this.getIndicesToRemoveUnusedImagesFromStorage(this.news.newNews().data, this.newsImages.newNews);

        for (const index of indicesToRemove.reverse()) {
            this.newsImages.newNews.splice(index, 1);
        }

        const shouldSendNewsletter = await this.awaitConfirmation("Newsletter versenden?", "Möchtest du einen Newsletter an alle Abonnenten versenden, um sie über die neue News zu informieren?", "Ja", "Nein");

        const request = this.newsService.createNews(this.news.newNews().data, this.newsImages.newNews, shouldSendNewsletter);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                this.submitEditsButton.set("Abschliessen");

                this.getAllNews();

                if (response.error) {
                    this.notificationService.error("Fehler beim Erstellen", "Die News konnten nicht erstellt werden: " + response.message);

                    return;
                }

                this.notificationService.success("News erstellt", response.message);

                // Reset the newsEdits
                this.currentActiveNewsEdit.set("awaitSelection");

                this.newsImages.newNews = [];
                this.news.newNews = signal<News>({ id: -1, date: "1900/12/22", data: { type: "image", imageUrl: PUBLIC_CONFIG.FALLBACK_IMAGE_URL, imageAlt: "", imagePosition: "center", content: [] } });
            },
            error: (error) => {
                console.error("Error while creating news:", error);
                this.notificationService.error("Fehler beim Erstellen", "Die News konnten nicht erstellt werden. Bitte versuche es später erneut.");
            },
        });
    }

    async submitNewsEdits(): Promise<void> {
        this.submitEditsButton.set("Speichern...");

        // Remove unused images from storage
        const indicesToRemove = this.getIndicesToRemoveUnusedImagesFromStorage(this.news.existingNews[this.currentActiveNewsEdit()]().data, this.newsImages.existingNews[this.currentActiveNewsEdit()]);

        for (const index of indicesToRemove.reverse()) {
            this.newsImages.existingNews[this.currentActiveNewsEdit()].splice(index, 1);
        }

        const currentNews = this.news.existingNews[this.currentActiveNewsEdit()]();
        const currentNewsImages = this.newsImages.existingNews[this.currentActiveNewsEdit()];

        const shouldSendNewsletter = await this.awaitConfirmation("Newsletter versenden?", "Möchtest du einen Newsletter an alle Abonnenten versenden, um sie über die neue News zu informieren?", "Ja", "Nein");

        const request = this.newsService.updateNews(currentNews.id, currentNews.data, currentNewsImages, shouldSendNewsletter);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                this.submitEditsButton.set("Abschliessen");

                this.getAllNews();

                if (response.error) {
                    this.notificationService.error("Fehler beim Aktualisieren", "Die News konnten nicht aktualisiert werden: " + response.message);

                    return;
                }

                this.notificationService.success("News aktualisiert", response.message);

                // Reset the newsEdits
                this.currentActiveNewsEdit.set("awaitSelection");
            },
            error: (error) => {
                console.error("Error while updating news:", error);
                this.notificationService.error("Fehler beim Aktualisieren", "Die News konnten nicht aktualisiert werden. Bitte versuche es später erneut.");
            },
        });
    }

    /*
     * ===============================================================
     *              EDIT FUNCTION GENERATOR FUNCTION
     * ===============================================================
     */

    generateEditFunction(type: DashboardEditTypes): Function {
        const _this = this;

        const editFunction = async () => {
            if (!isPlatformBrowser(_this.platformId)) {
                console.error("Site editing functions can only be executed in the browser.");
                return;
            }

            _this.currentActionToPerform.set(type);

            if (type === "addTitle" || type === "addNewsTitle") {
                _this.titleInputOpen.set(true);

                _this.titleInputTitle.set("Titel eingeben:");
                _this.titleInputDescription.set("Bitte gib den Titel ein, den du hinzufügen möchtest. Du kannst ihn auch nachher noch bearbeiten.");
                _this.titleInputLabel.set("Titel:");
                _this.titleInputPlaceholder.set("Titel eingeben");
            } else if (type === "addSubtitle" || type === "addNewsSubtitle") {
                _this.titleInputOpen.set(true);

                _this.titleInputTitle.set("Untertitel eingeben:");
                _this.titleInputDescription.set("Bitte gib den Untertitel ein, den du hinzufügen möchtest. Du kannst ihn auch nachher noch bearbeiten.");
                _this.titleInputLabel.set("Untertitel:");
                _this.titleInputPlaceholder.set("Untertitel eingeben");
            } else if (type === "addParagraph" || type === "addImageWithText" || type === "addNewsParagraph") {
                _this.textInputOpen.set(true);
            } else if (type === "addImage") {
                _this.imageEditInputOpen.set(true);

                _this.imageEditInputTitle.set("Bild auswählen:");
                _this.imageEditInputDescription.set("Bitte wähle ein Bild aus, dass du verwenden möchtest. Du kannst es auch nachher noch bearbeiten.");
                _this.imageEditInputLabel.set("Bild:");

                _this.imageEditInputPlaceholderUrl.set(PUBLIC_CONFIG.FALLBACK_IMAGE_URL);
            } else if (type === "addMultipleImages") {
                _this.multipleImagesInputOpen.set(true);
            } else if (type === "addTable") {
                _this.tableInputOpen.set(true);
            } else if (type === "addSourcePart1") {
                _this.titleInputOpen.set(true);

                _this.titleInputTitle.set("Quellenname eingeben:");
                _this.titleInputDescription.set("Bitte gib den Namen deiner Quelle ein, welche du hinzufügen möchtest. Du kannst ihn auch nachher noch bearbeiten.");
                _this.titleInputLabel.set("Quellenname:");
                _this.titleInputPlaceholder.set("Quellenname eingeben");
            } else if (type === "addLine") {
                const element = _this.editService.addLine();

                _this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
                    return {
                        ...siteOrBlog,
                        data: [element, ...siteOrBlog.data],
                    };
                });
            } else if (type === "addCurrentTeam") {
                const request = _this.teamService.getCurrentTeam();

                request.subscribe({
                    next: (response: GetTeamApiEndpointResponse) => {
                        if (response.error || response.data === null) {
                            _this.notificationService.error("Fehler beim Laden des Teams", "Das aktuelle Team konnte nicht geladen werden: " + response.message);

                            return;
                        }

                        const element = _this.editService.addCurrentTeam(response.data.id);

                        _this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
                            return {
                                ...siteOrBlog,
                                data: [element, ...siteOrBlog.data],
                            };
                        });
                    },
                    error: (error) => {
                        console.error("Fehler beim Laden des Teams:", error);

                        _this.notificationService.error("Fehler beim Laden des Teams", "Das aktuelle Team konnte nicht geladen werden. Bitte versuche es später erneut.");
                    },
                });
            } else if (type === "addMultipleButtons") {
                _this.multipleButtonsInputOpen.set(true);
            } else if (type === "addMultipleLists") {
                _this.multipleListsInputOpen.set(true);
            } else if (type === "addBoard") {
                const element = _this.editService.addBoard();

                _this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
                    return {
                        ...siteOrBlog,
                        data: [element, ...siteOrBlog.data],
                    };
                });
            } else if (type === "editGeneralTitle") {
                _this.titleEditInputOpen.set(true);

                _this.titleEditInputTitle.set("Seitentitel eingeben:");
                _this.titleEditInputDescription.set("Bitte gib den Seitentitel ein, den du für die Seite verwenden möchtest.");
                _this.titleEditInputLabel.set("Seitentitel:");
                _this.titleEditInputPlaceholder.set("Seitentitel eingeben");

                _this.titleEditInputValue.set(_this.getCurrentEditSignal()().metadata.title);
            } else if (type === "editGeneralSubtitle") {
                _this.titleEditInputOpen.set(true);

                _this.titleEditInputTitle.set("Seiten Untertitel eingeben:");
                _this.titleEditInputDescription.set("Bitte gib den Seiten Untertitel ein, den du für die Seite verwenden möchtest.");
                _this.titleEditInputLabel.set("Seiten Untertitel:");
                _this.titleEditInputPlaceholder.set("Seiten Untertitel eingeben");

                _this.titleEditInputValue.set(_this.getCurrentEditSignal()().metadata.subtitle);
            } else if (type === "editAuthor") {
                _this.titleEditInputOpen.set(true);

                _this.titleEditInputTitle.set("Autor eingeben:");
                _this.titleEditInputDescription.set("Bitte gib deinen Vor- und Nachnamen ein, der als Autor der Seite angezeigt werden soll.");
                _this.titleEditInputLabel.set("Autor:");
                _this.titleEditInputPlaceholder.set("Autor eingeben");

                _this.titleEditInputValue.set(_this.getCurrentEditSignal()().metadata.author);
            } else if (type === "editTitleImage") {
                _this.imageEditInputOpen.set(true);

                _this.imageEditInputTitle.set("Titelbild auswählen:");
                _this.imageEditInputDescription.set("Bitte wähle ein Bild aus, das du als Titelbild verwenden möchtest.");
                _this.imageEditInputLabel.set("Bild:");

                _this.imageEditInputPlaceholderUrl.set(_this.getCurrentEditSignal()().metadata.imageUrl);
            } else if (type === "addNewsImage") {
                _this.imageEditInputOpen.set(true);

                _this.imageEditInputTitle.set("Bild auswählen:");
                _this.imageEditInputDescription.set("Bitte wähle ein Bild aus, dass du verwenden möchtest.");
                _this.imageEditInputLabel.set("Bild:");

                _this.imageEditInputPlaceholderUrl.set(_this.getCurrentNewsEditSignal()().data.imageUrl || PUBLIC_CONFIG.FALLBACK_IMAGE_URL);
            } else if (type === "addNewsPdf") {
                _this.fileInputOpen.set(true);

                _this.fileInputAccept.set("application/pdf, .pdf");
            } else if (type === "addVideo") {
                _this.fileInputOpen.set(true);

                _this.fileInputAccept.set(["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/mpeg", "video/x-matroska"].join(", "));
            } else if (type === "addPdfViewer") {
                _this.fileInputOpen.set(true);

                _this.fileInputAccept.set("application/pdf, .pdf");
            } else if (type === "addNewsMultipleImages") {
                _this.multipleImagesInputOpen.set(true);

                _this.multipleImagesEditInputTitle.set("Bilder auswählen:");
                _this.multipleImagesEditInputDescription.set("Bitte wähle Bilder aus, die du verwenden möchtest.");
                _this.multipleImagesEditInputLabel.set("Bilder:");
            } else if (type === "addNewsLine") {
                const element = _this.editService.addLine();

                _this.getCurrentNewsEditSignal().update((news: News): News => {
                    return {
                        ...news,
                        data: {
                            ...news.data,
                            content: [...news.data.content, element],
                        },
                    };
                });
            } else {
                _this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht verarbeitet werden.");
            }
        };

        return editFunction;
    }

    /*
     * ===============================================================
     *           CUSTOM ELEMENTS EDIT HANDLER FUNCTIONS
     * ===============================================================
     */

    handleMove(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.getCurrentEditSignal()().data, event.previousIndex, event.currentIndex);
    }

    handleEdit(index: number): void {
        this.currentIndexToEdit.set(index);

        const elementToEdit = this.getCurrentEditSignal()().data[index];

        switch (elementToEdit.type) {
            case "title":
                this.currentActionToPerform.set("editTitle");
                this.titleEditInputOpen.set(true);

                this.titleEditInputTitle.set("Titel bearbeiten:");
                this.titleEditInputDescription.set("Bitte bearbeite den Titel nach Bedarf.");
                this.titleEditInputLabel.set("Titel:");
                this.titleEditInputPlaceholder.set("Titel eingeben");
                this.titleEditInputValue.set(elementToEdit.content);

                break;

            case "subtitle":
                this.currentActionToPerform.set("editSubtitle");
                this.titleEditInputOpen.set(true);

                this.titleEditInputTitle.set("Untertitel bearbeiten:");
                this.titleEditInputDescription.set("Bitte bearbeite den Untertitel nach Bedarf.");
                this.titleEditInputLabel.set("Untertitel:");
                this.titleEditInputPlaceholder.set("Untertitel eingeben");
                this.titleEditInputValue.set(elementToEdit.content);

                break;

            case "paragraph":
                this.currentActionToPerform.set("editParagraph");
                this.textEditInputOpen.set(true);

                this.textEditInputTitle.set("Text bearbeiten:");
                this.textEditInputDescription.set("Bitte bearbeite den Text nach Bedarf.");
                this.textEditInputLabel.set("Text:");
                this.textEditInputPlaceholder.set("Text eingeben");
                this.textEditInputValue.set(elementToEdit.content);

                break;

            case "imageWithText":
                this.currentActionToPerform.set("editImageWithText");
                this.textEditInputOpen.set(true);

                this.textEditInputTitle.set("Text bearbeiten:");
                this.textEditInputDescription.set("Bitte bearbeite den Text nach Bedarf.");
                this.textEditInputLabel.set("Text:");
                this.textEditInputPlaceholder.set("Text eingeben");
                this.textEditInputValue.set(elementToEdit.content);

                this.imageEditInputTitle.set("Bild ändern:");
                this.imageEditInputDescription.set("Bitte wähle ein neues Bild aus, um das Aktuelle zu ersetzen. Wenn du das Bild nicht ändern möchtest, kannst du dieses Fenster einfach schliessen.");
                this.imageEditInputLabel.set("Bild:");
                this.imageEditInputPlaceholderUrl.set(elementToEdit.imageUrl);

                break;

            case "image":
                this.currentActionToPerform.set("editImage");
                this.imageEditInputOpen.set(true);

                this.imageEditInputTitle.set("Bild ändern:");
                this.imageEditInputDescription.set("Bitte wähle ein neues Bild aus, um das Aktuelle zu ersetzen.");
                this.imageEditInputLabel.set("Bild:");
                this.imageEditInputPlaceholderUrl.set(elementToEdit.imageUrl);

                break;

            case "multipleImages":
                this.currentActionToPerform.set("editMultipleImages");
                this.multipleImagesEditInputOpen.set(true);

                this.multipleImagesEditInputTitle.set("Bilder ändern:");
                this.multipleImagesEditInputDescription.set("Bitte wähle neue Bilder aus, um die Aktuellen zu ersetzen. Du kannst ausserdem einzelne Bilder hinzufügen oder entfernen oder einfach die Reihenfolge verändern.");
                this.multipleImagesEditInputLabel.set("Bilder:");
                this.multipleImagesEditInputValue.set(elementToEdit.images);

                break;

            case "video":
                this.currentActionToPerform.set("editVideo");
                this.fileEditInputOpen.set(true);

                this.fileEditInputTitle.set("Video ersetzen");
                this.fileEditInputDescription.set("Bitte wähle eine neue Videodatei aus, um die Aktuelle zu ersetzen.");
                this.fileEditInputAccept.set(["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/mpeg", "video/x-matroska"].join(", "));

                break;

            case "pdfViewer":
                this.currentActionToPerform.set("editPdfViewer");
                this.fileEditInputOpen.set(true);

                this.fileEditInputTitle.set("PDF ersetzen");
                this.fileEditInputDescription.set("Bitte wähle eine neue PDF-Datei aus, um die Aktuelle zu ersetzen.");
                this.fileEditInputAccept.set("application/pdf, .pdf");

                break;

            case "table":
                this.currentActionToPerform.set("editTable");
                this.tableEditInputOpen.set(true);

                this.tableEditInputTitle.set("Tabelle bearbeiten");
                this.tableEditInputDescription.set("Bearbeite oder ergänze die Tabelle mit den gewünschten Daten. Es ist in jeder Zelle möglich, Text oder ein Bild einzufügen.");
                this.tableEditInputInitialHeaders.set(elementToEdit.headers);
                this.tableEditInputInitialRows.set(elementToEdit.rows);
                this.tableEditInputInitialSourceName.set(elementToEdit.source?.content ?? "Keine Quelle");
                this.tableEditInputInitialSourceUrl.set(elementToEdit.source?.url ?? "Keine Quelle");

                break;

            case "source":
                this.currentActionToPerform.set("editSourcePart1");
                this.titleEditInputOpen.set(true);

                this.titleEditInputTitle.set("Quellenname bearbeiten:");
                this.titleEditInputDescription.set("Bitte bearbeite den Namen deiner Quelle nach Bedarf.");
                this.titleEditInputLabel.set("Quellenname:");
                this.titleEditInputPlaceholder.set("Quellenname eingeben");
                this.titleEditInputValue.set(elementToEdit.content);

                break;

            case "multipleButtons":
                this.currentActionToPerform.set("editMultipleButtons");
                this.multipleButtonsEditInputOpen.set(true);

                this.multipleButtonsEditInputTitle.set("Buttons bearbeiten:");
                this.multipleButtonsEditInputDescription.set("Bearbeite mehrere Buttons welche nebeneinander aufgeführt werden und als Link agieren.");
                this.multipleButtonsEditInputValue.set(elementToEdit.buttons);

                break;

            case "multipleLists":
                this.currentActionToPerform.set("editMultipleLists");
                this.multipleListsEditInputOpen.set(true);

                this.multipleListsEditInputTitle.set("Listen bearbeiten:");
                this.multipleListsEditInputDescription.set("Bearbeite mehrere Listen welche nebeneinander aufgeführt werden mit den gewünschten Daten.");
                this.multipleListsEditInputValue.set(elementToEdit.lists);

                break;

            case "line":
            case "currentTeam":
            case "board":
                this.notificationService.info("Statisches Element", "Dieses Element kann nicht bearbeitet werden. Es aktualisiert sich von alleine, wenn nötig");
                break;

            default:
                this.notificationService.error("Unbekanntes Element", "Dieses Element kann nicht bearbeitet werden.");
                break;
        }
    }

    async handleDelete(index: number): Promise<void> {
        const confirmDeletion = await this.awaitConfirmation("Löschen bestätigen", "Möchtest du dieses Element wirklich löschen?", "Löschen", "Abbrechen");

        if (!confirmDeletion) {
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data.splice(index, 1);

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    handleNewsMove(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.getCurrentNewsEditSignal()().data.content, event.previousIndex, event.currentIndex);
    }

    handleNewsEdit(index: number): void {
        this.currentIndexToEdit.set(index);

        const elementToEdit = this.getCurrentNewsEditSignal()().data.content[index];

        switch (elementToEdit.type) {
            case "title":
                this.currentActionToPerform.set("editNewsTitle");
                this.titleEditInputOpen.set(true);

                this.titleEditInputTitle.set("Titel bearbeiten:");
                this.titleEditInputDescription.set("Bitte bearbeite den Titel nach Bedarf.");
                this.titleEditInputLabel.set("Titel:");
                this.titleEditInputPlaceholder.set("Titel eingeben");
                this.titleEditInputValue.set(elementToEdit.content);

                break;

            case "subtitle":
                this.currentActionToPerform.set("editNewsSubtitle");
                this.titleEditInputOpen.set(true);

                this.titleEditInputTitle.set("Untertitel bearbeiten:");
                this.titleEditInputDescription.set("Bitte bearbeite den Untertitel nach Bedarf.");
                this.titleEditInputLabel.set("Untertitel:");
                this.titleEditInputPlaceholder.set("Untertitel eingeben");
                this.titleEditInputValue.set(elementToEdit.content);

                break;

            case "paragraph":
                this.currentActionToPerform.set("editNewsParagraph");
                this.textEditInputOpen.set(true);

                this.textEditInputTitle.set("Text bearbeiten:");
                this.textEditInputDescription.set("Bitte bearbeite den Text nach Bedarf.");
                this.textEditInputLabel.set("Text:");
                this.textEditInputPlaceholder.set("Text eingeben");
                this.textEditInputValue.set(elementToEdit.content);

                break;

            case "multipleImages":
                this.currentActionToPerform.set("editNewsMultipleImages");
                this.multipleImagesEditInputOpen.set(true);

                this.multipleImagesEditInputTitle.set("Bilder ändern:");
                this.multipleImagesEditInputDescription.set("Bitte wähle neue Bilder aus, um die aktuellen zu ersetzen. Du kannst ausserdem einzelne Bilder hinzufügen oder entfernen oder einfach die Reihenfolge verändern.");
                this.multipleImagesEditInputLabel.set("Bilder:");
                this.multipleImagesEditInputValue.set(elementToEdit.images);

                break;

            default:
                this.notificationService.error("Unbekanntes Element", "Dieses Element kann nicht bearbeitet werden.");
                break;
        }
    }

    async handleNewsDelete(index: number): Promise<void> {
        const confirmDeletion = await this.awaitConfirmation("Löschen bestätigen", "Möchtest du dieses Element wirklich löschen?", "Löschen", "Abbrechen");

        if (!confirmDeletion) {
            return;
        }

        this.getCurrentNewsEditSignal().update((news: News): News => {
            news.data.content.splice(index, 1);

            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content],
                },
            };
        });
    }

    /*
     * ===============================================================
     *                    INPUT HANDLER FUNCTIONS
     * ===============================================================
     */

    handleTitleInputResult(content: string): void {
        this.titleInputOpen.set(false);
        this.titleEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addTitle":
                this.addTitle(content);
                break;
            case "editTitle":
                this.editTitle(content);
                break;
            case "addSubtitle":
                this.addSubtitle(content);
                break;
            case "editSubtitle":
                this.editSubtitle(content);
                break;
            case "editGeneralTitle":
                this.editGeneralTitle(content);
                break;
            case "editGeneralSubtitle":
                this.editGeneralSubtitle(content);
                break;
            case "editAuthor":
                this.editAuthor(content);
                break;
            case "addNewsTitle":
                this.addNewsTitle(content);
                break;
            case "editNewsTitle":
                this.editNewsTitle(content);
                break;
            case "addNewsSubtitle":
                this.addNewsSubtitle(content);
                break;
            case "editNewsSubtitle":
                this.editNewsSubtitle(content);
                break;
            case "addSourcePart1":
                this.addSourcePart1(content);
                break;
            case "addSourcePart2":
                this.addSourcePart2(content);
                break;
            case "editSourcePart1":
                this.editSourcePart1(content);
                break;
            case "editSourcePart2":
                this.editSourcePart2(content);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleTextInputResult(content: string): void {
        this.textInputOpen.set(false);
        this.textEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addParagraph":
                this.addParagraph(content);
                break;
            case "editParagraph":
                this.editParagraph(content);
                break;
            case "addImageWithText":
                this.addImageWithTextPart1(content);
                break;
            case "editImageWithText":
                this.editImageWithTextPart1(content);
                break;
            case "addNewsParagraph":
                this.addNewsParagraph(content);
                break;
            case "editNewsParagraph":
                this.editNewsParagraph(content);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleSelectionInputResult(selectedOption: string): void {
        this.selectionInputOpen.set(false);

        console.log("Selected option:", selectedOption);

        switch (this.currentActiveSection()) {
            case "blog-edit-blog":
                this.currentActiveBlogEdit.set(selectedOption);
                break;
            case "news-edit-news":
                if (this.allEditableNews.includes(selectedOption)) {
                    this.currentActiveNewsEdit.set(selectedOption);
                } else {
                    this.selectionInputObservable.next(selectedOption);
                }
                break;
            default:
                this.selectionInputObservable.next(selectedOption);
                break;
        }
    }

    handleImageInputResult(file: { file: File | null; url: string }): void {
        this.imageInputOpen.set(false);
        this.imageEditInputOpen.set(false);

        if (file.file === null) {
            this.notificationService.info("Kein Bild ausgewählt", "Bitte wähle ein Bild aus, um diese Funktion zu nutzen.");

            return;
        }

        switch (this.currentActionToPerform()) {
            case "addImage":
                this.addImage(file as { file: File; url: string });
                break;
            case "editImage":
                this.editImage(file as { file: File; url: string });
                break;
            case "addImageWithText":
                this.addImageWithTextPart2(file as { file: File; url: string });
                break;
            case "editImageWithText":
                this.editImageWithTextPart2(file as { file: File; url: string });
                break;
            case "editTitleImage":
                this.editGeneralImage(file as { file: File; url: string });
                break;
            case "addNewsImage":
                this.addNewsImage(file as { file: File; url: string });
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    addFileToCurrentImageStorage(file: { file: File | null; url: string }): void {
        if (!file.file || file.file === null) {
            console.error("No file selected for table image output.");
            return;
        }

        this.getCurrentImageStorage().push(file as { file: File; url: string });
    }

    handleFileInputResult(file: File | null): void {
        this.fileInputOpen.set(false);
        this.fileEditInputOpen.set(false);

        if (file === null) {
            this.notificationService.info("Keine Datei ausgewählt", "Bitte wähle eine Datei aus, um diese Funktion zu nutzen.");

            return;
        }

        switch (this.currentActionToPerform()) {
            case "addNewsPdf":
                this.addNewsPdf(file);
                break;
            case "addPdfViewer":
                this.addPdfViewer(file);
                break;
            case "addVideo":
                this.addVideo(file);
                break;
            case "editVideo":
                this.editVideo(file);
                break;
            case "editPdfViewer":
                this.editPdfViewer(file);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleMultipleImagesInputResult(files: { file: File; url: string }[]): void {
        this.multipleImagesInputOpen.set(false);
        this.multipleImagesEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addMultipleImages":
                this.addMultipleImages(files);
                break;
            case "editMultipleImages":
                this.editMultipleImages(files);
                break;
            case "addNewsMultipleImages":
                this.addNewsMultipleImages(files);
                break;
            case "editNewsMultipleImages":
                this.editNewsMultipleImages(files);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleTableInputResult(table: CustomTableElement): void {
        this.tableInputOpen.set(false);
        this.tableEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addTable":
                this.addTable(table);
                break;
            case "editTable":
                this.editTable(table);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleMultipleButtonsInputResult(buttons: CustomMultipleButtonsElement["buttons"]): void {
        this.multipleButtonsInputOpen.set(false);
        this.multipleButtonsEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addMultipleButtons":
                this.addMultipleButtons(buttons);
                break;
            case "editMultipleButtons":
                this.editMultipleButtons(buttons);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleMultipleListsInputResult(lists: CustomMultipleListsElement["lists"]): void {
        this.multipleListsInputOpen.set(false);
        this.multipleListsEditInputOpen.set(false);

        switch (this.currentActionToPerform()) {
            case "addMultipleLists":
                this.addMultipleLists(lists);
                break;
            case "editMultipleLists":
                this.editMultipleLists(lists);
                break;
            default:
                this.notificationService.error("Unbekannte Aktion", "Diese Aktion kann nicht mit dem aktuellen Popup verarbeitet werden.");
                break;
        }
    }

    handleConfirmInputResult(confirmed: boolean): void {
        this.confirmInputOpen.set(false);

        this.confirmInputObservable.next(confirmed);
    }

    /*
     * ===============================================================
     *                 ADD CUSTOM ELEMENTS FUNCTIONS
     * ===============================================================
     */

    addTitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Titel wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addTitle(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addNewsTitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Titel wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addTitle(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content, element],
                },
            };
        });
    }

    addSubtitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Untertitel wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addSubtitle(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addNewsSubtitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Untertitel wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addSubtitle(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content, element],
                },
            };
        });
    }

    addParagraph(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addParagraph(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addNewsParagraph(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        const element = this.editService.addParagraph(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content, element],
                },
            };
        });
    }

    addImage(file: { file: File; url: string }): void {
        this.getCurrentImageStorage().push(file);

        const element = this.editService.addImage(file.url, file.file.name);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    async addNewsImage(file: { file: File; url: string }): Promise<void> {
        this.getCurrentImageStorage().push(file);

        const element = this.editService.addImage(file.url, file.file.name);

        const sideOfImage = (await this.awaitSelection(
            ["Links", "In der Mitte", "Rechts"],
            "Seite wählen:",
            "Wo ist der wichtigste Teil des Bildes? Dies hilft uns, das Bild auf verschiedenen Bildschirmgrössen optimal zuzuschneiden.",
            "Position:",
            "In der Mitte",
        )) as "Links" | "In der Mitte" | "Rechts";

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    type: "image",
                    imageUrl: element.imageUrl,
                    imageAlt: element.imageAlt,
                    imagePosition: sideOfImage.replace("In der Mitte", "center").replace("Links", "left").replace("Rechts", "right") as "left" | "center" | "right",
                    content: news.data.content.filter((contentElement): boolean => contentElement.type !== "multipleImages"),
                },
            };
        });
    }

    addImageWithTextPart1(content: string): void {
        // Add the content to a cache variable and open the image input popup

        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht hinzugefügt, da kein Inhalt eingegeben wurde.");
            return;
        }

        this.textWithImageTextCache.set(content);

        this.currentActionToPerform.set("addImageWithText");
        this.imageInputOpen.set(true);
    }

    async addImageWithTextPart2(file: { file: File; url: string }): Promise<void> {
        // Get the content from the cache variable and add the element
        const shouldImageBePlacedRight = await this.awaitConfirmation("Seite wählen", "Möchtest du das Bild links oder rechts platzieren?", "Rechts", "Links", true);

        this.getCurrentImageStorage().push(file);

        const element = this.editService.addImageWithText(file.url, file.file.name, this.textWithImageTextCache(), shouldImageBePlacedRight ? "right" : "left");

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addSourcePart1(content: string): void {
        // Add the content to a cache variable and open the image input popup

        if (!content) {
            this.notificationService.info("Leere Eingabe", "Die Quelle wurde nicht hinzugefügt, da kein Name eingegeben wurde.");
            return;
        }

        this.sourceNameCache.set(content);

        this.currentActionToPerform.set("addSourcePart2");

        this.titleInputOpen.set(true);

        this.titleInputTitle.set("Quellen-URL eingeben:");
        this.titleInputDescription.set("Bitte gib die URL deiner Quelle ein, welche du hinzufügen möchtest. Du kannst sie auch nachher noch bearbeiten.");
        this.titleInputLabel.set("Quellen-URL:");
        this.titleInputPlaceholder.set("Quellen-URL eingeben");
    }

    addSourcePart2(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Quelle wurde nicht hinzugefügt, da keine URL eingegeben wurde.");
            return;
        }

        const element = this.editService.addSource(this.sourceNameCache(), content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addMultipleImages(files: { file: File; url: string }[]): void {
        if (files.length === 0) {
            this.notificationService.info("Keine Bilder ausgewählt", "Bitte wähle mindestens ein Bild aus, um diese Funktion zu nutzen.");
            return;
        }

        const images: { imageUrl: string; imageAlt: string }[] = [];

        for (const file of files) {
            this.getCurrentImageStorage().push(file);

            images.push({
                imageUrl: file.url,
                imageAlt: file.file.name,
            });
        }

        const element = this.editService.addMultipleImages(images);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addNewsMultipleImages(files: { file: File; url: string }[]): void {
        if (files.length === 0) {
            this.notificationService.info("Keine Bilder ausgewählt", "Bitte wähle mindestens ein Bild aus, um diese Funktion zu nutzen.");
            return;
        }

        const images: { imageUrl: string; imageAlt: string }[] = [];

        for (const file of files) {
            this.getCurrentImageStorage().push(file);

            images.push({
                imageUrl: file.url,
                imageAlt: file.file.name,
            });
        }

        const element = this.editService.addMultipleImages(images);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    type: "multipleImages",
                    content: [...news.data.content.filter((contentElement): boolean => contentElement.type !== "multipleImages"), element],
                },
            };
        });
    }

    addNewsPdf(file: File): void {
        if (file.type !== "application/pdf") {
            this.notificationService.info("Ungültige Datei", "Bitte wähle eine PDF-Datei aus, um diese Funktion zu nutzen.");
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        this.getCurrentImageStorage().push({ file, url: fileUrl });

        this.getCurrentNewsEditSignal().update((news: News): News => {
            return {
                ...news,
                data: {
                    type: "pdf",
                    pdfUrl: fileUrl,
                    content: news.data.content.filter((contentElement): boolean => contentElement.type !== "multipleImages"),
                },
            };
        });
    }

    addPdfViewer(file: File): void {
        if (file.type !== "application/pdf") {
            this.notificationService.info("Ungültige Datei", "Bitte wähle eine PDF-Datei aus, um diese Funktion zu nutzen.");
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        this.getCurrentImageStorage().push({ file, url: fileUrl });

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            const element = this.editService.addPdfViewer(fileUrl);

            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addVideo(file: File): void {
        if (!["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/mpeg", "video/x-matroska"].includes(file.type)) {
            this.notificationService.info("Ungültige Datei", "Bitte wähle eine Videodatei aus, um diese Funktion zu nutzen.");
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        this.getCurrentImageStorage().push({ file, url: fileUrl });

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            const element = this.editService.addVideo(fileUrl, file.type);

            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addTable(table: CustomTableElement): void {
        const { headers, rows, source } = table;

        const element = this.editService.addTable(headers, rows, source);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addMultipleButtons(buttons: CustomMultipleButtonsElement["buttons"]): void {
        const element = this.editService.addMultipleButtons(buttons);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    addMultipleLists(lists: CustomMultipleListsElement["lists"]): void {
        const element = this.editService.addMultipleLists(lists);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                data: [element, ...siteOrBlog.data],
            };
        });
    }

    /*
     * ===============================================================
     *                EDIT CUSTOM ELEMENTS FUNCTIONS
     * ===============================================================
     */

    editGeneralTitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Seitentitel wurde nicht aktualisiert, da kein Inhalt eingegeben wurde.");
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                metadata: {
                    ...siteOrBlog.metadata,
                    title: content,
                },
            };
        });
    }

    editGeneralSubtitle(content: string): void {
        // Allow empty subtitle

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                metadata: {
                    ...siteOrBlog.metadata,
                    subtitle: content ? content : "",
                },
            };
        });
    }

    editGeneralImage(file: { file: File; url: string }): void {
        this.getCurrentImageStorage().push(file);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                metadata: {
                    ...siteOrBlog.metadata,
                    imageUrl: file.url,
                    imageAlt: file.file.name,
                },
            };
        });
    }

    editAuthor(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Autor wurde nicht aktualisiert, da kein Inhalt eingegeben wurde.");
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            return {
                ...siteOrBlog,
                metadata: {
                    ...siteOrBlog.metadata,
                    author: content,
                },
            };
        });
    }

    editTitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Titel wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addTitle(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editNewsTitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Titel wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addTitle(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            news.data.content[this.currentIndexToEdit()] = element;

            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content],
                },
            };
        });
    }

    editSubtitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Untertitel wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addSubtitle(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editNewsSubtitle(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Untertitel wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addSubtitle(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            news.data.content[this.currentIndexToEdit()] = element;

            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content],
                },
            };
        });
    }

    editParagraph(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addParagraph(content);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editNewsParagraph(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const element = this.editService.addParagraph(content);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            news.data.content[this.currentIndexToEdit()] = element;

            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content],
                },
            };
        });
    }

    editImage(file: { file: File; url: string }): void {
        if (!file.url.startsWith("blob:")) {
            this.notificationService.info("Keine Veränderung", "Das Bild wurde nicht aktualisiert, da kein neues Bild ausgewählt wurde.");

            return;
        }

        this.getCurrentImageStorage().push(file);

        const element = this.editService.addImage(file.url, file.file.name);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editImageWithTextPart1(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Text wurde nicht aktualisiert, da kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomImageWithTextElement).content = content;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });

        this.currentActionToPerform.set("editImageWithText");

        this.imageEditInputOpen.set(true);
    }

    async editImageWithTextPart2(file: { file: File; url: string }): Promise<void> {
        if (!file.url.startsWith("blob:")) {
            const shouldImageBePlacedRight = await this.awaitConfirmation("Seite wählen", "Möchtest du das Bild links oder rechts platzieren?", "Rechts", "Links", true);

            this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
                (siteOrBlog.data[this.currentIndexToEdit()] as CustomImageWithTextElement).sideOfImage = shouldImageBePlacedRight ? "right" : "left";

                return {
                    ...siteOrBlog,
                    data: [...siteOrBlog.data],
                };
            });

            this.notificationService.info("Teilweise Veränderung", "Nur der Text wurde aktualisiert. Das Bild nicht, da kein Neues ausgewählt wurde.");

            return;
        }

        this.getCurrentImageStorage().push(file);

        const shouldImageBePlacedRight = await this.awaitConfirmation("Seite wählen", "Möchtest du das Bild links oder rechts platzieren?", "Rechts", "Links", true);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomImageWithTextElement).imageUrl = file.url;
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomImageWithTextElement).imageAlt = file.file.name;
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomImageWithTextElement).sideOfImage = shouldImageBePlacedRight ? "right" : "left";

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editSourcePart1(content: string): void {
        // Add the content to a cache variable and open the image input popup

        if (!content) {
            this.notificationService.info("Leere Eingabe", "Der Quellenname wurde nicht aktualisiert, da ein kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomSourceElement).content = content;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });

        this.currentActionToPerform.set("editSourcePart2");

        this.titleEditInputOpen.set(true);

        this.titleEditInputTitle.set("Quellen-URL bearbeiten:");
        this.titleEditInputDescription.set("Bitte bearbeite die URL deiner Quelle nach Bedarf.");
        this.titleEditInputLabel.set("Quellen-URL:");
        this.titleEditInputPlaceholder.set("Quellen-URL eingeben");
        this.titleEditInputValue.set((this.getCurrentEditSignal()().data[this.currentIndexToEdit()] as CustomSourceElement).sourceUrl ?? "");
    }

    editSourcePart2(content: string): void {
        if (!content) {
            this.notificationService.info("Leere Eingabe", "Die Quellen-URL wurde nicht aktualisiert, da ein kein Inhalt eingegeben wurde. Wenn du das Element löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            (siteOrBlog.data[this.currentIndexToEdit()] as CustomSourceElement).sourceUrl = content;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editMultipleImages(files: { file: File; url: string }[]): void {
        if (files.length === 0) {
            this.notificationService.info("Keine Bilder ausgewählt", "Die Bilder wurden nicht aktualisiert, da keine neuen Bilder ausgewählt wurden. Wenn du die Bilder löschen möchtest, benutze bitte die Lösch-Funktion.");
            return;
        }

        const images: { imageUrl: string; imageAlt: string }[] = [];

        for (const file of files) {
            if (file.url.startsWith("blob:")) {
                this.getCurrentImageStorage().push(file);
            }

            images.push({
                imageUrl: file.url,
                imageAlt: file.file?.name ?? "Keine Bezeichnung",
            });
        }

        const element = this.editService.addMultipleImages(images);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editNewsMultipleImages(files: { file: File; url: string }[]): void {
        if (files.length === 0) {
            this.notificationService.info("Keine Bilder ausgewählt", "Bitte wähle mindestens ein Bild aus, um diese Funktion zu nutzen.");
            return;
        }

        const images: { imageUrl: string; imageAlt: string }[] = [];

        for (const file of files) {
            if (file.url.startsWith("blob:")) {
                this.getCurrentImageStorage().push(file);
            }

            images.push({
                imageUrl: file.url,
                imageAlt: file.file?.name ?? "Keine Bezeichnung",
            });
        }

        const element = this.editService.addMultipleImages(images);

        this.getCurrentNewsEditSignal().update((news: News): News => {
            news.data.content[this.currentIndexToEdit()] = element;

            return {
                ...news,
                data: {
                    ...news.data,
                    content: [...news.data.content],
                },
            };
        });
    }

    editPdfViewer(file: File): void {
        if (file.type !== "application/pdf") {
            this.notificationService.info("Ungültige Datei", "Bitte wähle eine PDF-Datei aus, um diese Funktion zu nutzen.");
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        this.getCurrentImageStorage().push({ file, url: fileUrl });

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            const element = this.editService.addPdfViewer(fileUrl);

            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editVideo(file: File | null): void {
        if (file === null) {
            this.notificationService.error("Deine Datei ausgewählt:", "Bitte wähle eine Videodatei aus, um diese Funktion zu nutzen.");
            return;
        }

        if (!["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/mpeg", "video/x-matroska"].includes(file.type)) {
            this.notificationService.info("Ungültige Datei", "Bitte wähle eine Videodatei aus, um diese Funktion zu nutzen.");
            return;
        }

        const fileUrl = URL.createObjectURL(file);

        this.getCurrentImageStorage().push({ file, url: fileUrl });

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            const element = this.editService.addVideo(fileUrl, file.type);

            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editTable(table: CustomTableElement): void {
        const { headers, rows, source } = table;

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            const element = this.editService.addTable(headers, rows, source);

            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editMultipleButtons(buttons: CustomMultipleButtonsElement["buttons"]): void {
        const element = this.editService.addMultipleButtons(buttons);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }

    editMultipleLists(lists: CustomMultipleListsElement["lists"]): void {
        const element = this.editService.addMultipleLists(lists);

        this.getCurrentEditSignal().update((siteOrBlog: StaticSite | BlogContent): StaticSite | BlogContent => {
            siteOrBlog.data[this.currentIndexToEdit()] = element;

            return {
                ...siteOrBlog,
                data: [...siteOrBlog.data],
            };
        });
    }
}
