import session from "express-session";
import bodyParser from "body-parser";
import Mailjet from "node-mailjet";
import ImageKit from "imagekit";
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import timon from "timonjs";
import https from "https";
import cors from "cors";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as db from "./backend/db/db.zmt.js";
import KARDIOLOGIE from "./backend/constants/kardiologie.js";
import MEDUCATION from "./backend/constants/meducation.js";
import BEGINNING from "./backend/constants/beginning.js";
import CHIRURGIE from "./backend/constants/chirurgie.js";
import TANZANIA from "./backend/constants/tanzania.js";
import FINANZEN from "./backend/constants/finanzen.js";
import STATUTEN from "./backend/constants/statuten.js";
import VORSTAND from "./backend/constants/vorstand.js";
import GYNO from "./backend/constants/gynäkologie.js";
import ABOUT_US from "./backend/constants/admins.js";
import DONATE from "./backend/constants/spenden.js";
import BACKUP from "./backend/constants/backup.js";
import BAJAJI from "./backend/constants/bajaji.js";
import HERO from "./backend/constants/heropage.js";
import VISION from "./backend/constants/vision.js";
import EMAILS from "./backend/constants/emails.js";
import MBUZI from "./backend/constants/mbuzi.js";
import ZMT from "./backend/constants/zmt.js";
import TMZ from "./backend/constants/tmz.js";
import GV from "./backend/constants/gv.js";



const LOAD_LEVEL = "dev"; // Possible Values: "dev" or "prod"



const app = express();/*
const https_options = {
    key: fs.readFileSync("./cert/private.key.pem"),
    cert: fs.readFileSync("./cert/domain.cert.pem"),
    ca: fs.readFileSync("./cert/intermediate.cert.pem"),
};*/



app.set("view engine", "ejs");
dotenv.config();



const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_SECRET_KEY,
    urlEndpoint: "https://ik.imagekit.io/zmt/"
});
const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_PUBLIC_KEY,
    apiSecret: process.env.MAILJET_PRIVAT_KEY
});
const stripe = new Stripe(
    LOAD_LEVEL === "prod" ?
    process.env.STRIPE_PRIVATE_KEY :
    process.env.STRIPE_PRIVATE_KEY_TEST    
);
const payment_keys = [];
const newsletter_code = [];
const recovery_code = [];



async function imagekitUpload (base64, name, folder) {
    let res, fileName = name.replace(/[:\/\\<>{}?]/g, "_").replaceAll(" ", "_");
    imagekit.upload({
        file: base64,
        fileName,
        folder: folder,
        useUniqueFileName: false
    },
    (err, result) => {
        err ? res = err : res = result;
    });
    let path = "https://ik.imagekit.io/zmt" + folder + fileName;
    return {
        path,
        res
    };
};

function toRealDate (date) {return timon.toDateString(new Date(date))};

function createMailSubject (obj) {
    return obj.author_name + " schreibt über Webseitenformular";
};

function createMailText (obj) {
    let date = toRealDate(Date());
    let divider = "----------------------------------------------";
    let address = `${obj.author_name} ${obj.author_family_name} hat diese E-Mail hinterlegt: ${obj.author_email}`;
    let footer1 = "Dies ist eine automatisch verschickte E-Mail über eine API von postmail.invotes.com\nProgrammiert und aufgesetzt von Timon Fiedler.";
    let footer2 = "Timon Fiedler ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.";
    let part2 = `${divider}\n\n${obj.message}\n\n${divider}\n${address}\n${divider}\n\n${footer1}\n${footer2}`;
    return `${obj.author_name} ${obj.author_family_name} schreibt am ${date}: \n${part2}`;
};



async function stripe_c_s_created (subscription_id, period_start, period_end, customer_id, start_date, status) {
    try {
        await db.createTempPayment(subscription_id, period_start, period_end, customer_id, start_date, status);
    } catch (err) {
        const message = "Beim Bezahlen eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        timon.errorLog(err.message);
        sendMail("info@zurich-meets-tanzania.com", {
            Subject: "Kritischer Fehler",
            TextPart: "Ein kritischer Fehler ist aufgetreten\n\n" + message.replace("<br>", "\n") + err.message,
            HTMLPart: "<h1>Ein kritischer Fehler ist aufgetreten</h1><br><br><p>" + message + err.message + "</p>",
            CustomID: timon.randomString(32)
        });
    };
};

async function stripe_c_s_updated (subscription_id, period_start, period_end, status) {
    try {
        const member = await db.getMemberWithSubscriptionId(subscription_id);
        const data = [
            period_start,
            period_end,
            status
        ];

        if (member.length > 0) {
            member = member[0];
            const update = [
                db.updateMemberPeriodStart,
                db.updateMemberPeriodEnd,
                db.updateMemberStatus
            ];

            data.forEach(async (set, i) => {
                if (typeof set !== "undefined") await update[i](subscription_id, set);
            });
        } else {
            const update = [
                db.updateTempSubscriptionPeriodStart,
                db.updateTempSubscriptionPeriodEnd,
                db.updateTempSubscriptionStatus
            ];

            data.forEach(async (set, i) => {
                try {
                    if (typeof set !== "undefined") await update[i](subscription_id, set);
                } catch (err) {
                    console.error("Error:", err);
                };
            });
        };
    } catch (err) {
        const message = "Beim Erneuern des Abos eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        timon.errorLog(err.message);
        sendMail("info@zurich-meets-tanzania.com", {
            Subject: "Kritischer Fehler",
            TextPart: "Ein kritischer Fehler ist aufgetreten\n\n" + message.replace("<br>", "\n") + err.message,
            HTMLPart: "<h1>Ein kritischer Fehler ist aufgetreten</h1><br><br><p>" + message + err.message + "</p>",
            CustomID: timon.randomString(32)
        });
    };
};

