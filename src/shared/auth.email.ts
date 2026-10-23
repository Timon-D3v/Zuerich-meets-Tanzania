import { CONFIG } from "../config";
import { EMAIL_CONFIG } from "./email.config";
import { sendMail } from "./send.email";

export async function sendPasswordRecoveryConfirmationCode(code: string, email: string, firstName: string, lastName: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Bitte bestätige deine Anfrage um dein Passwort zurückzusetzen. Dein Bestätigungscode lautet:`,
        code,
        `(Der Code ist etwa 60 Minuten gültig. Link zur Bestätigungsseite: ${CONFIG.ORIGIN}/password-recovery-confirm?email=${email})`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Bitte bestätige deine Anfrage um dein Passwort zurückzusetzen. Dein Bestätigungscode lautet:`,
            code,
            `(Der Code ist etwa 60 Minuten gültig. Link zur Bestätigungsseite: ${CONFIG.ORIGIN}/password-recovery-confirm?email=${email})`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Passwort zurücksetzten?", text, html, "Password Recovery Confirmation Code", await EMAIL_CONFIG.ATTACHMENTS());
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

export async function sendNewPassword(password: string, email: string, firstName: string, lastName: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Deine Anfrage um dein Passwort zurückzusetzen wurde bestätigt. Dein neues Passwort lautet:`,
        password,
        "(Aus Sicherheitsgründen empfehlen wir, das Passwort nach dem ersten Login sofort unter 'Mein Account' zu ändern.)",
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Deine Anfrage um dein Passwort zurückzusetzen wurde bestätigt. Dein neues Passwort lautet:`,
            password,
            "(Aus Sicherheitsgründen empfehlen wir, das Passwort nach dem ersten Login sofort unter 'Mein Account' zu ändern.)",
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Neues Passwort", text, html, "New Password", await EMAIL_CONFIG.ATTACHMENTS());
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

export async function sendPasswordChangeConfirmation(password: string, email: string, firstName: string, lastName: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Du hast gerade dein Passwort auf der Account-Seite geändert. Dein neues Passwort lautet:`,
        password,
        "(Falls du das nicht warst, empfehlen wir, das Passwort unter 'Mein Account' selbst zu ändern oder das Passwort zurückzusetzen.)",
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Du hast gerade dein Passwort auf der Account-Seite geändert. Dein neues Passwort lautet:`,
            password,
            "(Falls du das nicht warst, empfehlen wir, das Passwort unter 'Mein Account' selbst zu ändern oder das Passwort zurückzusetzen.)",
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Passwort geändert", text, html, "Password Change Confirmation", await EMAIL_CONFIG.ATTACHMENTS());
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

export async function sendSignUpConfirmationCode(code: string, email: string, firstName: string, lastName: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Bitte bestätige deine Anfrage um deinen Account bei ZMT zu erstellen. Dein Bestätigungscode lautet:`,
        code,
        `(Der Code ist etwa 60 Minuten gültig. Link zur Bestätigungsseite: ${CONFIG.ORIGIN}/signup-confirm?email=${email})`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Bitte bestätige deine Anfrage um deinen Account bei ZMT zu erstellen. Dein Bestätigungscode lautet:`,
            code,
            `(Der Code ist etwa 60 Minuten gültig. Link zur Bestätigungsseite: ${CONFIG.ORIGIN}/signup-confirm?email=${email})`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Account erstellen?", text, html, "Signup Confirmation Code", await EMAIL_CONFIG.ATTACHMENTS());
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

export async function sendPasswordFromAdmin(password: string, email: string, firstName: string, lastName: string): Promise<boolean> {
    const text = [
        EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers"),
        `Es wurde ein Account bei www.zurich-meets-tanzania.com für dich erstellt. Dein Passwort lautet:`,
        password,
        `Falls du das nicht wolltest, kontaktiere bitte einen Administrator unter ${CONFIG.ORIGIN}/contact \n(Aus Sicherheitsgründen empfehlen wir, das Passwort nach dem ersten Login sofort unter 'Mein Account' zu ändern.)`,
        EMAIL_CONFIG.REGARDS,
    ].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, "Divers")),
            `Es wurde ein Account bei Zurich meets Tanzania für dich erstellt. Dein Passwort lautet:`,
            password,
            `Falls du das nicht wolltest, kontaktiere bitte einen Administrator unter ${CONFIG.ORIGIN}/contact <br>(Aus Sicherheitsgründen empfehlen wir, das Passwort nach dem ersten Login sofort unter 'Mein Account' zu ändern.)`,
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Account erstellen?", text, html, "Signup Confirmation Code", await EMAIL_CONFIG.ATTACHMENTS());

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
