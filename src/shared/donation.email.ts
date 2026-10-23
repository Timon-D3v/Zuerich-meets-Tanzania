import { PUBLIC_CONFIG } from "../publicConfig";
import { EMAIL_CONFIG } from "./email.config";
import { sendMail } from "./send.email";

export async function sendDonationRequestEmail(amount: number, firstName: string, lastName: string, email: string, usageType: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS("", "", "Divers"),
        `${firstName} ${lastName} hat via dem Spendenformular auf der Webseite ${amount}chf gespendet.`,
        `Der angegebene Verwendungszweck ist: ${usageType}`,
        `Die E-Mail-Adresse des Spenders lautet: ${email}`,
        "-----------------------------------------------",
        `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com\nProgrammiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.\n${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.\nBei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS("", "", "Divers")),
            `${firstName} ${lastName} hat via dem Spendenformular auf der Webseite ${amount}chf gespendet.`,
            `Der angegebene Verwendungszweck ist: ${usageType}`,
            `Die E-Mail-Adresse des Spenders lautet: ${email}`,
            "-----------------------------------------------",
            `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com<br>Programmiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.<br>${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.<br>Bei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(PUBLIC_CONFIG.PERSONAS["CHAIRMAN"].email, `${firstName} ${lastName} hat gespendet`, text, html, "Donation Request", await EMAIL_CONFIG.ATTACHMENTS());

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