async function stripe_c_s_deleted (subscription_id) {
    try {
        const [member] = await db.getMemberWithSubscriptionId(subscription_id);
        const user_id = member.user_id;
        await db.deleteMemberWithSubscriptionId(subscription_id);
        await db.removeMemberWithUserId(user_id);
    } catch (err) {
        const message = "Beim Löschen eines Abos eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        timon.errorLog(err.message);
        sendMail("info@zurich-meets-tanzania.com", {
            Subject: "Kritischer Fehler",
            TextPart: "Ein kritischer Fehler ist aufgetreten\n\n" + message.replace("<br>", "\n") + err.message,
            HTMLPart: "<h1>Ein kritischer Fehler ist aufgetreten</h1><br><br><p>" + message + err.message + "</p>",
            CustomID: timon.randomString(32)
        });
    };
};

async function stripe_i_p_success (customer_id, pdf, url) {
    try {
        const session = await db.getSubscriptionIdWithCustomerId(customer_id);
        let subscription_id;
        if (typeof session === "undefined") {
            subscription_id = await db.getMemberWithCustomerId(customer_id);
            subscription_id = subscription_id.subscription_id;
        } else {
            subscription_id = session.sub_id;
        };
        await db.addInvoiceToDatabase(subscription_id, pdf, url);
    } catch (err) {
        timon.errorLog(err);
    };
};

async function buyMembership (user, key, url) {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: LOAD_LEVEL === "prod" ? 
                    process.env.STRIPE_PRICE_MEMBERSHIP :
                    process.env.STRIPE_PRICE_MEMBERSHIP_TEST,
                quantity: 1
            }],
            mode: "subscription",
            success_url: `${url}/return`,
            cancel_url: `${url}/spenden`
        });

        await db.linkUserWithSession(user, session.id, key)

        return session.url;
    } catch (err) {
        timon.log(err.message);
        return `/spenden?js=errorField`;
    };
};

async function saveVideo (base64, type) {
    type === "video/mp4" ?
    type = ".mp4" :
    type = ".mov";
    const video = path.resolve(dirname(fileURLToPath(import.meta.url)), `./static/vid/${timon.randomString(32) + type}`);
    fs.writeFile(video, base64.split(';base64,').pop(), "base64", err => {
        if (err) console.error('Error saving video:', err);
    });
    return video;
};

async function downloadFileAsBase64(fileUrl) {
    return new Promise((resolve, reject) => {
        https.get(fileUrl, function(response) {
            const chunks = [];
    
            response.on('data', function(chunk) {
                chunks.push(chunk);
            });
    
            response.on('end', function() {
                const buffer = Buffer.concat(chunks);
                const base64String = buffer.toString('base64');
                
                resolve(base64String);
            });
        }).on('error', function(err) {
            reject(err);
        });
    });
};

async function sendMail (email, data, files = [], test = false) {
    try {
        const { Subject, TextPart, HTMLPart, CustomID } = data;
        const req = await mailjet.post("send", {version: "v3.1"}).request({
            Messages: [{
                From: {
                    Email: EMAILS.sender_email,
                    Name: EMAILS.sender_name
                },
                To: [{
                    Email: email
                }],
                Subject,
                TextPart,
                HTMLPart,
                CustomID,
                Attachments: files
            }],
            SandboxMode: test
        });
        return req;
    } catch (err) {
        console.error(err.message);
        return err;
    };
};

function sendNewsletterEmail (recipients, subject, text, files = []) {
    recipients.forEach(recipient => {
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
        };

        anschrift = anschrift.replace("___NACHNAME___", recipient.nachname);
        anschrift_html = anschrift_html.replace("___NACHNAME___", recipient.nachname);

        const data = {
            Subject: subject,
            TextPart: anschrift + text + EMAILS.grüsse,
            HTMLPart: header + anschrift_html + newsletter + text + "</p>" + grüsse_html + footer,
            CustomID: "Newsletter"
        };
        sendMail(recipient.email, data, files);
    });
};

function sendMailCode (email, user) {
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
    };

    anschrift = anschrift.replace("___NACHNAME___", user.nachname);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.nachname);

    const code = timon.randomString(16);
    const text = "Dein Code lautet: " + code;

    const data = {
        Subject: "Newsletter Abmeldung",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0,304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Newsletter Abmeldung"
    };
    sendMail(email, data);

    return code;
};

function sendRecoveryCode (email, user) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
    anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

    anschrift = anschrift.replace("___GENDER___", user.name);
    anschrift_html = anschrift_html.replace("___GENDER___", user.name);

    anschrift = anschrift.replace("___NACHNAME___", user.family_name);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.family_name);

    const code = timon.randomString(16);
    const text = "Dein Code lautet: " + code;

    const data = {
        Subject: "Passwort zurücksetzen",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0,304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Passwort zurücksetzen"
    };
    sendMail(email, data);

    return code;
};

async function sendRecoveryPassword (email) {
    let { anschrift, anschrift_html } = EMAILS;
    const { header, newsletter, grüsse_html, footer } = EMAILS;

    const [ user ] = await db.getAccount(email);

    const { id, name, family_name, phone } = user;

    anschrift = anschrift.replace("___ANREDE___", "Liebe(r)");
    anschrift_html = anschrift_html.replace("___ANREDE___", "Liebe(r)");

    anschrift = anschrift.replace("___GENDER___", user.name);
    anschrift_html = anschrift_html.replace("___GENDER___", user.name);

    anschrift = anschrift.replace("___NACHNAME___", user.family_name);
    anschrift_html = anschrift_html.replace("___NACHNAME___", user.family_name);

    const code = timon.randomString(32);
    const text = "Dein neues Passwort lautet: " + code;

    db.updateProfile(id, email, code, name, family_name, email, phone);

    const data = {
        Subject: "Neues Passwort",
        TextPart: anschrift + text + EMAILS.grüsse,
        HTMLPart: header + anschrift_html + newsletter.substring(0,304) + text + "</p>" + grüsse_html + footer,
        CustomID: "Neues Passwort"
    };
    sendMail(email, data);
};

