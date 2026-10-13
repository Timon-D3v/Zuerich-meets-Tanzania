import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { ApiEndpointResponse, GetPasswordsApiEndpointResponse, PrivateUser, GetAllUserEmailsApiEndpointResponse } from "..";
import { PASSWORDS } from "../shared/passwords";
import { createUser, getAllUserEmails, getUserWithEmail, setUserType } from "../shared/user.database";
import { getMemberWithUserId } from "../shared/member.database";
import bcrypt from "bcryptjs";
import { createDarkmodeEntry } from "../shared/darkmode.database";
import { sendPasswordFromAdmin } from "../shared/auth.email";
import multerInstance from "../shared/instance.multer";
import { delivApiUpdateFile } from "delivapi-client";
import { getSecureHexString } from "../shared/secure.utils";
import { addBoardMember, getBoardDatabase, removeBoardMember } from "../shared/board.database";
import { createTeamMemberEntry, getTeamMemberEntry } from "../shared/team.database";

// Router Serves under /api/secured/admin/management
const router = Router();

router.get("/getPasswords", (req: Request, res: Response): void => {
    try {
        res.json({
            error: false,
            message: "Passwords retrieved successfully",
            data: PASSWORDS,
        } as GetPasswordsApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetPasswordsApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetPasswordsApiEndpointResponse);
    }
});

