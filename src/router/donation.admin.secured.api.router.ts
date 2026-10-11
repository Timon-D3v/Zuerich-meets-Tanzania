import { Request, Response, Router } from "express";
import { PUBLIC_CONFIG } from "../publicConfig";
import {
    updateDonationMeterWithId,
    createDonationMeter,
    deactivateDonationMeterWithId,
    getDonationRequests,
    getDonationRequestById,
    reviewDonationRequest,
    getAllDonationMeters,
    increaseDonationMeter,
    getOpenDonationRequests,
    getAllDonors,
} from "../shared/donation.database";
import { ApiEndpointResponse, GetDonationHistoryApiEndpointResponse, Donation, Donor, GetAllDonorsApiEndpointResponse } from "..";

// Router Serves under /api/secured/admin/donation
const router = Router();

router.post("/addDonationMeter", async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, target } = req.body;

        if (typeof title !== "string" || title.trim() === "") {
            throw new Error("Bitte gib dem Spendenziel einen Titel.");
        }

        if (typeof description !== "string" || description.trim() === "") {
            throw new Error("Bitte gib dem Spendenziel eine Beschreibung.");
        }

        if (typeof target !== "number" || isNaN(target) || target <= 0) {
            throw new Error("Es konnte kein gültiger Spendenziel-Identifikator gefunden werden. Bitte lade die Seite neu und versuche es erneut.");
        }

        const result = await createDonationMeter(title, description, target);

        if (result.error) {
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

router.post("/deactivateDonationMeter", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        if (typeof id !== "number" || isNaN(id)) {
            throw new Error("Es konnte kein gültiger Spendenziel-Identifikator gefunden werden. Bitte lade die Seite neu und versuche es erneut.");
        }

        const result = await deactivateDonationMeterWithId(id);

        if (result.error) {
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

router.post("/updateDonationMeter", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, title, description, currentValue, maxValue } = req.body;

        if (typeof id !== "number" || isNaN(id)) {
            throw new Error("Es konnte kein gültiger Spendenziel-Identifikator gefunden werden. Bitte lade die Seite neu und versuche es erneut.");
        }

        if (typeof title !== "string" || title.trim() === "") {
            throw new Error("Bitte gib dem Spendenziel einen Titel.");
        }

        if (typeof description !== "string" || description.trim() === "") {
            throw new Error("Bitte gib dem Spendenziel eine Beschreibung.");
        }

        if (typeof currentValue !== "number" || isNaN(currentValue)) {
            throw new Error("Bitte gib dem Spendenziel einen gültigen aktuellen Wert.");
        }

        if (typeof maxValue !== "number" || isNaN(maxValue)) {
            throw new Error("Bitte gib dem Spendenziel einen gültigen Maximalwert.");
        }

        const result = await updateDonationMeterWithId(id, title, description, currentValue, maxValue);

        if (result.error) {
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

router.get("/getDonationHistory", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getDonationRequests();

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Success",
            data: result.data,
        } as GetDonationHistoryApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetDonationHistoryApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetDonationHistoryApiEndpointResponse);
    }
});

router.get("/getOpenDonationRequests", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getOpenDonationRequests();

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Success",
            data: result.data,
        } as GetDonationHistoryApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetDonationHistoryApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetDonationHistoryApiEndpointResponse);
    }
});

router.post("/verifyDonationRequest", async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, accepted } = req.body;

        if (typeof id !== "number" || isNaN(id)) {
            throw new Error("Es konnte kein gültiger Spendenanfrage-Identifikator gefunden werden. Bitte lade die Seite neu und versuche es erneut.");
        }

        if (typeof accepted !== "boolean") {
            throw new Error("Es konnte kein gültiger Wert für die Annahme der Spendenanfrage gefunden werden. Bitte lade die Seite neu und versuche es erneut.");
        }

        const result = await getDonationRequestById(id);

        if (result.error) {
            throw new Error(result.error);
        }

        if (!result.data || result.data.length === 0) {
            throw new Error("Es konnte keine Spendenanfrage mit der angegebenen ID gefunden werden.");
        }

        const request = result.data[0] as Donation;

        // Accept the request
        const acceptResult = await reviewDonationRequest(id, accepted);

        if (acceptResult.error) {
            throw new Error(acceptResult.error);
        }

        const donationMetersResult = await getAllDonationMeters();

        if (donationMetersResult.error) {
            throw new Error(donationMetersResult.error);
        }

        const donationMeters = donationMetersResult.data?.map((meter: { title: string }) => meter.title) || [];

        if (donationMeters.includes(request.usageType) && accepted) {
            // Update the donation meter with the new amount
            const updateResult = await increaseDonationMeter(request.usageType, request.amount);

            if (updateResult.error) {
                throw new Error(updateResult.error);
            }
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

router.get("/getDonorList", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await getAllDonors();

        if (result.error) {
            throw new Error(result.error);
        }

        res.json({
            error: false,
            message: "Success",
            data: result.data as Donor[],
        } as GetAllDonorsApiEndpointResponse);
    } catch (error) {
        console.error(error);

        if (error instanceof Error) {
            res.json({
                error: true,
                message: error.message,
                data: [],
            } as GetAllDonorsApiEndpointResponse);

            return;
        }

        res.status(501).json({
            error: true,
            message: PUBLIC_CONFIG.ERROR.INTERNAL_ERROR,
            data: [],
        } as GetAllDonorsApiEndpointResponse);
    }
});

export default router;