async function sendContactMail (body) {
    const { header, footer } = EMAILS;
    const data = {
        Subject: createMailSubject(body),
        TextPart: createMailText(body),
        HTMLPart: header + "<p>" + createMailText(body).replaceAll("\n", "<br>") + "</p>" + footer,
        CustomID: "Contact Form"
    };
    const result = await sendMail("info@zurich-meets-tanzania.com", data);
    return result.response.status;
};



app.use(express.static("./static"));
app.use(express.urlencoded({
    extended: true,
    limit: "10000mb"
}));
app.use((req, res, next) => {
    if (req.originalUrl === "/post/stripe/webhook") {
        next();
    } else {
        express.json({limit: "10000mb"})(req, res, next);
    }
});
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 432000000
    }
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
    if (req.originalUrl === "/post/stripe/webhook") {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});
app.use(cors());

if (LOAD_LEVEL === "prod") {
    app.use((req, res, next) => {
        const get = req.get.bind(req);
        req.get = query => {
            if (query === "host") return "www.zurich-meets-tanzania.com";
            return get(query);
        };
        next();
    });
};





app.get("/home", (req, res) => res.status(301).redirect("/"));
app.get("/", async (req, res) => {
    let blogs = await db.getLastXPosts(4)
        .catch(() => {return BACKUP.BLOGS});
    let news = await db.getNews()
        .catch(() => {return BACKUP.NEWS});
    res.render("index.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Sun Jan 21 2024 22:43:11 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Home",
        desc: "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren. Eine bunt zusammengemischte Truppe engagierter, hilfsbereiter Leute. Erfahre auf dieser Seite mehr über unser Team, unsere Freunde in Mbalizi und unsere Partner.",
        sitetype: "home",
        user: req.session.user,
        js: req.query.js,
        last4blogs: blogs,
        news: news,
        member_list: ABOUT_US.TEAM,
        hero: HERO
    });
});

app.get("/signup", (req, res) => res.status(301).redirect("/login?js=toggleForms"));
app.get("/signUp", (req, res) => res.status(301).redirect("/login?js=toggleForms"));
app.get("/registrieren", (req, res) => res.status(301).redirect("/login?js=toggleForms"));
app.get("/einloggen", (req, res) => res.status(301).redirect("/login"));
app.get("/login", async (req, res) => {
    if (req.session.user?.valid) return res.redirect("/profile");
    let redir = req.query.redir;
    if (redir === undefined || typeof redir === "undefined") redir = "/";
    res.render("login.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Thu Feb 22 2024 20:36:37 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Login",
        desc: "Hier können sich Mitglieder und Verwalter einloggen oder neu registrieren.",
        sitetype: "login",
        user: null,
        js: req.query.js,
        redir: redir
    });
});

