import { CONFIG } from "../config";
import { PUBLIC_CONFIG } from "../publicConfig";
import { EmailConfig } from "..";
import { type MailComposerOptions } from "nodemailer";

const BANNER_LOGO_CID = "banner-logo@" + CONFIG.ORIGIN; // Archive: https://ik.imagekit.io/zmt/email%20files/logo.png
const INSTAGRAM_LOGO_CID = "instagram-logo@" + CONFIG.ORIGIN; // Archive: https://ik.imagekit.io/zmt/email%20files/instgram.png
const FACEBOOK_LOGO_CID = "facebook-logo@" + CONFIG.ORIGIN; // Archive: https://ik.imagekit.io/zmt/email%20files/facebook.png
const DEVELOPER_LOGO_CID = "dev-logo@" + CONFIG.ORIGIN; // Archive: https://ik.imagekit.io/timon/cdn/icon

const BANNER_LOGO_PATH = "/email/logo.png";
const INSTAGRAM_LOGO_PATH = "/email/instagram.png";
const FACEBOOK_LOGO_PATH = "/email/facebook.png";
const DEVELOPER_LOGO_PATH = "/email/dev.png";

let BANNER_LOGO_BUFFER: Buffer | null = null;
let INSTAGRAM_LOGO_BUFFER: Buffer | null = null;
let FACEBOOK_LOGO_BUFFER: Buffer | null = null;
let DEVELOPER_LOGO_BUFFER: Buffer | null = null;

