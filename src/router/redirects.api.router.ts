import { Request, Response, Router } from "express";
import { CONFIG } from "../config";
import { PUBLIC_CONFIG } from "../publicConfig";
import { getLocalFileByName } from "../shared/files.database";

// Router Serves under /redirects
const router = Router();

router.get("/heroImage", (_req: Request, res: Response): void => {
    res.redirect(`${CONFIG.DELIVAPI_URL}/cdn/${CONFIG.DELIVAPI_USER}/heroImage`);
});

router.get("/:name", async (_req: Request, res: Response): Promise<void> => {
    const name = _req.params["name"];

    if (!name || Array.isArray(name) || name.trim() === "" || !PUBLIC_CONFIG.REGEX.MATCH_VALID_FILENAME.test(name)) {
        res.status(404).redirect(CONFIG.ORIGIN + "/404");

        return;
    }

    const fileResult = await getLocalFileByName(name);

    if (fileResult.error || !fileResult.data || fileResult.data.length === 0) {
        res.status(404).redirect(CONFIG.ORIGIN + "/404");

        return;
    }

    res.redirect(`${CONFIG.DELIVAPI_URL}/cdn/${CONFIG.DELIVAPI_USER}/${fileResult.data[0].uuid}`);
});

export default router;