app.get("/einkaufen", (req, res) => res.status(301).redirect("/shop"));
app.get("/shop", async (req, res) => {
    res.render("shop.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Fri Feb 23 2024 21:15:35 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Shop",
        desc: "Auf dieser Seite können Sie direkt zum Unikat Höngg weiter um die einzigartigen Unikate zu kaufen, die beim Kauf den Verein unterstützen.",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/account", (req, res) => res.status(301).redirect("/profile"));
app.get("/me", (req, res) => res.status(301).redirect("/profile"));
app.get("/profil", (req, res) => res.status(301).redirect("/profile"));
app.get("/konto", (req, res) => res.status(301).redirect("/profile"));
app.get("/profile", async (req, res) => {
    if (!req.session.user?.valid) return res.redirect("/login?redir=/profile");
    res.render("profile.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Sat Feb 24 2024 10:53:44 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: req.session.user.username,
        desc: "Dein Profil und alle Einstellungen auf einer Seite.",
        sitetype: "profile",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/kontakt", (req, res) => res.status(301).redirect("/contact"));
app.get("/contactUs", (req, res) => res.status(301).redirect("/contact"));
app.get("/kontaktiereUns", (req, res) => res.status(301).redirect("/contact"));
app.get("/contact", (req, res) => {
    res.render("contact.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Sat Mar 23 2024 14:22:59 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Kontakt",
        desc: "Über diese Seite kannst du uns ganz einfach kontaktieren, indem du uns eine E-Mail schreibst. Wir geben unser Bestes, so schnell wie möglich zu antworten.",
        sitetype: "contact",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/zmt", (req, res) => res.status(301).redirect("/zurich-meets-tanzania"));
app.get("/zurich-meets-tanzania", (req, res) => {
    res.render("zmt.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: ZMT.aktualisiert,
        title: ZMT.titel,
        desc: ZMT.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        zmt: ZMT,
        toRealDate
    });
});

app.get("/tmz", (req, res) => res.status(301).redirect("/tanzania-meets-zurich"));
app.get("/tanzania-meets-zurich", (req, res) => {
    res.render("tmz.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: TMZ.aktualisiert,
        title: TMZ.titel,
        desc: TMZ.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        tmz: TMZ,
        toRealDate
    });
});

app.get("/board", (req, res) => res.status(301).redirect("/vorstand"));
app.get("/us", (req, res) => res.status(301).redirect("/vorstand"));
app.get("/vorstand", (req, res) => {
    res.render("vorstand.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: VORSTAND.aktualisiert,
        title: "Vorstand",
        desc: VORSTAND.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        member_list: ABOUT_US.TEAM,
        vorstand: VORSTAND,
        toRealDate
    });
});

app.get("/team", async (req, res) => {
    const TEAM = await db.getCurrentTeamInfo();
    res.render("team.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: TEAM.aktualisiert,
        title: "Aktuelles Team",
        desc: "Hier findest du alle Informationen über das aktuelle Team von zurich meets tanzania.",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        team: TEAM,
        toRealDate
    });
});

app.get("/leitideen", (req, res) => res.status(301).redirect("/vision"));
app.get("/ideen", (req, res) => res.status(301).redirect("/vision"));
app.get("/idee", (req, res) => res.status(301).redirect("/vision"));
app.get("/ideas", (req, res) => res.status(301).redirect("/vision"));
app.get("/vision", (req, res) => {
    res.render("vision.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: VISION.datum,
        title: "Vision",
        desc: VISION.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        text: VISION.text,
        bild: VISION.bild
    });
});

app.get("/anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/der%20anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Der%20anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/der%20Anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Der%20Anfang", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/The%20beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/the%20beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/wie-alles-begann", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Wie-alles-begann", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Wie%20alles%20began", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/wie%20alles%20began", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/in%20the%20beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/In%20the%20beginning", (req, res) => res.status(301).redirect("/Wie%20alles%20begann"));
app.get("/Wie%20alles%20begann", (req, res) => {
    res.render("beginning.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: BEGINNING.datum,
        title: BEGINNING.title,
        desc: BEGINNING.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        text: BEGINNING
    });
});

app.get("/tanzania", (req, res) => {
    res.render("tanzania.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: TANZANIA.datum,
        title: TANZANIA.title,
        desc: TANZANIA.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        tanzania: TANZANIA
    });
});

app.get("/chirurgie", (req, res) => res.status(301).redirect("/projects/chirurgie"));
app.get("/projects/chirurgie", (req, res) => {
    res.render("chirurgie.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: CHIRURGIE.aktualisiert,
        title: CHIRURGIE.titel,
        desc: CHIRURGIE.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        chirurgie: CHIRURGIE
    });
});

app.get("/bajaji", (req, res) => res.status(301).redirect("/projects/bajaji"));
app.get("/projects/bajaji", (req, res) => {
    res.render("bajaji.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: BAJAJI.aktualisiert,
        title: BAJAJI.titel,
        desc: BAJAJI.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        bajaji: BAJAJI
    });
});

app.get("/kardiologie", (req, res) => res.status(301).redirect("/projects/kardiologie"));
app.get("/projects/kardiologie", (req, res) => {
    res.render("kardiologie.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: KARDIOLOGIE.aktualisiert,
        title: KARDIOLOGIE.titel,
        desc: KARDIOLOGIE.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        kardiologie: KARDIOLOGIE
    });
});

app.get("/finanzen", (req, res) => {
    res.render("finanzen.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: FINANZEN.aktualisiert,
        title: FINANZEN.titel,
        desc: FINANZEN.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate,
        finanzen: FINANZEN
    });
});

app.get("/statutes", (req, res) => res.status(301).redirect("/statuten"));
app.get("/statuten", (req, res) => {
    res.render("statuten.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: STATUTEN.aktualisiert,
        title: "Statuten",
        desc: "Die Stauten des Vereins",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        statuten: STATUTEN.data,
        toRealDate
    });
});

app.get("/imprint", (req, res) => res.status(301).redirect("/impressum"));
app.get("/impressum", (req, res) => {
    res.render("quellenangabe.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Mon Jun 03 2024 18:28:26 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: "Quellenangabe",
        desc: "Hier findest du alle Quellenangaben zu den Bildern auf dieser Webseite.",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        toRealDate
    });
});

app.get("/income-statement", (req, res) => res.status(301).redirect("/erfolgsrechnung"));
app.get("/erfolgsrechnung", (req, res) => {
    res.render("erfolgsrechnung.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: STATUTEN.aktualisiert,
        title: "Erfolgsrechnung",
        desc: "Die Erfolgsrechnung und Bilanz des Vereins",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/p/meducation", (req, res) => res.status(301).redirect("/projects/meducation"));
app.get("/Projekte/meducation", (req, res) => res.status(301).redirect("/projects/meducation"));
app.get("/projekte/meducation", (req, res) => res.status(301).redirect("/projects/meducation"));
app.get("/meducation", (req, res) => res.status(301).redirect("/projects/meducation"));
app.get("/projects/meducation", (req, res) => {
    res.render("meducation.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: MEDUCATION.aktualisiert,
        title: "Meducation",
        desc: MEDUCATION.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        meducation: MEDUCATION,
        toRealDate
    });
});

app.get("/mbuzi", (req, res) => res.status(301).redirect("/projects/mbuzi"));
app.get("/projects/mbuzi", (req, res) => {
    res.render("mbuzi.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: MBUZI.aktualisiert,
        title: MBUZI.titel,
        desc: MBUZI.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        mbuzi: MBUZI,
        toRealDate
    });
});

app.get("/gv", (req, res) => res.status(301).redirect("/generalversammlung"));
app.get("/generalversammlung", (req, res) => {
    res.render("gv.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: GV.aktualisiert,
        title: GV.titel,
        desc: GV.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        gv: GV,
        toRealDate
    });
});

app.get("/projects/gyno", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/p/gyno", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/Projekte/gyno", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/projekte/gyno", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/gyno", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/p/gyn%C3%A4kologie", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/Projekte/gyn%C3%A4kologie", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/projekte/gyn%C3%A4kologie", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/gyn%C3%A4kologie", (req, res) => res.status(301).redirect("/projects/gynäkologie"));
app.get("/projects/gyn%C3%A4kologie", (req, res) => {
    res.render("gyno.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: GYNO.aktualisiert,
        title: "Meducation",
        desc: GYNO.beschreibung,
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        gyno: GYNO,
        toRealDate
    });
});