async function loadAsset(path: string): Promise<Buffer> {
    const request = await fetch(CONFIG.ORIGIN + path);

    if (!request.ok || request.status !== 200) {
        throw new Error(`Failed to load asset from ${path}: ${request.status} ${request.statusText}`);
    }

    const arrayBuffer = await request.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export const EMAIL_CONFIG: EmailConfig = {
    NEWSLETTER_SUBJECT: "Es gibt Neuigkeiten!",
    GREETINGS: (fistName: string, lastName: string, gender: "Herr" | "Frau" | "Divers"): string => {
        switch (gender) {
            case "Herr":
                return `Lieber Herr ${lastName}`;
                break;
            case "Frau":
                return `Liebe Frau ${lastName}`;
                break;
            default:
                return `Guten Tag ${fistName} ${lastName}`;
                break;
        }
    },
    GREETINGS_HTML: (greetings: string): string => `<p style="
            font-size: 18px; 
            color: #070d13; 
            font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
            display: block;
            margin-block-start: 0; 
            margin-block-end: 0; 
            margin-inline-start: 0; 
            margin-inline-end: 0; 
            margin: 1em 0; 
            word-wrap: normal; 
            word-break: keep-all; 
            -webkit-hyphens: auto;
            hyphens: auto; ">
                ${greetings}    
            </p><p style="
            font-size: 15px; 
            color: #070d13; 
            font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
            display: block;
            margin-block-start: 0; 
            margin-block-end: 0; 
            margin-inline-start: 0; 
            margin-inline-end: 0; 
            margin: 1em 0; 
            word-wrap: normal; 
            word-break: keep-all; 
            -webkit-hyphens: auto;
            hyphens: auto; ">`,
    REGARDS: "\n\nMit freundlichen Grüssen\nzurich meets tanzania",
    REGARDS_HTML: `</p><p style="
            font-size: 18px; 
            color: #070d13; 
            font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
            display: block; 
            margin-block-start: 0; 
            margin-block-end: 0; 
            margin-inline-start: 0; 
            margin-inline-end: 0; 
            margin: 1em 0; 
            word-wrap: normal; 
            word-break: keep-all; 
            -webkit-hyphens: auto;
            hyphens: auto;">
                    Mit freundlichen Grüssen
                    <br>
                    <strong style="
                        font-size: 18px; 
                        color: #070d13; 
                        font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                        font-weight: bold;">
                            zurich meets tanzania
                    </strong>
                </p>`,
    HEADER: `<div style="display: block; overflow-x: auto;">
                <table align="center" style="width: 100%; background-color: #fff5e5;">
                    <td style="display: block; min-height: 100px; margin-bottom: 20px;">
                        <table align="right">
                            <tbody>
                                <tr>
                                    <td>
                                        <a style="
                                            text-decoration: none; 
                                            cursor: pointer; 
                                            height: 100px; 
                                            color: #070d13; 
                                            font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" 
                                            
                                            href="${CONFIG.ORIGIN}"
                                        >
                                            <img style="height: 90px; padding: 5px; margin: 0 5px;" alt="Banner" src="cid:${BANNER_LOGO_CID}">
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td style="width: 100%; display: block;">
                        <table align="center" style="background-color: #fff5e5;">
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="display: block; max-width: 640px; min-width: 250px; background-color: #ffebcc; padding: 25px;">`,
    FOOTER: `                       </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td style="display: block; width: 100%; min-height: 50px; padding-top: 20px;">
                            <table align="center">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center;">
                                            <a style="
                                                font-size: 18px; 
                                                margin-right: 20px; 
                                                line-height: 1.5; 
                                                color: #070d13; 
                                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                                                cursor: pointer; 
                                                text-decoration: underline;" 
                                                
                                                href="${CONFIG.ORIGIN}/#scroll_to_news"
                                            >
                                                Aktuelles
                                            </a>
                                            <a style="
                                                font-size: 18px; 
                                                margin-right: 20px; 
                                                line-height: 1.5; 
                                                color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                                                cursor: pointer; 
                                                text-decoration: underline;" 
                                                
                                                href="${CONFIG.ORIGIN}"
                                            >
                                                Homepage
                                            </a>
                                            <a style="
                                                font-size: 18px; 
                                                line-height: 1.5; 
                                                color: #070d13; 
                                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                                                cursor: pointer; 
                                                text-decoration: underline;" 
                                                
                                                href="${CONFIG.ORIGIN}/newsletter/unsubscribe"
                                            >
                                                Abmelden
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table align="center" style="padding: 20px 0;">
                                <tbody>
                                    <tr>
                                        <td>
                                            <a style="
                                                display: block; 
                                                height: 30px; 
                                                width: 30px; 
                                                cursor: pointer; 
                                                margin-right: 20px; 
                                                text-decoration: none; 
                                                color: #070d13; 
                                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" 
                                                
                                                href="${PUBLIC_CONFIG.INSTAGRAM_URL}"
                                            >
                                                <img style="
                                                    height: 30px; 
                                                    width: 30px; 
                                                    overflow: clip; 
                                                    overflow-clip-margin: content-box;" 
                                                    
                                                    alt="Instagram Link" 
                                                    src="cid:${INSTAGRAM_LOGO_CID}"
                                                >
                                            </a>
                                        </td>
                                        <td>
                                            <a style="
                                                display: block; 
                                                height: 30px; 
                                                width: 30px; 
                                                cursor: pointer; 
                                                text-decoration: none; 
                                                margin-right: 20px; 
                                                color: #070d13; 
                                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" 
                                                
                                                href="${PUBLIC_CONFIG.FACEBOOK_URL}"
                                            >
                                                <img style="
                                                    height: 30px; 
                                                    width: 30px; 
                                                    overflow: clip; 
                                                    overflow-clip-margin: content-box;" 
                                                    
                                                    alt="Facebook Link" 
                                                    src="cid:${FACEBOOK_LOGO_CID}"
                                                >
                                            </a>
                                        </td>
                                        <td>
                                            <a style="
                                                display: block; 
                                                height: 30px; 
                                                width: 30px; 
                                                cursor: pointer; 
                                                text-decoration: none; 
                                                color: #070d13; 
                                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" 
                                                
                                                href="${PUBLIC_CONFIG.PERSONAS["DEVELOPER"].website}"
                                            >
                                                <img style="
                                                    height: 30px; 
                                                    width: 30px; 
                                                    overflow: clip; 
                                                    overflow-clip-margin: content-box;" 
                                                    
                                                    src="cid:${DEVELOPER_LOGO_CID}" 
                                                    alt="Logo des Entwicklers"
                                                >
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </table>
                </div>`,
    NEWSLETTER_BODY: (preview: string): string =>
        `\nWir freuen uns Ihnen mitteilen zu können, dass wir Neuigkeiten haben.\nSie können sie sich gerne unter folgendem Link anschauen: ${CONFIG.ORIGIN}/#scroll_to_news\n\nHier ist schon eine kleine Vorschau:\n` + preview,
    NEWSLETTER_BODY_HTML: (preview: string): string => `<p style="
                            font-size: 16px; 
                            color: #070d13; 
                            font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                            display: block; 
                            margin-block-start: 0; 
                            margin-block-end: 0; 
                            margin-inline-start: 0; 
                            margin-inline-end: 0; 
                            margin: 1em 0; 
                            word-wrap: normal; 
                            word-break: keep-all;
                            -webkit-hyphens: auto; 
                            hyphens: auto; "
                        >
                            Wir freuen uns Ihnen mitteilen zu können, dass wir Neuigkeiten haben. 
                            Sie können sie sich gerne unter folgendem 
                            <a style="
                                color: #c2630a; 
                                text-decoration: underline; 
                                cursor: pointer; 
                                font-size: 16px; 
                                font-family: 'Titillium Web', Helvetica, Arial, sans-serif; 
                                display: inline; 
                                word-wrap: normal; 
                                word-break: keep-all;
                                -webkit-hyphens: auto; 
                                hyphens: auto;" 
                                
                                href="${CONFIG.ORIGIN}/#scroll_to_news"
                            >
                                Link
                            </a>
                            anschauen.
                            <br>
                            <br>
                            Hier ist schon eine kleine Vorschau:
                            <br>
                            ${preview}
                        </p>`,
    ATTACHMENTS: async (...args: Exclude<MailComposerOptions["attachments"], undefined>): Promise<MailComposerOptions["attachments"]> => {
        if (BANNER_LOGO_BUFFER === null) {
            BANNER_LOGO_BUFFER = await loadAsset(BANNER_LOGO_PATH);
        }

        if (INSTAGRAM_LOGO_BUFFER === null) {
            INSTAGRAM_LOGO_BUFFER = await loadAsset(INSTAGRAM_LOGO_PATH);
        }

        if (FACEBOOK_LOGO_BUFFER === null) {
            FACEBOOK_LOGO_BUFFER = await loadAsset(FACEBOOK_LOGO_PATH);
        }

        if (DEVELOPER_LOGO_BUFFER === null) {
            DEVELOPER_LOGO_BUFFER = await loadAsset(DEVELOPER_LOGO_PATH);
        }

        return [
            ...args,
            { filename: "logo.png", content: BANNER_LOGO_BUFFER, cid: BANNER_LOGO_CID },
            { filename: "instagram.png", content: INSTAGRAM_LOGO_BUFFER, cid: INSTAGRAM_LOGO_CID },
            { filename: "facebook.png", content: FACEBOOK_LOGO_BUFFER, cid: FACEBOOK_LOGO_CID },
            { filename: "dev.png", content: DEVELOPER_LOGO_BUFFER, cid: DEVELOPER_LOGO_CID },
        ];
    },
};
