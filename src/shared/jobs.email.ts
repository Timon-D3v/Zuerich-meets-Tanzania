import { CONFIG } from "../config";
import { EMAIL_CONFIG } from "./email.config";
import { sendMail } from "./send.email";

export async function sendCriticalJobFailureNotification(fullName: string, email: string, errorMessage: string): Promise<boolean> {
    if (CONFIG.ENV === "dev") {
        console.info("Development environment detected. Skipping sending critical job failure notification email.");
        return true;
    }

    const text = [
        EMAIL_CONFIG.GREETINGS(fullName, "", "Divers"),
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
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(fullName, "", "Divers")),
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
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Kritischer Fehler - Job fehlgeschlagen", text, html, "Critical Job Failure Notification", await EMAIL_CONFIG.ATTACHMENTS());

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