app.get("/donate", (req, res) => res.status(301).redirect("/spenden"));
app.get("/spenden", (req, res) => {
    res.render("donate.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: DONATE.datum,
        title: "Spenden",
        desc: "Wir freuen uns sehr, wenn Sie uns etwas spenden wollen. Deshalb gibt es diese Seite. So können Sie uns ganz unkompliziert unterstützen. Vielen Dank!",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js,
        donate: DONATE
    });
});

app.get("/pay", async (req, res) => {
    const q = req.query;
    const types = ["membership", "onetime"];
    const amount = Number(q.a);
    if (!payment_keys.includes(q.key) || isNaN(amount) || !types.includes(q.t)) return res.redirect("/");
    const links = LOAD_LEVEL === "prod" ? [
        DONATE.ZAHLUNG.linkX,
        DONATE.ZAHLUNG.link50,
        DONATE.ZAHLUNG.link80,
        DONATE.ZAHLUNG.link120,
        DONATE.ZAHLUNG.member
    ] : [
        DONATE.ZAHLUNG.dev.linkX,
        DONATE.ZAHLUNG.dev.link50,
        DONATE.ZAHLUNG.dev.link80,
        DONATE.ZAHLUNG.dev.link120,
        DONATE.ZAHLUNG.dev.member
    ];
    let link = links[0];
    if (amount === 50) link = links[1];
    else if (amount === 80) link = links[2];
    else if (amount === 120) link = links[3];

    if (q.t === "membership") {
        if (!req.session?.user?.valid) return res.redirect("/login?redir=/spenden");
        if (req.session.user.type === "member" || req.session.user.type === "admin") return res.redirect("/?js=infoField(`Du bist schon ein Mitglied`);nofunction");
        link = await buyMembership(req.session.user, q.key, req.protocol + "://" + req.get("host"));
    };

    if (req.session?.user?.valid) {
        link += "?prefilled_email=" + req.session.user.email;
    }

    res.redirect(303, link);
});

app.get("/return", async (req, res) => {
    if (!req.session?.user?.valid) return res.redirect("/login?redir=/spenden");
    try {
        const user_details = await db.getSessionIdWithUserId(req.session.user.id);

        if (typeof user_details === "undefined") throw new Error("Du hast noch keine Bestellung gemacht.");

        const user = req.session.user;
        const auth = {
            id: user.id === user_details.user_id,
            username: user.username === user_details.username,
            password: user.password === user_details.user_password,
            key: payment_keys.includes(user_details.pay_key)
        };

        for (const property in auth) {
            if (auth[property] === false) throw new Error(`Dein ${property} stimmt nicht mit denjenigen auf der Bestellung überein.`);
        };

        const session = await stripe.checkout.sessions.retrieve(user_details.session_id);
        const subscription_id = session.subscription;

        if (session.status === "complete") {
            const result = await db.getTempPaymentWithSubscriptionId(subscription_id);
            const admin = user.type === "admin" ? 1 : 0;
            if (admin === 0) {
                req.session.user.type = "member";
                await db.addMemberWithUserId(user.id);
            };
            await db.createMember(user.id, subscription_id, result.customer_id, result.status, result.period_start, result.period_end, result.start_date, admin);
            await db.updateMemberStatus(subscription_id, "paid");
            return res.redirect(`/profile?js=successField(\`Die Zahlung war erfolgreich. Danke, dass du ein Mitglied von Zurich meets Tanzania bist!\`);nofunction`);
        } else if (session.status === "open") {
            throw new Error("Die Zahlung steht noch offen. Bitte beende deine Zahlung ordnungsgemäss.");
        } else if (session.status === "expired") {
            throw new Error("Die Zahlung hat zu lange gedauert, bitte versuche es erneut...");
        };
    } catch (err) {
        return res.redirect(`/spenden?js=errorField(\`${err.message}\`);nofunction`);
    };
    res.redirect("/");
});

app.get("/newsletter/abmelden", (req, res) => {
    res.render("newsletter_abmeldung.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Sun May 05 2024 15:20:55 GMT+0200 (Mitteleuropäische Sommerzeit)",
        title: "Abmelden",
        desc: "Hier kannst du dich von unserem Newsletter abmelden.",
        sitetype: "newsletter",
        user: req.session.user,
        js: undefined
    });
});

app.get("/chunks/team/getCurrentTeam", async (req, res) => {
    if (req?.session?.user?.type !== "admin") return res.redirect("/");
    const team = await db.getCurrentTeamInfo();
    res.render("./snippets/teamMember.ejs", {
        members: team.members
    });
});

app.get("/gallery/:id", (req, res) => res.status(301).redirect("/galerie/" + req.params.id));
app.get("/galerie/:id", async (req, res) => {
    let result = await db.getGalleyWhereTitle(req.params.id)
        .catch(() => res.redirect("/"));
    result = result?.[0];
    result ? res.render("gallery.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: result.date,
        title: result.title,
        desc: result.subtitle + " | Uploaded by " + result.author,
        sitetype: "gallery",
        user: req.session.user,
        js: req.query.js,
        img: result.img,
        subtitle: result.subtitle,
        toRealDate
    }) : res.redirect("/");
});