router.post("/addAdmin", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
        }

        const user = await getUserWithEmail(email);

        if (user.error !== null) {
            throw new Error(user.error);
        }

        if (user.data.length === 0) {
            throw new Error("Es existiert kein Benutzer mit dieser E-Mail-Adresse.");
        }

        if (user.data[0].type === "admin") {
            throw new Error("Der Benutzer ist bereits ein Admin.");
        }

        const result = await setUserType(email, "admin");

        if (result.error !== null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Der Benutzer wurde erfolgreich zum Admin ernannt.",
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

router.post("/removeAdmin", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
        }

        const databaseResult = await getUserWithEmail(email);

        if (databaseResult.error !== null) {
            throw new Error(databaseResult.error);
        }

        if (databaseResult.data.length === 0) {
            throw new Error("Es existiert kein Benutzer mit dieser E-Mail-Adresse.");
        }

        if (databaseResult.data[0].type !== "admin") {
            throw new Error("Der Benutzer ist kein Admin.");
        }

        const user: PrivateUser = databaseResult.data[0];

        const member = await getMemberWithUserId(user.id);

        if (member.error !== null) {
            throw new Error(member.error);
        }

        let type: "user" | "member" = "user";

        if (member.data.length > 0) {
            // User is also a member
            type = "member";
        }

        const result = await setUserType(email, type);

        if (result.error !== null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Dem Benutzer wurden erfolgreich die Admin-Rechte entzogen.",
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

router.post("/createUser", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, firstName, lastName, address } = req.body;

        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
        }

        if (typeof firstName !== "string" || firstName.trim() === "") {
            throw new Error("Bitte gib einen gültigen Vornamen ein.");
        }

        if (typeof lastName !== "string" || lastName.trim() === "") {
            throw new Error("Bitte gib einen gültigen Nachnamen ein.");
        }

        if (typeof address !== "string" || address.trim() === "") {
            throw new Error("Bitte gib eine gültige Adresse ein.");
        }

        const userList = await getUserWithEmail(email);

        if (userList.error !== null) {
            throw new Error(userList.error);
        }

        if (userList.data.length !== 0) {
            throw new Error(`Es gibt bereits einen Account mit der E-Mail-Adresse '${email}'. Bitte benutze eine andere E-Mail-Adresse.`);
        }

        const password = getSecureHexString(18);

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await createUser(email, passwordHash, firstName, lastName, address, "Keine Nummer", PUBLIC_CONFIG.FALLBACK_PROFILE_PICTURE);

        if (result.error !== null) {
            throw new Error(result.error);
        }

        const databaseResult = await getUserWithEmail(email);

        if (databaseResult.error !== null) {
            throw new Error(databaseResult.error);
        }

        const user: PrivateUser = databaseResult.data[0];

        const darkmodeResult = await createDarkmodeEntry(user.id);

        if (darkmodeResult.error !== null) {
            throw new Error(
                darkmodeResult.error +
                    " \nDas Benutzerkonto wurde aber erfolgreich erstellt. Allerdings wurde keine Darkmode-Einstellung angelegt und die E-Mail mit dem Passwort wurde nicht gesendet. Das Passwort lautet: " +
                    password +
                    ". Bitte teile dies dem Benutzer mit.",
            );
        }

        const sentSuccessfully = await sendPasswordFromAdmin(password, email, firstName, lastName);

        if (!sentSuccessfully) {
            throw new Error("Das Benutzerkonto wurde erfolgreich erstellt. Allerdings wurde die E-Mail mit dem Passwort nicht gesendet. Das Passwort lautet: " + password + ". Bitte teile dies dem Benutzer mit.");
        }

        res.json({
            error: false,
            message: `Der Benutzer mit der E-Mail "${email}" wurde erfolgreich erstellt. Das Passwort wurde an diese E-Mail-Adresse gesendet.`,
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

router.post("/changeHomepagePicture", multerInstance.single("picture"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;

        if (!file) {
            throw new Error("Es wurde kein Bild hochgeladen.");
        }

        const allowedMimeTypes = ["application/octet-stream", "image/png", "image/jpg", "image/gif", "image/jpeg", "image/tiff", "image/raw", "image/bpm", "image/webp", "image/ico"];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error("Bitte lade eine gültige Bilddatei hoch.");
        }

        const filename = "heroImage"; // This has to exist before updating, but should be created at the initialization of the app.

        const response = await delivApiUpdateFile(filename, file.buffer);

        if (response.error) {
            throw new Error("Das Bild konnte nicht hochgeladen werden. Bitte versuche es später erneut. Weitere Informationen: " + response.message);
        }

        res.json({
            error: false,
            message: "Das Homepage-Bild wurde erfolgreich aktualisiert.",
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

router.get("/getAllUserEmails", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllUserEmails();

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Die E-Mail-Adressen der Benutzer wurden erfolgreich abgerufen.",
            data: result.data,
        } as GetAllUserEmailsApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetAllUserEmailsApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetAllUserEmailsApiEndpointResponse);
    }
});

router.post("/addBoardMember", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
        }

        const userResult = await getUserWithEmail(email);

        if (userResult.error || !userResult.data) {
            throw new Error(userResult.error);
        }

        if (userResult.data.length === 0) {
            throw new Error("Es existiert kein Benutzer mit dieser E-Mail-Adresse.");
        }

        const user = userResult.data[0];

        const boardResult = await getBoardDatabase();

        if (boardResult.error || !boardResult.data) {
            throw new Error(boardResult.error);
        }

        for (let i = 0; i < boardResult.data.length; i++) {
            if (boardResult.data[i].userId === user.id) {
                throw new Error("Der Benutzer ist bereits ein Vorstandsmitglied.");
            }
        }

        // Before adding the user as a board member, create a teamMember entry for the user if it doesn't exist
        const memberResult = await getTeamMemberEntry(user.id);

        if (memberResult.error || memberResult.data === null) {
            throw new Error(memberResult.error);
        }

        if (memberResult.data.length === 0) {
            // Create a new team member entry
            const createResult = await createTeamMemberEntry(user.id);

            if (createResult.error) {
                throw new Error(createResult.error);
            }
        }

        // Add the user as a board member
        const addResult = await addBoardMember(user.id);

        if (addResult.error) {
            throw new Error(addResult.error);
        }

        res.json({
            error: false,
            message: "Der Benutzer wurde erfolgreich als Vorstandsmitglied hinzugefügt.",
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

router.post("/removeBoardMember", async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || email.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_EMAIL.test(email)) {
            throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
        }

        const userResult = await getUserWithEmail(email);

        if (userResult.error || !userResult.data) {
            throw new Error(userResult.error);
        }

        if (userResult.data.length === 0) {
            throw new Error("Es existiert kein Benutzer mit dieser E-Mail-Adresse.");
        }

        const user = userResult.data[0];

        const boardResult = await getBoardDatabase();

        if (boardResult.error || !boardResult.data) {
            throw new Error(boardResult.error);
        }

        let isBoardMember = false;

        for (let i = 0; i < boardResult.data.length; i++) {
            if (boardResult.data[i].userId === user.id) {
                isBoardMember = true;
                break;
            }
        }

        if (!isBoardMember) {
            throw new Error("Der Benutzer ist kein Vorstandsmitglied.");
        }

        // Remove the user as a board member
        const removeResult = await removeBoardMember(user.id);

        if (removeResult.error) {
            throw new Error(removeResult.error);
        }

        res.json({
            error: false,
            message: "Der Benutzer wurde erfolgreich als Vorstandsmitglied entfernt.",
        } as ApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
            } as ApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
        } as ApiEndpointResponse);
    }
});

export default router;
