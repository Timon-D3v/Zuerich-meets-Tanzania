import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { ApiEndpointResponse, GetAllFileInformationApiEndpointResponse, GetAllLocalFoldersApiEndpointResponse, LocalFile, LocalFolder } from "..";
import multerInstance from "../shared/instance.multer";
import { delivApiUpdateFile, delivApiDeleteFile } from "delivapi-client";
import { deleteLocalFile, getAllLocalFilenames, getAllLocalFiles, updateLocalFilename, getAllLocalFolders, createLocalFolder, updateLocalFoldername, deleteLocalFolder, moveFilesToFolder, moveFoldersToFolder } from "../shared/files.database";
import { updateLocalFilesMetadataDatabase } from "../shared/files.job";

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

router.post("/renameFolder", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.body?.id;
        const newName = req.body?.newName;

        if (typeof id !== "number" || id <= 0) {
            throw new Error("Die ID des Ordners ist ungültig.");
        }

        if (typeof newName !== "string" || newName.trim() === "" || newName.length > 255) {
            throw new Error("Der neue Name des Ordners ist ungültig.");
        }

        const response = await updateLocalFoldername(id, newName);

        if (response.error) {
            throw new Error(response.error);
        }

        res.json({
            error: false,
            message: "Der Ordner wurde erfolgreich umbenannt.",
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

router.post("/deleteFolder", async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.body?.id;

        if (typeof id !== "number" || id <= 0) {
            throw new Error("Die ID des Ordners ist ungültig.");
        }

        // Check if folder is empty

        // check folders first since this is probably less expensive than checking files
        const folderResult = await getAllLocalFolders();

        if (folderResult.error || folderResult.data === null) {
            throw new Error(folderResult.error);
        }

        if (folderResult.data.some((folder: LocalFolder) => folder.folderId === id)) {
            throw new Error("Der Ordner ist nicht leer. Bitte lösche zuerst alle Unterordner und Dateien.");
        }

        const filesResult = await getAllLocalFiles();

        if (filesResult.error || filesResult.data === null) {
            throw new Error(filesResult.error);
        }

        if (filesResult.data.some((file: LocalFile) => file.folderId === id)) {
            throw new Error("Der Ordner ist nicht leer. Bitte lösche zuerst alle Dateien.");
        }

        // Folder is empty => continue

        const response = await deleteLocalFolder(id);

        if (response.error) {
            throw new Error(response.error);
        }

        res.json({
            error: false,
            message: "Der Ordner wurde erfolgreich gelöscht.",
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

router.get("/rerunUpdateLocalFilesMetadataDatabaseJob", async (req: Request, res: Response): Promise<void> => {
    try {
        await updateLocalFilesMetadataDatabase();

        res.json({
            error: false,
            message: "Das Update der lokalen Datei-Metadaten-Datenbank wurde ausgeführt. (Falls Fehler auftreten, werden die Admins per E-Mail benachrichtigt.)",
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

router.post("/moveFilesToFolder", async (req: Request, res: Response): Promise<void> => {
    try {
        const fileUuids = req.body?.fileUuids;
        const targetFolderId = req.body?.targetFolderId;

        if (targetFolderId !== null && typeof targetFolderId !== "number") {
            throw new Error("Die ID des Ziel-Ordners ist ungültig.");
        }

        if (!Array.isArray(fileUuids) || fileUuids.some((uuid: any) => typeof uuid !== "string" || uuid.trim() === "")) {
            throw new Error("Die UUIDs der Dateien sind ungültig.");
        }

        const result = await moveFilesToFolder(fileUuids, targetFolderId);

        if (result.error || result.data === null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Die Dateien wurden erfolgreich verschoben.",
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

router.post("/moveFoldersToFolder", async (req: Request, res: Response): Promise<void> => {
    try {
        const folderIds = req.body?.folderIds;
        const targetFolderId = req.body?.targetFolderId;

        if (targetFolderId !== null && typeof targetFolderId !== "number") {
            throw new Error("Die ID des Ziel-Ordners ist ungültig.");
        }

        if (!Array.isArray(folderIds) || folderIds.some((id: any) => typeof id !== "number" || id < 0 || isNaN(id) || id === targetFolderId)) {
            throw new Error("Die IDs der Ordner sind ungültig.");
        }

        const result = await moveFoldersToFolder(folderIds, targetFolderId);

        if (result.error || result.data === null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Die Ordner wurden erfolgreich verschoben.",
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
