import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { ApiEndpointResponse, DelivApiFile, GetAllFileInformationApiEndpointResponse, LocalFile } from "..";
import multerInstance from "../shared/instance.multer";
import { delivApiUpdateFile, delivApiDeleteFile } from "delivapi-client";
import { getAllLocalFiles } from "../shared/files.database";

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

export default router;