app.get("/blog/:id", async (req, res) => {
    let result = await db.getPostWhereTitle(req.params.id)
        .catch(() => res.redirect("/"));
    result = result?.[0];
    result ? res.render("blog.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + "://" + req.get("host"),
        date: "Mon Feb 12 2024 16:40:44 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: result.title,
        desc: result.preview + " | Written by " + result.author,
        sitetype: "blog",
        user: req.session.user,
        js: req.query.js,
        blog: result
    }) : res.redirect("/");
});

app.get("/private/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/login?redir=/private/" + req.params.id);
    if (req.session.user.type !== "admin") return res.redirect("/");
    let url = req.protocol + "://" + req.get("host");
    switch (req.params.id) {
        case "management":
            let users = await db.getAllUsers();
            let newsletter = await db.getAllNewsletterSignUps();
            let passwords = {
                gmail: process.env.PASSWORD_GMAIL_ACCOUNT,
                imagekit: process.env.PASSWORD_IMAGEKIT_ACCOUNT,
                stripe: process.env.PASSWORD_STRIPE_ACCOUNT,
                mailjet: process.env.PASSWORD_MAILJET_ACCOUNT
            };
            res.render("private/management.ejs", {
                env: LOAD_LEVEL,
                url: req.url,
                origin_url: url,
                date: "Fri Feb 23 2024 21:46:26 GMT+0100 (Mitteleuropäische Normalzeit)",
                title: "Management",
                desc: "Hier können die Mitglieder des Vereins Statistiken erfassen und alle Adminfunktionen benutzen.",
                sitetype: "private",
                user: req.session.user,
                js: req.query.js,
                all_users: users,
                all_newsletter: newsletter,
                passwords: passwords
            });
            break;
        case "writeBlog":
            res.render("private/builder.ejs", {
                env: LOAD_LEVEL,
                url: req.url,
                origin_url: url,
                date: "Sat Feb 17 2024 11:53:24 GMT+0100 (Mitteleuropäische Normalzeit)",
                title: "Blog Verfassen",
                desc: "Hier können die Mitglieder des Vereins Blogposts erstellen.",
                sitetype: "private",
                user: req.session.user,
                js: req.query.js
            });
            break;
        default:
            res.redirect("/error404");
            break;
    };
});

app.get("/*", (req, res) => {
    let url = req.protocol + "://" + req.get("host");
    res.status(404).render("errors/error404.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: url,
        date: "Wed Feb 21 2024 17:27:24 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Seite nicht gefunden",
        desc: `Wir konnten die Seite ${url}${req.url} leider nicht finden...`,
        sitetype: "error",
        user: req.session.user
    });
});





app.post("/post/login", async (req, res) => {
    let username = req.body.username,
        password = req.body.password,
        error;
    let result = await db.validateAccount(username, password)
        .catch(err => {
            error = err.message;
            return {valid: false};
        });
    if (result.valid) {
        req.session.user = result;
        req.session.user.darkmode = await db.getDarkmode(req.session.user.username);
        res.json({ valid: true });
    } else res.json({ valid: false, message: error || "Dein Passwort ist falsch." });
});

app.post("/post/signUp", async (req, res) => {
    let data = req.body;
    let users = await db.getAccount(data.username);
    if (users.length > 0) return res.json({message:"Dieser Benutzername ist schon vergeben."});
    if (data.picture !== "/img/svg/personal.svg") {
        data.picture = await imagekitUpload(data.picture, data.username + "_" + timon.randomString(32), "/users/");
        data.picture = data.picture.path;
    };
    // The project started with the login being a username. This changed all the way in in September 2024
    /* Since the username was used like the users ID on the webpage, it would be to time consuming to change everything to the email and 
       therefore we decided to just automatically set the username to the same value as the email. */
    let result = await db.createAccount(data.email /* This was the username */, data.password, data.name, data.family_name, data.email, data.picture, data.phone, data.address)
        .catch(err => res.json({ valid: false, message: err }));
    if (result.username) {
        req.session.user = result;
        req.session.user.valid = true;
        req.session.user.darkmode = await db.getDarkmode(req.session.user.username);
        res.json({ valid: true });
    };
});

app.post("/logout", (req, res) => {
    if (req.session?.user) req.session.destroy(err => {
        if (err) return res.status(500).json({status: 500});
    });
    res.status(200).json({status: 200});
});

app.post("/post/newsletter/signUp", async (req, res) => {
    const emails = await db.getAllNewsletterEmails();
    if (emails.includes(req.body.email)) {
        return res.json({status: "Du bist schon angemeldet."});
    };
    let result = await db.newsletterSignUp(req.body)
        .catch(error => {
            console.error("An Error occurred:", error);
            return "No connection to database";
        });
    res.json({status: result});
});

app.post("/post/newsletter/signUp/logedIn", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    let result = await db.newsletterSignUp({
        gender: req.body.gender,
        vorname: req.session.user.name,
        nachname: req.session.user.family_name,
        email: req.session.user.email
    })
    .catch(error => {
        console.error("An Error occurred:", error);
        return "No connection to database";
    });
    res.json({status: result});
});

app.post("/post/newsletter/signOff", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    db.newsletterSignOff(req.session.user.email);
    res.end();
});

app.post("/post/newsletter/check", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    let result = await db.newsletterCheck(req.session.user.email);
    res.json({check: result});
});

app.post("/post/blog", async (req, res) => {
    let b = req.body;
    let result = await db.createPost(b.title, b.author, b.preview, b.content, "Blog", b.img, b.comment)
        .catch(error => {
            console.error("An Error occurred:", error);
            return "No connection to database";
        });
    res.send({status: result});
});

app.post("/post/mergeBlogs", async (req, res) => {
    const { number, title, description, team, base64, alt } = req.body;
    const { path } = await imagekitUpload(base64, alt + timon.randomString(32), "/blog/");
    const result = await db.mergeBlogs(number, title, description, team, path, alt);
    res.json(result);
});

