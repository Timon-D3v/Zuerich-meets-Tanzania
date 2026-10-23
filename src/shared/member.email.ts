import { CONFIG } from "../config";
import { PUBLIC_CONFIG } from "../publicConfig";
import { EMAIL_CONFIG } from "./email.config";
import { sendMail } from "./send.email";

export async function sendLegacyMemberRequestEmail(firstName: string, lastName: string, email: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS("", "", "Divers"),
        `${firstName} ${lastName} hat das Mitgliederformular für manuelle Mitgliedschaften auf der Webseite ausgefüllt oder muss seine Mitgliedschaft verlängern.`,
        `Bitte überprüfe ob ${firstName} ${lastName} den Mitgliederbeitrag überwiesen hat und bestätige es anschliessend auf der Verwaltungsseite.`,
        `Die E-Mail-Adresse von ${firstName} ${lastName} lautet: ${email}`,
        "-----------------------------------------------",
        `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com\nProgrammiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.\n${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.\nBei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS("", "", "Divers")),
            `${firstName} ${lastName} hat das Mitgliederformular für manuelle Mitgliedschaften auf der Webseite ausgefüllt.`,
            `Bitte überprüfe ob ${firstName} ${lastName} den Mitgliederbeitrag überwiesen hat und bestätige es anschliessend auf der Verwaltungsseite.`,
            `Die E-Mail-Adresse von ${firstName} ${lastName} lautet: ${email}`,
            "-----------------------------------------------",
            `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com<br>Programmiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.<br>${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.<br>Bei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(PUBLIC_CONFIG.PERSONAS["CHAIRMAN"].email, `${firstName} ${lastName} will Mitglied werden`, text, html, "Legacy Membership Request", await EMAIL_CONFIG.ATTACHMENTS());

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

export async function sendLegacyMemberExpireNotice(firstName: string, lastName: string, email: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Deine Mitgliedschaft bei zurich meets tanzania ist abgelaufen. Wenn du weiterhin Mitglied bleiben möchtest, überweise bitte den Mitgliederbeitrag auf unser Mitgliedschaftskonto.`,
        `Falls du den Mitgliederbeitrag bereits überwiesen hast, ignoriere bitte diese E-Mail. Deine Mitgliedschaft wird automatisch verlängert, sobald der Mitgliederbeitrag bei uns eingegangen ist.`,
        `(Die Kontodaten findest du hier: ${CONFIG.ORIGIN}/legacy-membership. Das Formular musst du nicht noch einmal ausfüllen.)`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Deine Mitgliedschaft bei zurich meets tanzania ist abgelaufen. Wenn du weiterhin Mitglied bleiben möchtest, überweise bitte den Mitgliederbeitrag auf unser Mitgliedschaftskonto.`,
            `Falls du den Mitgliederbeitrag bereits überwiesen hast, ignoriere bitte diese E-Mail. Deine Mitgliedschaft wird automatisch verlängert, sobald der Mitgliederbeitrag bei uns eingegangen ist.`,
            `(Die Kontodaten findest du hier: ${CONFIG.ORIGIN}/legacy-membership. Das Formular musst du nicht noch einmal ausfüllen.)`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, `Mitgliedschaft abgelaufen`, text, html, "Legacy Membership Expiration Notice", await EMAIL_CONFIG.ATTACHMENTS());

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

export async function sendCriticalErrorEmailForStripeSubscriptionNotFound(customerId: string, userId: number): Promise<void> {
    const text = [
        EMAIL_CONFIG.GREETINGS("", "", "Divers"),
        `Diese E-Mail wurde automatisch generiert, da ein kritischer Fehler im System aufgetreten ist. Ein Mitglied konnte nach erfolgreicher Stripe-Zahlung nicht gefunden werden.`,
        `Bitte leite diese E-Mail direkt an den Entwickler weiter (${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}). Weitere Informationen:`,
        `Stripe Customer Id: ${customerId}`,
        `Benutzer Id: ${userId}`,
        "-----------------------------------------------",
        `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com\nProgrammiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.\n${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.\nBei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS("", "", "Divers")),
            `Diese E-Mail wurde automatisch generiert, da ein kritischer Fehler im System aufgetreten ist. Ein Mitglied konnte nach erfolgreicher Stripe-Zahlung nicht gefunden werden.`,
            `Bitte leite diese E-Mail direkt an den Entwickler weiter (${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}). Weitere Informationen:`,
            `Stripe Customer Id: ${customerId}`,
            `Benutzer Id: ${userId}`,
            "-----------------------------------------------",
            `Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com<br>Programmiert und aufgesetzt von ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name}.<br>${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name} ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.<br>Bei Fragen oder Problemen, kontaktiere bitte den Entwickler unter ${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email}.`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    await sendMail(PUBLIC_CONFIG.PERSONAS["CHAIRMAN"].email, `FEHLER: Mitglied wurde nicht gefunden`, text, html, "Membership Error after Stripe PaymentIntent Succeeded", await EMAIL_CONFIG.ATTACHMENTS());
    await sendMail(PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email, `FEHLER: Mitglied wurde nicht gefunden`, text, html, "Membership Error after Stripe PaymentIntent Succeeded", await EMAIL_CONFIG.ATTACHMENTS());
}
