import { CONFIG } from "../config";
import { PUBLIC_CONFIG } from "../publicConfig";
import { sendMail } from "./send.email";

export async function sendCriticalJobFailureNotification(fullName: string, email: string, errorMessage: string): Promise<boolean> {
    if (CONFIG.ENV === "dev") {
        console.info("Development environment detected. Skipping sending critical job failure notification email.");
        return true;
    }

    const text = [
        PUBLIC_CONFIG.EMAIL.GREETINGS(fullName, "", "Divers"),
        "Es gab einen kritischen Fehler bei der Ausführung eines Jobs. Bitte überprüfe die Logs für weitere Details:",
        errorMessage,
        "(Der Job wurde nach 5 Versuchen abgebrochen um " +
            new Date().toLocaleDateString("de-CH", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
            }) +
            ".)",
        PUBLIC_CONFIG.EMAIL.REGARDS,
    ].join("\n\n");

    const html =
        PUBLIC_CONFIG.EMAIL.HEADER +
        [
            PUBLIC_CONFIG.EMAIL.GREETINGS_HTML(PUBLIC_CONFIG.EMAIL.GREETINGS(fullName, "", "Divers")),
            "Es gab einen kritischen Fehler bei der Ausführung eines Jobs. Bitte überprüfe die Logs für weitere Details:",
            errorMessage,
            "(Der Job wurde nach 5 Versuchen abgebrochen um " +
                new Date().toLocaleDateString("de-CH", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }) +
                ".)",
            PUBLIC_CONFIG.EMAIL.REGARDS_HTML,
        ].join("<br><br>") +
        PUBLIC_CONFIG.EMAIL.FOOTER;

    const request = await sendMail(email, "Kritischer Fehler - Job fehlgeschlagen", text, html, "Critical Job Failure Notification");

    if (request === null) {
        console.error(`Failed to send email to ${email}:`, "Request returned null");

        return false;
    }

    if (request !== null && request.rejected.length > 0) {
        console.error(`Failed to send email to ${email}:`, "Recipient was rejected by the SMTP server");

        return false;
    }

    return true;
}