app.post("/post/blog/getLinks/:num", async (req, res) => {
    let response = await db.getLastXPostLinks(req.params.num)
        .catch(() => {return "No connection to database"});
    typeof response !== "string" ? res.send({title: response}) : res.end();
});

app.post("/post/upload/imagekit", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    req.body.img.forEach(async (element, i) => {
        await imagekitUpload(element, req.body.alt[i].replaceAll(" ", "-") + "___" + req.body.suffix[i], "/blog/");
    });
    res.end();
});

app.post("/post/getAuthorPicture", async (req, res) => {
    let response = await db.getPictureWithFullName(req.query?.name, req.query?.family_name)
        .catch(() => {return "/img/svg/personal.svg"});
    res.send(response[0]);
});

app.post("/post/updateProfile", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    let b = req.body;
    let result = await db.updateProfile(req.session.user.id, b.email, b.password, b.given_name, b.family_name, b.email, b.phone)
        .catch(() => {return "No connection to database"});
    if (result === "No Error") {
        req.session.user.username = b.email;
        req.session.user.password = b.password;
        req.session.user.name = b.given_name;
        req.session.user.family_name = b.family_name;
        req.session.user.email = b.email;
        req.session.user.phone = b.phone;
    };
    res.json({res: result});
});

app.post("/post/changePicture", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    let path = req.session.user.picture.replace("https://ik.imagekit.io/zmt/users/", "");
    if (req.session.user.picture === "/img/svg/personal.svg") path = req.session.user.username + "_" + timon.randomString(32);
    let img = await imagekitUpload(req.body.base64, path, "/users/");
    let result = await db.updateProfilePicture(req.session.user.username, img.path)
        .catch(() => {return "No connection to database"});
    if (result === "No Error") {
        req.session.user.picture = img.path;
    };
    res.json({res: result});
});

app.post("/post/toggleDarkmode", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    db.toggleDarkmode(req.session.user.username);
    req.session.user.darkmode < 1 ? req.session.user.darkmode++ : req.session.user.darkmode--;
    res.end();
});

app.post("/post/submitNews", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let b = req.body,
        status = 200;
    let img_path = await imagekitUpload(b.img, b.img_alt.replaceAll(" ", "_"), "/news/");
    const file_arr = [];
    if (b.pdf) {
        const file = await downloadFileAsBase64("https://ik.imagekit.io/zmt/pdf/" + b.pdf_src);
        file_arr.push({
            ContentType: "application/pdf",
            Filename: b.pdf_src,
            Base64Content: file
        });
    };
    try {
        const recipients = await db.getAllNewsletterSignUps();
        sendNewsletterEmail(recipients, EMAILS.newsletterSubject, b.text, file_arr);
    } catch (err) {
        console.error(err);
        status = 500;
    };
    await db.submitNews(b.text, img_path.path, b.img_alt, b.img_pos, b.btn, b.btn_text, b.btn_link, b.pdf, b.pdf_src)
        .catch(err => status = err);
    res.json({res: status});
});

app.post("/post/changeHeroImg", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let status = await imagekitUpload(req.body.base64, "hero", "/assets/");
    res.json({res: status});
});

app.post("/post/sendMail", async (req, res) => {
    const result = await sendContactMail(req.body);

    if (result === 200) return res.json({res: "Die E-Mail wurde erfolgreich verschickt.", status: 200}).status(200);

    return res.json({res: "Die E-Mail konnte nicht verschickt werden, versuche es in einigen Sekunden noch einmal.", status: 500}).status(500);
});

app.post("/post/makeAdmin", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let result = await db.makeAdmin(req.body.username)
        .catch(() => {return false});
    res.json({good: result});
});

app.post("/post/deleteAdmin", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    if (["Timon", "Sara Pieretti", "fiedlertimon@gmail.com", "sara.pieretti@bluewin.ch"].includes(req.body.username)) return res.json({good: false});
    let result = await db.deleteAdmin(req.body.username)
        .catch(() => {return false});
    res.json({good: result});
});

app.post("/post/createGallery", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let b = req.body,
        img = b.img;
    for (let i = 0; i < img.arr.length; i++) {
        let {path} = await imagekitUpload(img.arr[i].src, img.arr[i].alt + "___" + timon.randomString(32), `/gallery/`);
        img.arr[i].src = path;
    };
    for (let i = 0; i < img.vid.length; i++) {
        img.vid[i].src = await saveVideo(img.vid[i].src, img.vid[i].type);
    };
    let result = await db.createGallery(b.title, b.subtitle, b.author, img)
        .catch(err => {return err});
    if (result === undefined) result = "OK";
    res.json({error: result});
});

app.post("/post/gallery/getLinks/:num", async (req, res) => {
    let response = await db.getLastXGalleryLinks(req.params.num)
        .catch(() => {return "No connection to database"});
    typeof response !== "string" ?
    res.json({title: response}) :
    res.json({error: response});
});

app.post("/post/getPaymentLink", async (req, res) => {
    if (isNaN(req.body.amount)) return res.end();
    const key = timon.randomString(256);
    payment_keys.push(key);
    res.json({link: `${req.protocol}://${req.get("host")}/pay?key=${key}&a=${req.body.amount}&t=${req.body.type}`});
});

