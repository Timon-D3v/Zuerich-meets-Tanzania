import { NewsContent, NewsletterUser } from "..";
import { CONFIG } from "../config";
import { EMAIL_CONFIG } from "./email.config";
import { getAllNewsletterUsers } from "./newsletter.database";
import { sendMail } from "./send.email";
import { markdownToHtml } from "./utils";

export async function sendNewsletterSignUpConfirmation(email: string, id: string, firstName: string, lastName: string, gender: "Herr" | "Frau" | "Divers", timestamp: number): Promise<boolean> {
    const link = CONFIG.ORIGIN + `/newsletter/confirm?id=${id}&email=${email}&firstName=${firstName}&lastName=${lastName}&gender=${gender}&timestamp=${timestamp}`;

    const text = [EMAIL_CONFIG.GREETINGS(firstName, lastName, gender), `Bitte bestätige deine Anmeldung für den Newsletter über diesen Link:\n${link}`, "(Der Link ist etwa 60 Minuten gültig.)", EMAIL_CONFIG.REGARDS].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [
            EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, gender)),
            `Bitte bestätige deine Anmeldung für den Newsletter über diesen <a href="${link}" target="_blank">Link</a>.`,
            "(Der Link ist etwa 60 Minuten gültig.)",
            EMAIL_CONFIG.REGARDS_HTML,
        ].join("<br><br>") +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Anmeldebestätigung Newsletter", text, html, "Newsletter Anmeldung", await EMAIL_CONFIG.ATTACHMENTS());

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

export async function sendNewsletterSignOutConfirmation(email: string, code: string, firstName: string, lastName: string, gender: "Herr" | "Frau" | "Divers"): Promise<boolean> {
    const text = [EMAIL_CONFIG.GREETINGS(firstName, lastName, gender), "Dein Bestätigungscode zum Abmelden von unserem Newsletter lautet:", code, "(Der Code ist etwa 60 Minuten gültig.)", EMAIL_CONFIG.REGARDS].join("\n\n");

    const html =
        EMAIL_CONFIG.HEADER +
        [EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(firstName, lastName, gender)), "BDein Bestätigungscode zum Abmelden von unserem Newsletter lautet:", code, "(Der Code ist etwa 60 Minuten gültig.)", EMAIL_CONFIG.REGARDS_HTML].join(
            "<br><br>",
        ) +
        EMAIL_CONFIG.FOOTER;

    const request = await sendMail(email, "Vom Newsletter Abmelden", text, html, "Newsletter Abmeldung", await EMAIL_CONFIG.ATTACHMENTS());

    if (request === null) {
        console.error(`Failed to send newsletter to ${email}:`, "Request returned null");

        return false;
    }

    if (request !== null && request.rejected.length > 0) {
        console.error(`Failed to send newsletter to ${email}:`, "Recipient was rejected by the SMTP server");

        return false;
    }

    return true;
}

export async function sendNewsletterForNews(newsContent: NewsContent): Promise<boolean> {
    const recipientsResult = await getAllNewsletterUsers();

    if (recipientsResult.error !== null) {
        console.error("Failed to retrieve newsletter recipients:", recipientsResult.error);

        return false;
    }

    const recipients = recipientsResult.data as NewsletterUser[];

    let previewText = "";
    let previewHtml = "";

    for (const element of newsContent.content) {
        if (element.type === "title") {
            previewText += element.content + "\n\n";
            previewHtml += `<u><b>${element.content}</b></u><br><br>`;
        } else if (element.type === "subtitle") {
            previewText += element.content + "\n";
            previewHtml += `<b>${element.content}</b><br>`;
        } else if (element.type === "paragraph") {
            previewText += element.content + "\n\n";
            previewHtml += `${markdownToHtml(element.content)}<br><br>`;
        }
    }

    for (const recipient of recipients) {
        const text = [EMAIL_CONFIG.GREETINGS(recipient.firstName, recipient.lastName, recipient.gender), EMAIL_CONFIG.NEWSLETTER_BODY(previewText), EMAIL_CONFIG.REGARDS].join("\n\n");

        const html =
            EMAIL_CONFIG.HEADER +
            [EMAIL_CONFIG.GREETINGS_HTML(EMAIL_CONFIG.GREETINGS(recipient.firstName, recipient.lastName, recipient.gender)), EMAIL_CONFIG.NEWSLETTER_BODY_HTML(previewHtml), EMAIL_CONFIG.REGARDS_HTML].join("<br><br>") +
            EMAIL_CONFIG.FOOTER;

        const request = await sendMail(recipient.email, EMAIL_CONFIG.NEWSLETTER_SUBJECT, text, html, "Newsletter", await EMAIL_CONFIG.ATTACHMENTS());

        if (request === null) {
            console.error(`Failed to send newsletter to ${recipient.email}:`, "Request returned null");
        }

        if (request !== null && request.rejected.length > 0) {
            console.error(`Failed to send newsletter to ${recipient.email}:`, "Recipient was rejected by the SMTP server");
        }
    }

    return true;
}
