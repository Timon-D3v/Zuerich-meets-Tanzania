import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { ApiEndpointResponse, DelivApiFile, GetAllFileInformationApiEndpointResponse, GetAllLocalFoldersApiEndpointResponse, LocalFile, LocalFolder } from "..";
import multerInstance from "../shared/instance.multer";
import { delivApiUpdateFile, delivApiDeleteFile } from "delivapi-client";
import { deleteLocalFile, getAllLocalFilenames, getAllLocalFiles, updateLocalFilename, getAllLocalFolders, createLocalFolder } from "../shared/files.database";

// Router Serves under /api/secured/admin/files
const router = Router();

router.get("/getAllFiles", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllLocalFiles();

        if (result.error || result.data === null) {
            throw new Error("Die Dateien konnten nicht abgerufen werden. Bitte versuche es später erneut. Weitere Informationen: " + result.error);
        }

        res.json({
            error: false,
            message: "Die Dateien wurden erfolgreich abgerufen.",
            data: result.data as LocalFile[],
        } as GetAllFileInformationApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: null,
            } as GetAllFileInformationApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: null,
        } as GetAllFileInformationApiEndpointResponse);
    }
});

router.post("/replaceFile", multerInstance.single("file"), async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        const uuid = req.body?.uuid;

        if (typeof uuid !== "string" || uuid.trim() === "") {
            throw new Error("Die UUID der Datei ist ungültig.");
        }

        if (!file) {
            throw new Error("Es wurde keine Datei hochgeladen.");
        }

        const response = await delivApiUpdateFile(uuid, file.buffer);

        if (response.error) {
            throw new Error("Die Datei konnte nicht ersetzt werden. Bitte versuche es später erneut. Weitere Informationen: " + response.message);
        }

        res.json({
            error: false,
            message: "Die Datei wurde erfolgreich ersetzt.",
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

router.post("/deleteFile", async (req: Request, res: Response): Promise<void> => {
    try {
        const uuid = req.body?.uuid;

        if (typeof uuid !== "string" || uuid.trim() === "") {
            throw new Error("Die UUID der Datei ist ungültig.");
        }

        const response = await delivApiDeleteFile(uuid);

        if (response.error) {
            throw new Error("Die Datei konnte nicht gelöscht werden. Bitte versuche es später erneut. Weitere Informationen: " + response.message);
        }

        const result = await deleteLocalFile(uuid);

        if (result.error) {
            throw new Error("Die Datei konnte nicht aus der Datenbank gelöscht werden. Bitte aktualisiere die lokale Datenbank manuell. Weitere Informationen: " + result.error);
        }

        res.json({
            error: false,
            message: "Die Datei wurde erfolgreich gelöscht.",
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

router.post("/renameFile", async (req: Request, res: Response): Promise<void> => {
    try {
        const uuid = req.body?.uuid;
        const newName = req.body?.newName;

        if (typeof uuid !== "string" || uuid.trim() === "") {
            throw new Error("Die UUID der Datei ist ungültig.");
        }

        if (typeof newName !== "string" || newName.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_FILENAME.test(newName)) {
            throw new Error("Der neue Name der Datei ist ungültig.");
        }

        const allNamesResult = await getAllLocalFilenames();

        if (allNamesResult.error || allNamesResult.data === null) {
            throw new Error("Die Liste der Dateinamen konnte nicht abgerufen werden. Bitte versuche es später erneut.");
        }

        if (allNamesResult.data.some((file: { filename: string } | null) => file?.filename === newName)) {
            throw new Error("Es existiert bereits eine Datei mit diesem Namen.");
        }

        const response = await updateLocalFilename(uuid, newName);

        if (response.error) {
            throw new Error(response.error);
        }

        res.json({
            error: false,
            message: "Die Datei wurde erfolgreich umbenannt.",
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

router.get("/getAllFolders", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllLocalFolders();

        if (result.error || result.data === null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Die Ordner wurden erfolgreich abgerufen.",
            data: result.data as LocalFolder[],
        } as GetAllLocalFoldersApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetAllLocalFoldersApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetAllLocalFoldersApiEndpointResponse);
    }
});

router.post("/createFolder", async (req: Request, res: Response): Promise<void> => {
    try {
        const foldername = req.body?.foldername;
        const parentFolderId = req.body?.parentFolderId;

        if (typeof foldername !== "string" || foldername.trim() === "" || foldername.length > 255) {
            // The name can be anything and also does not have to be unique.
            throw new Error("Der Name des Ordners ist ungültig. Bitte gib einen gültigen Namen ein (1-255 Zeichen).");
        }

        if (parentFolderId !== null && typeof parentFolderId !== "number") {
            throw new Error("Die ID des übergeordneten Ordners ist ungültig.");
        }

        const result = await createLocalFolder(foldername, parentFolderId);

        if (result.error || result.data === null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Der Ordner wurde erfolgreich erstellt.",
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
