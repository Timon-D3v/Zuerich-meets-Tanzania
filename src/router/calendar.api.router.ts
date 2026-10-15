import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { CalendarEvent, GetCalendarEventsApiEndpointResponse } from "..";
import { getLastXCalendarEvents } from "../shared/calendar.database";

// Router Serves under /api/calendar
const router = Router();

router.get("/getLastXEvents/:x", async (req: Request, res: Response): Promise<void> => {
    try {
        const { x } = req.params;

        if (typeof x !== "string" || x.trim() === "" || isNaN(Number(x))) {
            throw new Error("Invalid parameter 'x'.");
        }

        const data = await getLastXCalendarEvents(Number(x));

        if (data.error !== null) {
            throw new Error(data.error);
        }

        res.json({
            error: false,
            message: "Success",
            data: data.data as CalendarEvent[],
        } as GetCalendarEventsApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetCalendarEventsApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetCalendarEventsApiEndpointResponse);
    }
});

export default router;