app.post("/post/stripe/webhook", bodyParser.raw({type: 'application/json'}), async (req, res) => {
    let event;
    const endpointSecret = LOAD_LEVEL === "prod" ?
        process.env.STRIPE_ENDPOINT_SECRET :
        process.env.STRIPE_ENDPOINT_SECRET_TEST;

    // Verify the event came from Stripe
    try {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    };
  
    // Handle event
    switch (event.type) {
        case "customer.subscription.created":
            const subscription_id = event.data.object.id;
            const period_start = event.data.object.current_period_start;
            const period_end = event.data.object.current_period_end;
            const customer_id = event.data.object.customer;
            const start_date = event.data.object.start_date;
            const status = event.data.object.status;

            await stripe_c_s_created(subscription_id, period_start, period_end, customer_id, start_date, status);
            break;
        case "customer.subscription.updated":
            const _subscription_id = event.data.object.id;
            const _period_start = event.data.previous_attributes.current_period_start;
            const _period_end = event.data.previous_attributes.current_period_end;
            const _status = event.data.previous_attributes.status;

            await stripe_c_s_updated(_subscription_id, _period_start, _period_end, _status);
            break;
        case "customer.subscription.deleted":
            const __subscription_id = event.data.object.id;

            await stripe_c_s_deleted(__subscription_id);
            break;
        case "invoice.payment_succeeded":
            const _customer_id = event.data.object.customer;
            const pdf = event.data.object.invoice_pdf;
            const url = event.data.object.hosted_invoice_url;

            await stripe_i_p_success(_customer_id, pdf, url);
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
            break;
    };

    res.status(200).json({received: true});
});

app.post("/post/getMyBills", async (req, res) => {
    if (!req.session?.user?.valid) return res.json({error: "501: Forbidden"});
    try {
        const member = await db.getMemberWithUserId(req.session.user.id);
        const bills = await db.getBills(member?.subscription_id);
        res.json(bills);
    } catch (error) {
        res.json({error});
    };
});

app.post("/newsletter/requestCode", async (req, res) => {
    let status = 501,
        message = "";
    try {
        const user = await db.getNewsletterSignUpWithEmail(req.body.email);
        if (user.length === 0) throw new Error("Diese E-Mail existiert nicht.");
        const code = sendMailCode(req.body.email, user[0]);
        newsletter_code.push({
            code,
            email: req.body.email
        });
        setTimeout(() => {
            newsletter_code.forEach((obj, i) => {
                if (obj.email === req.body.email) newsletter_code.splice(i, 1);
            });
        }, 24 * 60 * 60 * 1000); // 24 hours
        status = 200;
    } catch (err) {
        console.error(err);
        status = 500;
        message = err.message;
    };
    res.json({status, message});
});

app.post("/newsletter/submitCode", (req, res) => {
    let status = 501,
        message = "";
    try {
        newsletter_code.forEach((obj, i) => {
            if (obj.email === req.body.email && obj.code === req.body.code) {
                status = 200;
                newsletter_code.splice(i, 1);
            };
        });
        if (status !== 200) throw new Error("Bitte gib einen gültigen Code ein, dieser stimmt nicht.");
        db.deleteNewsletterSignUpWithEmail(req.body.email);
    } catch (err) {
        console.error(err);
        status = 500;
        message = err.message;
    };
    res.json({status, message});
});

app.post("/post/createTeam", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    
    const { leitsatz, beschreibung, base64 } = req.body;

    const { path } = await imagekitUpload(base64, timon.randomString(32), "/current-team/");

    let result = await db.createTeam(Date(), leitsatz, beschreibung, path)
        .catch(err => {
            console.error(err);
            return false;
        });

    res.json({valid: result});
});

app.post("/post/addTeamMember", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});

    const { username, job, motivation } = req.body;
    const user = await db.getAccount(username);
    const { name, family_name, picture } = user[0];

    const data = {
        name,
        family_name,
        picture,
        job,
        motivation,
        position: "",
        picture2: false
    };
    
    const result = await db.addTeamMember(data)
        .catch(err => {
            console.error(err);
            return false;
        });

    res.json({valid: result});
});

app.post("/post/updateGallery", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});

    const { title, data } = req.body;

    const [ gallery ] = await db.getGalleyWhereTitle(title)
        .catch(() => "Not found");
    
    if (gallery === "Not found") return res.json({ error: "Not found" });

    gallery.date = Date().toString();

    for (let i = 0; i < data.img.length; i++) {
        const { path } = await imagekitUpload(data.img[i].src, data.img[i].alt + "___" + timon.randomString(32), "/gallery/");
        gallery.img.arr.push({
            src: path,
            alt: data.img[i].alt
        });
    }

    for (let i = 0; i < data.vid.length; i++) {
        const src = await saveVideo(data.img[i].src, data.img[i].type);
        gallery.img.vid.push({
            src,
            alt: data.img[i].alt
        });
    }

    const result = await db.updateGallery(title, gallery);

    return res.json({ status: result });
});

app.post("/post/recoveryRequest", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.getAccount(email);

        if (user.length === 0) return res.json({ status: "Diese E-Mail existiert nicht."});

        const code = sendRecoveryCode(email, user[0]);

        recovery_code.push({
            email,
            code
        });

        setTimeout(() => {
            recovery_code.forEach((obj, i) => {
                if (obj.email === email) recovery_code.splice(i, 1);
            });
        }, 24 * 60 * 60 * 1000); // 24 hours

        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.json({ status: 500 });
    };
});

app.post("/post/recoverySubmit", async (req, res) => {
    try {
        const { email, code } = req.body;

        let found = false;
        let valid = false;

        recovery_code.forEach((obj, i) => {
            if (obj.email === email) {
                found = true;
            };
            if (obj.email === email && obj.code === code) {
                valid = true;
            };
        });

        if (!found) return res.json({ status: 501, message: "Diese E-Mail existiert nicht." });
        if (!valid) return res.json({ status: 501, message: "Der Code ist falsch." });

        sendRecoveryPassword(email);
        res.json({ status: 200 });
    } catch (error) {
        console.error(error);
        res.json({ status: 500 });
    };
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});