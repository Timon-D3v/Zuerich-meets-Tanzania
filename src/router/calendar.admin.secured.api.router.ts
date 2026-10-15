import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import { ApiEndpointResponse, CalendarEvent, GetCalendarEventsApiEndpointResponse } from "..";
import { createCalendarEvent, deleteCalendarEvent, getAllCalendarEvents } from "../shared/calendar.database";

// Router Serves under /api/secured/admin/calendar
const router = Router();

router.post("/createEvent", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, isMultipleDays, date, startDate, endDate, timeIsSpecific, startTime, endTime } = req.body;

        if (typeof isMultipleDays !== "boolean") {
            throw new Error("Invalid parameter 'isMultipleDays'.");
        }

        if (typeof timeIsSpecific !== "boolean") {
            throw new Error("Invalid parameter 'timeIsSpecific'.");
        }

        if (typeof title !== "string" || title.trim() === "") {
            throw new Error("Invalid parameter 'title'.");
        }

        if (isMultipleDays) {
            if (typeof startDate !== "string" || startDate.trim() === "" || isNaN(Date.parse(startDate))) {
                throw new Error("Invalid parameter 'startDate'.");
            }

            if (typeof endDate !== "string" || endDate.trim() === "" || isNaN(Date.parse(endDate))) {
                throw new Error("Invalid parameter 'endDate'.");
            }

            if (new Date(startDate) >= new Date(endDate)) {
                throw new Error("'startDate' has to be before 'endDate'.");
            }
        } else {
            if (typeof date !== "string" || date.trim() === "" || isNaN(Date.parse(date))) {
                throw new Error("Invalid parameter 'date'.");
            }
        }

        if (timeIsSpecific) {
            if (typeof startTime !== "string" || startTime.trim() === "" || !/^\d{2}:\d{2}$/.test(startTime)) {
                throw new Error("Invalid parameter 'startTime'.");
            }

            if (typeof endTime !== "string" || endTime.trim() === "" || !/^\d{2}:\d{2}$/.test(endTime)) {
                throw new Error("Invalid parameter 'endTime'.");
            }

            if (new Date(`2000-01-01T${startTime}:00`) >= new Date(`2000-01-01T${endTime}:00`)) {
                throw new Error("'startTime' has to be before 'endTime'.");
            }
        }

        // Everything is valid, create the date
        const createdStartDate = `${isMultipleDays ? startDate : date}T${timeIsSpecific ? startTime : "00:00"}:00`;
        const createdEndDate = `${isMultipleDays ? endDate : date}T${timeIsSpecific ? endTime : "00:00"}:00`;

        const result = await createCalendarEvent(title, createdStartDate, createdEndDate);

        if (result.error !== null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Success",
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

router.get("/getAllEvents", async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await getAllCalendarEvents();

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

router.post("/deleteEvent", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        if (typeof id !== "number" || isNaN(id) || id <= 0) {
            throw new Error("Invalid parameter 'id'.");
        }

        const result = await deleteCalendarEvent(id);

        if (result.error !== null) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Success",
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
