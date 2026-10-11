import { Component, inject, OnInit, signal } from "@angular/core";
import { PUBLIC_CONFIG } from "../../../../publicConfig";
import { ApiEndpointResponse, EditUserCommand, GetLegacyMembersApiEndpointResponse, LegacyMember, UpdateUserProfilePictureWithIdApiEndpointResponse, UpdateUserWithIdApiEndpointResponse } from "../../../..";
import { LoadingComponent } from "../../../components/loading/loading.component";
import { NotificationService } from "../../../services/notification.service";
import { PopupTitleInputComponent } from "../../../components/popup-title-input/popup-title-input.component";
import { PopupImageInputComponent } from "../../../components/popup-image-input/popup-image-input.component";
import { PopupSelectionInputComponent } from "../../../components/popup-selection-input/popup-selection-input.component";
import { PopupConfirmComponent } from "../../../components/popup-confirm/popup-confirm.component";
import { PopupAlertComponent } from "../../../components/popup-alert/popup-alert.component";
import { Subject, take } from "rxjs";
import { SpreadsheetsService } from "../../../services/spreadsheets.service";
import { MembershipService } from "../../../services/membership.service";
import { AnalyticsService } from "../../../services/analytics.service";

@Component({
    selector: "app-members-manual-members-list",
    imports: [LoadingComponent, PopupTitleInputComponent, PopupImageInputComponent, PopupSelectionInputComponent, PopupConfirmComponent, PopupAlertComponent],
    templateUrl: "./members-manual-members-list.component.html",
    styleUrl: "./members-manual-members-list.component.scss",
})
export class MembersManualMembersListComponent implements OnInit {
    members = signal<LegacyMember[]>([]);
    private originalMembers: LegacyMember[] = [];

    private editsToPush: EditUserCommand[] = [];

    titleInputOpen = signal<boolean>(false);
    imageInputOpen = signal<boolean>(false);
    selectionInputOpen = signal<boolean>(false);
    confirmInputOpen = signal<boolean>(false);
    alertInputOpen = signal<boolean>(false);
    fileTypeSelectionOpen = signal<boolean>(false);

    popups = {
        title: {
            title: signal<string>(""),
            description: signal<string>(""),
            label: signal<string>(""),
            placeholder: signal<string>(""),
            value: signal<string>(""),
            submitButtonText: signal<string>(""),
            observable: new Subject<string>(),
        },
        image: {
            description: signal<string>(""),
            placeholderUrl: signal<string>(""),
            observable: new Subject<{ file: File | null; url: string }>(),
        },
        selection: {
            description: signal<string>(""),
            value: signal<string>(""),
            selectionOptions: signal<string[]>([]),
            observable: new Subject<string>(),
        },
        confirm: {
            title: signal<string>(""),
            description: signal<string>(""),
            confirmButtonText: signal<string>("Bestätigen"),
            cancelButtonText: signal<string>("Abbrechen"),
            equalOptions: signal<boolean>(false),
            observable: new Subject<boolean>(),
        },
        alert: {
            title: signal<string>(""),
            message: signal<string>(""),
            buttonText: signal<string>("Verstanden"),
        },
    };

