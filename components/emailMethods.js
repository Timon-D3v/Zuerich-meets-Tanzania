import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Mailjet from "node-mailjet";
import { randomString } from "timonjs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import EMAILS from "../backend/constants/emails.js";
import { getAccount, updateProfile } from "../backend/db/db.zmt.js";
import { createMailSubject, createMailText } from "./createMailMethods.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_PUBLIC_KEY,
    apiSecret: process.env.MAILJET_PRIVAT_KEY,
});

export async function sendMail(email, data, files = [], test = false) {
    try {
        const { Subject, TextPart, HTMLPart, CustomID } = data;
        const req = await mailjet.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: EMAILS.sender_email,
                        Name: EMAILS.sender_name,
                    },
                    To: [
                        {
                            Email: email,
                        },
                    ],
                    Subject,
                    TextPart,
                    HTMLPart,
                    CustomID,
                    Attachments: files,
                },
            ],
            SandboxMode: test,
        });
        return req;
    } catch (err) {
        console.error(err.message);
        return err;
    }
}

export function sendNewsletterEmail(recipients, subject, text, files = []) {
    recipients.forEach((recipient) => {
        let { anschrift, anschrift_html } = EMAILS;
        const { header, newsletter, grüsse_html, footer } = EMAILS;

        if (recipient.gender === "Herr") {
            anschrift = anschrift.replace("___ANREDE___", "Lieber");
            anschrift_html = anschrift_html.replace("___ANREDE___", "Lieber");

            anschrift = anschrift.replace("___GENDER___", recipient.gender);
            anschrift_html = anschrift_html.replace("___GENDER___", recipient.gender);
        } else if (recipient.gender === "Frau") {
            anschrift = anschrift.replace("___ANREDE___", "Liebe");
            anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe");

            anschrift = anschrift.replace("___GENDER___", recipient.gender);
            anschrift_html = anschrift_html.replace("___GENDER___", recipient.gender);
        } else {
            anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
            anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

            anschrift = anschrift.replace("___GENDER___", recipient.vorname);
            anschrift_html = anschrift_html.replace("___GENDER___", recipient.vorname);
        }

        anschrift = anschrift.replace("___NACHNAME___", recipient.nachname);
        anschrift_html = anschrift_html.replace("___NACHNAME___", recipient.nachname);

        const data = {
            Subject: subject,
            TextPart: anschrift + text + EMAILS.grüsse,
            HTMLPart: header + anschrift_html + newsletter + text.replaceAll("\n", "<br>") + "</p>" + grüsse_html + footer,
            CustomID: "Newsletter",
        };
        sendMail(recipient.email, data, files);
    });
}

export function sendMailCode(email, user) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    if (user.gender === "Herr") {
        anschrift = anschrift.replace("___ANREDE___", "Lieber");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Lieber");

        anschrift = anschrift.replace("___GENDER___", user.gender);
        anschrift_html = anschrift_html.replace("___GENDER___", user.gender);
    } else if (user.gender === "Frau") {
        anschrift = anschrift.replace("___ANREDE___", "Liebe");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe");

        anschrift = anschrift.replace("___GENDER___", user.gender);
        anschrift_html = anschrift_html.replace("___GENDER___", user.gender);
    } else {
        anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

        anschrift = anschrift.replace("___GENDER___", user.vorname);
        anschrift_html = anschrift_html.replace("___GENDER___", user.vorname);
    }

    anschrift = anschrift.replace("___NACHNAME___", user.nachname);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.nachname);

    const code = randomString(16);
    const text = "Dein Code lautet: " + code;

    const data = {
        Subject: "Newsletter Abmeldung",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0, 304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Newsletter Abmeldung",
    };
    sendMail(email, data);

    return code;
}

export function sendRecoveryCode(email, user) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
    anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

    anschrift = anschrift.replace("___GENDER___", user.name);
    anschrift_html = anschrift_html.replace("___GENDER___", user.name);

    anschrift = anschrift.replace("___NACHNAME___", user.family_name);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.family_name);

    const code = randomString(16);
    const text = "Dein Code lautet: " + code;

    const data = {
        Subject: "Passwort zurücksetzen",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0, 304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Passwort zurücksetzen",
    };
    sendMail(email, data);

    return code;
}

export async function sendRecoveryPassword(email) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    const [user] = await getAccount(email);

    const { id, name, family_name, phone, address } = user;

    anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
    anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

    anschrift = anschrift.replace("___GENDER___", user.name);
    anschrift_html = anschrift_html.replace("___GENDER___", user.name);

    anschrift = anschrift.replace("___NACHNAME___", user.family_name);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.family_name);

    const code = randomString(32);
    const text = "Dein neues Passwort lautet: " + code;

    const hash = await bcrypt.hash(code, 10);

    updateProfile(id, email, hash, name, family_name, email, phone, address);

    const data = {
        Subject: "Neues Passwort",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0, 304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Neues Passwort",
    };
    sendMail(email, data);
}

export async function sendContactMail(body) {
    const { header, footer } = EMAILS;
    const data = {
        Subject: createMailSubject(body),
        TextPart: createMailText(body),
        HTMLPart: header + "<p>" + createMailText(body).replaceAll("\n", "<br>") + "</p>" + footer,
        CustomID: "Contact Form",
    };
    const result = await sendMail("info@zurich-meets-tanzania.com", data);
    return result.response.status;
}

export function sendCriticalErrorMail(errorMessage, message) {
    sendMail("info@zurich-meets-tanzania.com", {
        Subject: "Kritischer Fehler",
        TextPart: "Ein kritischer Fehler ist aufgetreten\n\n" + message.replace("<br>", "\n") + errorMessage,
        HTMLPart: "<h1>Ein kritischer Fehler ist aufgetreten</h1><br><br><p>" + message + errorMessage + "</p>",
        CustomID: randomString(32),
    });
}

export async function sendNewsletterSignUpConfirmation(email, id, name, family_name, gender) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    if (gender === "Herr") {
        anschrift = anschrift.replace("___ANREDE___", "Lieber");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Lieber");

        anschrift = anschrift.replace("___GENDER___", gender);
        anschrift_html = anschrift_html.replace("___GENDER___", gender);
    } else if (gender === "Frau") {
        anschrift = anschrift.replace("___ANREDE___", "Liebe");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe");

        anschrift = anschrift.replace("___GENDER___", gender);
        anschrift_html = anschrift_html.replace("___GENDER___", gender);
    } else {
        anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
        anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

        anschrift = anschrift.replace("___GENDER___", name);
        anschrift_html = anschrift_html.replace("___GENDER___", name);
    }

    anschrift = anschrift.replace("___NACHNAME___", family_name);
    anschrift_html = anschrift_html.replace("___NACHNAME___", family_name);

    const link = process.env.ORIGIN + `/newsletter/signUp?id=${id}&email=${email}&name=${name}&family_name=${family_name}&gender=${gender}`;
    const text = `Bitte bestätige deine Anmeldung für den Newsletter über diesen Link: ${link}\n\nDer Link ist 30 Minuten gültig.`;
    const htmlText = `Bitte bestätige deine Anmeldung für den Newsletter über diesen <a href="${link}">Link</a><br><br>Der Link ist 30 Minuten gültig.`;

    const data = {
        Subject: "Newsletter Anmeldung",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0, 304) + htmlText + "</p>" + grüsse_html + footer,
        CustomID: "Newsletter Anmeldung",
    };

    const { response } = await sendMail(email, data);

    return response?.status === 200;
}