    private analyticsService = inject(AnalyticsService);
    private membershipService = inject(MembershipService);
    private spreadsheetsService = inject(SpreadsheetsService);
    private notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.loadAllUsers();
    }

    loadAllUsers(): void {
        const request = this.membershipService.getAllLegacyMembers();

        request.subscribe({
            next: (response: GetLegacyMembersApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Die Benutzer konnten nicht geladen werden: " + response.error);

                    return;
                }

                this.members.set(response.data);

                const deepCopiedUsers = response.data.map((user) => ({
                    ...user,
                }));

                // Deep copy the user list to be able to revert changes later if needed
                this.originalMembers = response.data.map((user) => ({
                    ...user,
                }));
            },
            error: (error: unknown) => {
                console.error("Error while loading all users:", error);
                this.notificationService.error("Fehler", "Die Benutzer konnten nicht geladen werden. Bitte versuche es erneut.");
            },
        });
    }

    saveEditsForUserWithId(userId: number): void {
        const data: {
            firstName: null | EditUserCommand;
            lastName: null | EditUserCommand;
            phone: null | EditUserCommand;
            address: null | EditUserCommand;
            type: null | EditUserCommand;
            picture: null | EditUserCommand;
        } = {
            firstName: null,
            lastName: null,
            phone: null,
            address: null,
            type: null,
            picture: null,
        };

        // Loop over the edits but only choose the ones from the user with id userId
        // Also only take the last entry for each type of edit
        for (const edit of this.editsToPush) {
            if (edit.userId === userId) {
                switch (edit.fieldType) {
                    case "firstName":
                        data.firstName = edit;
                        break;
                    case "lastName":
                        data.lastName = edit;
                        break;
                    case "phone":
                        data.phone = edit;
                        break;
                    case "address":
                        data.phone = edit;
                        break;
                    case "type":
                        data.type = edit;
                        break;
                    case "picture":
                        data.picture = edit;
                        break;
                    default:
                        this.notificationService.warn("Unbekannter Feldtyp", "Ein Feldtyp wurde nicht erkannt und wurde übersprungen.");
                        break;
                }
            }
        }

        const commands = [];

        // Push all commands that are not null to the commands array
        for (const key in data) {
            const edit = data[key as keyof typeof data];

            if (edit === null) {
                continue;
            }

            commands.push(edit);
        }

        for (const command of commands) {
            if (command.executionType === "edit" && command.fieldType === "picture" && command.pictureUploaded) {
                // Upload a new image (This happens independent from the other updates)
                const request = this.analyticsService.uploadPicture(userId, command);

                request.subscribe({
                    next: (response: UpdateUserProfilePictureWithIdApiEndpointResponse) => {
                        if (response.error || response.data === null) {
                            this.notificationService.error("Fehler", "Das Bild für den Benutzer mit Id '" + userId + "' konnte nicht hochgeladen werden: " + response.message);

                            return;
                        }

                        this.notificationService.success("Erfolg", "Das Bild für den Benutzer mit Id '" + userId + "' wurde erfolgreich hochgeladen.");

                        // Update the displayed picture URL to the new one
                        const picture = response.data.pictureUrl;

                        for (let i = 0; i < this.originalMembers.length; i++) {
                            if (this.originalMembers[i].id === userId) {
                                this.originalMembers[i].picture = picture;

                                break;
                            }
                        }

                        this.members.update((members: LegacyMember[]): LegacyMember[] => {
                            for (let i = 0; i < members.length; i++) {
                                if (members[i].id === userId) {
                                    members[i].picture = picture;

                                    break;
                                }
                            }

                            return members;
                        });
                    },
                    error: (error: unknown) => {
                        console.error("Error while uploading picture for user with id " + userId + ":", error);
                        this.notificationService.error("Fehler", "Beim Hochladen des Bildes ist ein Fehler aufgetreten. Bitte versuche es erneut.");
                    },
                });
            }
        }

        // Commit the edits to the server
        const request = this.analyticsService.updateUser(
            userId,
            commands.filter((command) => {
                // Filter the picture upload out
                // It is handled separate and would blow the body with unnesseccary data (Raw Image Blob)
                if (command.executionType === "edit" && command.fieldType === "picture" && command.pictureUploaded) {
                    return false;
                }

                return true;
            }),
        );

        request.subscribe({
            next: (response: UpdateUserWithIdApiEndpointResponse) => {
                if (response.error || (response.data === null && response.message !== "NO_CHANGE")) {
                    this.notificationService.error("Fehler", "Die Änderungen konnten nicht gespeichert werden: " + response.message);

                    return;
                }

                this.notificationService.success("Erfolg", response.message === "NO_CHANGE" ? "Keine Daten mussten aktualisiert werden." : "Die Änderungen wurden erfolgreich gespeichert.");

                if (response.message === "NO_CHANGE" || response.data === null) {
                    return;
                }

                // Set the new data for the current user
                const user = response.data;

                for (let i = 0; i < this.originalMembers.length; i++) {
                    if (this.originalMembers[i].id === user.id) {
                        this.originalMembers[i] = {
                            ...this.originalMembers[i],
                            ...user,
                        };

                        break;
                    }
                }

                this.members.update((localMembers: LegacyMember[]): LegacyMember[] => {
                    for (let i = 0; i < localMembers.length; i++) {
                        if (localMembers[i].id === user.id) {
                            localMembers[i] = {
                                ...localMembers[i],
                                ...user,
                            };

                            break;
                        }
                    }

                    return localMembers;
                });

                // Remove all edits for the user with id userId from the editsToPush array
                this.editsToPush = this.editsToPush.filter((edit) => {
                    if (edit.userId !== userId) {
                        return true;
                    }

                    if (edit.fieldType === "picture" && edit.executionType === "edit" && edit.pictureUploaded) {
                        return true;
                    }

                    return false;
                });
            },
            error: (error: unknown) => {
                console.error("Error while saving edits for user with id " + userId + ":", error);
                this.notificationService.error("Fehler", "Beim Speichern der Änderungen ist ein Fehler aufgetreten. Bitte versuche es erneut.");
            },
        });
    }

    discardEditsForUserWithId(userId: number): void {
        const originalUser = this.originalMembers.find((member) => member.id === userId);

        if (!originalUser) {
            this.notificationService.error("Fehler", "Der Benutzer mit der Id '" + userId + "' konnte nicht gefunden werden. Es konnten keine Änderungen zurückgesetzt werden.");
            return;
        }

        this.editsToPush = this.editsToPush.filter((edit) => edit.userId !== userId);

        this.updateDisplayedUser(userId, "firstName", originalUser.firstName);
        this.updateDisplayedUser(userId, "lastName", originalUser.lastName);
        this.updateDisplayedUser(userId, "phone", originalUser.phone);
        this.updateDisplayedUser(userId, "address", originalUser.address);
        this.updateDisplayedUser(userId, "type", originalUser.type);
        this.updateDisplayedUser(userId, "picture", originalUser.picture);
    }

    async deleteUserWithId(userId: number): Promise<void> {
        const confirm = await this.awaitConfirmation("Benutzer löschen", "Bist du sicher, dass du den Benutzer mit der Id '" + userId + "' löschen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden.");

        if (!confirm) {
            this.notificationService.info("Abgebrochen", "Der Benutzer mit der Id '" + userId + "' wurde nicht gelöscht.");
            return;
        }

        const request = this.analyticsService.deleteUser(userId);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Der Benutzer konnte nicht gelöscht werden: " + response.error);

                    return;
                }

                this.notificationService.success("Erfolg", "Der Benutzer wurde erfolgreich gelöscht.");

                // Remove the user from the displayed list of users
                this.members.update((members: LegacyMember[]): LegacyMember[] => {
                    return members.filter((member) => member.id !== userId);
                });

                // Remove the user from the originalMembers list
                this.originalMembers = this.originalMembers.filter((member) => member.id !== userId);
            },
            error: (error: unknown) => {
                console.error("Error while deleting user:", error);
                this.notificationService.error("Fehler", "Beim Löschen des Benutzers ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
            },
        });
    }

    async resetPassword(userId: number): Promise<void> {
        const confirm = await this.awaitConfirmation("Passwort zurücksetzen", "Möchtest du wirklich das Passwort für den Benutzer mit der Id '" + userId + "' zurücksetzen? Der Benutzer erhält dann eine E-Mail mit einem neuen Passwort.");

        if (!confirm) {
            this.notificationService.info("Abgebrochen", "Das Passwort für den Benutzer mit der Id '" + userId + "' wurde nicht zurückgesetzt.");
            return;
        }

        const request = this.analyticsService.resetUserPassword(userId);

        request.subscribe({
            next: (response: ApiEndpointResponse) => {
                if (response.error) {
                    this.notificationService.error("Fehler", "Das Passwort konnte nicht zurückgesetzt werden: " + response.error);

                    return;
                }

                this.notificationService.success("Erfolg", "Das Passwort wurde erfolgreich zurückgesetzt.");
            },
            error: (error: unknown) => {
                console.error("Error while resetting user password:", error);
                this.notificationService.error("Fehler", "Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
            },
        });
    }

    updateDisplayedUser(userId: number, type: "firstName" | "lastName" | "phone" | "address" | "type" | "picture", value: string) {
        this.members.update((members: LegacyMember[]): LegacyMember[] => {
            for (const member of members) {
                if (member.id === userId) {
                    if (type === "type" && (value === "user" || value === "member" || value === "admin")) {
                        member[type] = value;
                    } else if (type !== "type") {
                        member[type] = value;
                    }
                }
            }

            return members;
        });
    }

    edit(userId: number, previousValue: string, type: "firstName" | "lastName" | "phone" | "address" | "type" | "picture"): void {
        switch (type) {
            case "firstName":
                this.editFirstName(userId, previousValue);
                break;
            case "lastName":
                this.editLastName(userId, previousValue);
                break;
            case "phone":
                this.editPhone(userId, previousValue);
                break;
            case "address":
                this.editAddress(userId, previousValue);
                break;
            case "type":
                this.editType(userId, previousValue);
                break;
            case "picture":
                this.editPicture(userId, previousValue);
                break;
            default:
                this.notificationService.error("Fehler", "Der angegebene Typ '" + type + "' ist ungültig und kann nicht bearbeitet werden.");
        }
    }

    reset(userId: number, type: "phone" | "type" | "picture"): void {
        this.editsToPush.push({
            executionType: "reset",
            fieldType: type,
            userId,
        });

        switch (type) {
            case "phone":
                this.updateDisplayedUser(userId, type, "Keine Nummer");
                break;
            case "type":
                this.updateDisplayedUser(userId, type, "user");
                break;
            case "picture":
                this.updateDisplayedUser(userId, type, PUBLIC_CONFIG.FALLBACK_PROFILE_PICTURE);
                break;
            default:
                this.notificationService.error("Fehler", "Der angegebene Typ '" + type + "' ist ungültig und kann nicht zurückgesetzt werden.");
        }
    }

    tryToEditEmail(): void {
        this.customAlert(
            "Bearbeiten verboten",
            "Die E-Mail-Adresse eines Benutzers kann nicht bearbeitet werden. Dies erfordert eine Bestätigung der neuen E-Mail-Adresse. Der Benutzer kann dies selbst in seinem Profil tun, indem er auf die Schaltfläche 'E-Mail-Adresse ändern' klickt. (Falls es dringend notwendig ist, melde dich beim Entwickler unter: " +
                PUBLIC_CONFIG.PERSONAS["developer"].email +
                ")",
        );
    }

    async editFirstName(userId: number, previousValue: string): Promise<void> {
        const result = await this.awaitTitle("Vornamen bearbeiten", `Du bearbeitest gerade den Vornamen vom Benutzer mit aktuellem Vornamen: '${previousValue}'.`, "Vorname:", "Vornamen eingeben", previousValue, "Aktualisieren");

        if (result.trim() === "") {
            this.notificationService.info("Abgebrochen", "Das Eingabefeld wurde geschlossen oder die Eingabe war leer. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        this.editsToPush.push({
            executionType: "edit",
            fieldType: "firstName",
            userId,
            previousValue,
            newValue: result,
        });

        this.updateDisplayedUser(userId, "firstName", result);
    }

    async editLastName(userId: number, previousValue: string): Promise<void> {
        const result = await this.awaitTitle("Nachnamen bearbeiten", `Du bearbeitest gerade den Nachnamen vom Benutzer mit aktuellem Nachnamen: '${previousValue}'.`, "Nachname:", "Nachnamen eingeben", previousValue, "Aktualisieren");

        if (result.trim() === "") {
            this.notificationService.info("Abgebrochen", "Das Eingabefeld wurde geschlossen oder die Eingabe war leer. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        this.editsToPush.push({
            executionType: "edit",
            fieldType: "lastName",
            userId,
            previousValue,
            newValue: result,
        });

        this.updateDisplayedUser(userId, "lastName", result);
    }

    async editPhone(userId: number, previousValue: string): Promise<void> {
        const result = await this.awaitTitle(
            "Telefonnummer bearbeiten",
            `Du bearbeitest gerade die Telefonnummer vom Benutzer mit aktueller Telefonnummer: '${previousValue}'.`,
            "Telefonnummer:",
            "Telefonnummer eingeben",
            previousValue,
            "Aktualisieren",
        );

        if (result.trim() === "") {
            this.notificationService.info("Abgebrochen", "Das Eingabefeld wurde geschlossen oder die Eingabe war leer. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        this.editsToPush.push({
            executionType: "edit",
            fieldType: "phone",
            userId,
            previousValue,
            newValue: result,
        });

        this.updateDisplayedUser(userId, "phone", result);
    }

    async editAddress(userId: number, previousValue: string): Promise<void> {
        const result = await this.awaitTitle("Adresse bearbeiten", `Du bearbeitest gerade die Adresse vom Benutzer mit aktueller Adresse: '${previousValue}'.`, "Adresse:", "Adresse eingeben", previousValue, "Aktualisieren");

        if (result.trim() === "") {
            this.notificationService.info("Abgebrochen", "Das Eingabefeld wurde geschlossen oder die Eingabe war leer. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        this.editsToPush.push({
            executionType: "edit",
            fieldType: "address",
            userId,
            previousValue,
            newValue: result,
        });

        this.updateDisplayedUser(userId, "address", result);
    }

    async editType(userId: number, previousValue: string): Promise<void> {
        const humanReadablePreviousValue = previousValue.replace("user", "Benutzer").replace("member", "Mitglied").replace("admin", "Administrator") as "Benutzer" | "Mitglied" | "Administrator";

        const selection = await this.awaitSelection(["Benutzer", "Mitglied", "Administrator"], humanReadablePreviousValue, userId);

        if (selection.trim() === "") {
            this.notificationService.info("Abgebrochen", "Das Auswahlmenü wurde geschlossen oder die Auswahl war leer. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        const parseSelection = selection.replace("Benutzer", "user").replace("Mitglied", "member").replace("Administrator", "admin");

        if (parseSelection !== "user" && parseSelection !== "member" && parseSelection !== "admin") {
            this.notificationService.error("Fehler", "Die Auswahl ist ungültig. Es wurden keine Änderungen vorgenommen.");
            return;
        }

        this.editsToPush.push({
            executionType: "edit",
            fieldType: "type",
            userId,
            previousValue,
            newValue: parseSelection,
        });

        this.updateDisplayedUser(userId, "type", parseSelection);
    }

    async editPicture(userId: number, previousValue: string): Promise<void> {
        const editUrl = await this.awaitConfirmation("Bild bearbeiten", `Möchtest du die URL des aktuellen Bildes vom Benutzer mit Id '${userId}' bearbeiten, oder ein ganz neues Bild hochladen?`, "URL bearbeiten", "Bild hochladen", true);

        if (editUrl) {
            const result = await this.awaitTitle("URL bearbeiten", `Du bearbeitest gerade die Profilbild-URL vom Benutzer mit Id '${userId}'.`, "Profilbild-URL:", "URL eingeben", previousValue, "Aktualisieren");

            if (result.trim() === "") {
                this.notificationService.info("Abgebrochen", "Das Eingabefeld wurde geschlossen oder die Eingabe war leer. Es wurden keine Änderungen vorgenommen.");
                return;
            }

            this.editsToPush.push({
                executionType: "edit",
                fieldType: "picture",
                userId,
                previousUrl: previousValue,
                newUrl: result,
                pictureUploaded: false,
                picture: null,
            });

            this.updateDisplayedUser(userId, "picture", result);
        } else {
            const result = await this.awaitImage(previousValue, userId);

            if (result.file === null || result.url.trim() === "") {
                this.notificationService.info("Abgebrochen", "Das Bild-Auswahlmenü wurde geschlossen oder es wurde kein Bild ausgewählt. Es wurden keine Änderungen vorgenommen.");
                return;
            }

            this.editsToPush.push({
                executionType: "edit",
                fieldType: "picture",
                userId,
                previousUrl: previousValue,
                newUrl: result.url,
                pictureUploaded: true,
                picture: result.file,
            });

            this.updateDisplayedUser(userId, "picture", result.url);
        }
    }

    customAlert(title: string, message: string, buttonText: string = "Verstanden"): void {
        this.popups.alert.title.set(title);
        this.popups.alert.message.set(message);
        this.popups.alert.buttonText.set(buttonText);

        this.alertInputOpen.set(true);
    }

    closeAlert(): void {
        this.alertInputOpen.set(false);
    }

    handleConfirmInputResult(confirmed: boolean): void {
        this.confirmInputOpen.set(false);

        this.popups.confirm.observable.next(confirmed);
    }

    async awaitConfirmation(title: string, message: string, accept: string = "Bestätigen", reject: string = "Abbrechen", equalOptions: boolean = false): Promise<boolean> {
        this.confirmInputOpen.set(true);

        this.popups.confirm.title.set(title);
        this.popups.confirm.description.set(message);
        this.popups.confirm.confirmButtonText.set(accept);
        this.popups.confirm.cancelButtonText.set(reject);
        this.popups.confirm.equalOptions.set(equalOptions);

        return new Promise<boolean>((resolve) => {
            this.popups.confirm.observable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result || false);
                },
                error: (error: unknown) => {
                    console.error("Error while awaiting confirmation:", error);

                    this.notificationService.error("Fehler:", "Beim Bestätigen der Aktion ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");

                    resolve(false);
                },
            });
        });
    }

    handleTitleInputResult(result: string): void {
        this.titleInputOpen.set(false);

        this.popups.title.observable.next(result);
    }

    async awaitTitle(title: string, message: string, label: string, placeholder: string, value: string, buttonText: string): Promise<string> {
        this.titleInputOpen.set(true);

        this.popups.title.title.set(title);
        this.popups.title.description.set(message);
        this.popups.title.label.set(label);
        this.popups.title.placeholder.set(placeholder);
        this.popups.title.value.set(value);
        this.popups.title.submitButtonText.set(buttonText);

        return new Promise<string>((resolve) => {
            this.popups.title.observable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (error: unknown) => {
                    console.error("Error while awaiting title input:", error);

                    this.notificationService.error("Fehler:", "Beim Auswählen des Titels ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");

                    // Return the current value if an error occurs
                    resolve(value);
                },
            });
        });
    }

    handleImageInputResult(file: { file: File | null; url: string }): void {
        this.imageInputOpen.set(false);

        this.popups.image.observable.next(file);
    }

    async awaitImage(currentUrl: string, userId: number): Promise<{ file: File | null; url: string }> {
        this.imageInputOpen.set(true);

        this.popups.image.placeholderUrl.set(currentUrl);
        this.popups.image.description.set(`Du änderst gerade das Profilbild des Benutzers mit der Id '${userId}'.`);

        return new Promise<{ file: File | null; url: string }>((resolve) => {
            this.popups.image.observable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (error: unknown) => {
                    console.error("Error while awaiting image input:", error);

                    this.notificationService.error("Fehler:", "Beim Auswählen des Profilbildes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");

                    // Return the current URL if an error occurs
                    resolve({ file: null, url: currentUrl });
                },
            });
        });
    }

    handleSelectionInputResult(selection: string): void {
        this.selectionInputOpen.set(false);

        this.popups.selection.observable.next(selection);
    }

    async awaitSelection(options: string[], currentType: "Benutzer" | "Mitglied" | "Administrator", userId: number): Promise<string> {
        this.selectionInputOpen.set(true);

        this.popups.selection.selectionOptions.set(options);
        this.popups.selection.description.set(
            `Der Benutzer mit der Id '${userId}' hat aktuell den Typ '${currentType}'. Bitte wähle einen neuen Typ aus. (Bitte beachte, dass das Ändern der Rolle eines Benutzers unvorhergesehene Auswirkungen haben kann. Benutze also wenn möglich die speziellen Unterseiten. Für weitere Informationen melde dich beim Entwickler unter: ` +
                PUBLIC_CONFIG.PERSONAS["developer"].email +
                ")",
        );
        this.popups.selection.value.set(currentType);

        return new Promise<string>((resolve) => {
            this.popups.selection.observable.pipe(take(1)).subscribe({
                next: (result) => {
                    resolve(result);
                },
                error: (error) => {
                    console.error("Error while awaiting selection:", error);

                    this.notificationService.error("Fehler:", "Beim Auswählen des Benutzertyps ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");

                    // Return the current type if an error occurs
                    resolve(currentType);
                },
            });
        });
    }

    initiateDownload(): void {
        this.fileTypeSelectionOpen.set(true);
    }

    download(result: string): void {
        this.fileTypeSelectionOpen.set(false);

        switch (result) {
            case "CSV":
                this.spreadsheetsService.exportDataToCSV(
                    this.originalMembers.filter((member) => member.type === "member" || member.type === "admin"),
                    "legacyMembers",
                );
                break;
            case "Excel":
                this.spreadsheetsService.exportDataToExcel(
                    this.originalMembers.filter((member) => member.type === "member" || member.type === "admin"),
                    "legacyMembers",
                    "Manuelle Mitglieder",
                );
                break;
            case "OpenDocument":
                this.spreadsheetsService.exportDataToOpenDocumentSpreadsheet(
                    this.originalMembers.filter((member) => member.type === "member" || member.type === "admin"),
                    "legacyMembers",
                    "Manuelle Mitglieder",
                );
                break;
            default:
                console.info("No file type selected for export.");
        }
    }

    formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString("de-CH", {
            // weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            // hour: "numeric",
            // minute: "2-digit",
        });
    }
}
