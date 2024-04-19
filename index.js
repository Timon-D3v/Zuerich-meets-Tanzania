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
import BACKUP from "./backend/constants/backup.js";
import ABOUT_US from "./backend/constants/admins.js";
import STATUTEN from "./backend/constants/statuten.js";
import VORSTAND from "./backend/constants/vorstand.js";
import GYNO from "./backend/constants/gynäkologie.js";
import MEDUCATION from "./backend/constants/meducation.js";
import HERO from "./backend/constants/heropage.js";



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
const stripe = Stripe(process.env.STRIPE_PRIVAT_KEY);



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
    let adress = `${obj.author_name} ${obj.author_family_name} hat diese E-Mail hinterlegt: ${obj.author_email}`;
    let footer1 = "Dies ist eine automatisch verschickte E-Mail über eine API von postmail.invotes.com\nProgrammiert und aufesetzt von Timon Fiedler.";
    let footer2 = "Timon Fiedler ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.";
    let part2 = `${divider}\n\n${obj.message}\n\n${divider}\n${adress}\n${divider}\n\n${footer1}\n${footer2}`;
    return `${obj.author_name} ${obj.author_family_name} schreibt am ${date}: \n${part2}`;
};

async function saveVideo (base64, type) {
    type === "video/mp4" ?
    type = ".mp4" :
    type = ".mov";
    const video = path.resolve(dirname(fileURLToPath(import.meta.url)), `./static/vid/${timon.randomString() + type}`);
    fs.writeFile(video, base64.split(';base64,').pop(), "base64", err => {
        if (err) console.error('Error saving video:', err);
    });
    return video;
};



app.use(express.static("./static"));
app.use(express.urlencoded({
    extended: true,
    limit: "10000mb"
}));
app.use(express.json({
    limit: '10000mb'
}));
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
app.use(bodyParser.json());
app.use(cors());





app.get("/home", (req, res) => res.redirect("/"));
app.get("/", async (req, res) => {
    let blogs = await db.getLastXPosts(4)
        .catch(() => {return BACKUP.BLOGS});
    let news = await db.getNews()
        .catch(() => {return BACKUP.NEWS});
    res.render("index.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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

app.get("/signup", (req, res) => res.redirect("/login?js=toggleForms"));
app.get("/signUp", (req, res) => res.redirect("/login?js=toggleForms"));
app.get("/registrieren", (req, res) => res.redirect("/login?js=toggleForms"));
app.get("/einloggen", (req, res) => res.redirect("/login"));
app.get("/login", async (req, res) => {
    if (req.session.user?.valid) return res.redirect("/profile");
    let redir = req.query.redir;
    if (redir === undefined || typeof redir === "undefined") redir = "/";
    res.render("login.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Thu Feb 22 2024 20:36:37 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Login",
        desc: "Hier können sich Mitglieder und Verwalter einloggen oder neu registrieren.",
        sitetype: "login",
        js: req.query.js,
        redir: redir
    });
});

app.get("/einkaufen", (req, res) => res.redirect("/shop"));
app.get("/shop", async (req, res) => {
    res.render("shop.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Fri Feb 23 2024 21:15:35 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Shop",
        desc: "Auf dieser Seite können Sie direkt zum Unikat Höngg weiter um die einzigartigen Unikate zu kaufen, die beim Kauf den Verein unterstützen.",
        sitetype: "static",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/account", (req, res) => res.redirect("/profile"));
app.get("/me", (req, res) => res.redirect("/profile"));
app.get("/profil", (req, res) => res.redirect("/profile"));
app.get("/konto", (req, res) => res.redirect("/profile"));
app.get("/profile", async (req, res) => {
    if (!req.session.user?.valid) return res.redirect("/login?redir=/profile");
    res.render("profile.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Sat Feb 24 2024 10:53:44 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: req.session.user.username,
        desc: "Dein Profil und alle Einstellungen auf einer Seite.",
        sitetype: "profile",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/kontakt", (req, res) => res.redirect("/contact"));
app.get("/contactUs", (req, res) => res.redirect("/contact"));
app.get("/kontaktiereUns", (req, res) => res.redirect("/contact"));
app.get("/contact", (req, res) => {
    res.render("contact.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Sat Mar 23 2024 14:22:59 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Kontakt",
        desc: "Über diese Seite kannst du uns ganz einfach kontaktieren, indem du uns eine E-Mail schreibst. Wir geben unser Bestes, so schnell wie möglich zu antworten.",
        sitetype: "contact",
        user: req.session.user,
        js: req.query.js
    });
});

app.get("/board", (req, res) => res.redirect("/us"));
app.get("/vorstand", (req, res) => res.redirect("/us"));
app.get("/us", (req, res) => {
    res.render("vorstand.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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

app.get("/statutes", (req, res) => res.redirect("/statuten"));
app.get("/statuten", (req, res) => {
    res.render("statuten.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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

app.get("/p/meducation", (req, res) => res.redirect("/projects/meducation"));
app.get("/Projekte/meducation", (req, res) => res.redirect("/projects/meducation"));
app.get("/projekte/meducation", (req, res) => res.redirect("/projects/meducation"));
app.get("/meducation", (req, res) => res.redirect("/projects/meducation"));
app.get("/projects/meducation", (req, res) => {
    res.render("meducation.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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

app.get("/projects/gyno", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/p/gyno", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/Projekte/gyno", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/projekte/gyno", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/gyno", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/p/gyn%C3%A4kologie", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/Projekte/gyn%C3%A4kologie", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/projekte/gyn%C3%A4kologie", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/gyn%C3%A4kologie", (req, res) => res.redirect("/projects/gynäkologie"));
app.get("/projects/gyn%C3%A4kologie", (req, res) => {
    res.render("gyno.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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

app.get("/gallery/:id", (req, res) => res.redirect("/galerie/" + req.params.id));
app.get("/galerie/:id", async (req, res) => {
    let result = await db.getGalleyWhereTitle(req.params.id)
        .catch(() => res.redirect("/"));
    result = result?.[0];
    result ? res.render("gallery.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
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
        origin_url: req.protocol + '://' + req.get('host'),
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
    let url = req.protocol + '://' + req.get('host');
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

app.get("/package/timonjs", (req, res) => {
    res.sendFile(path.resolve(dirname(fileURLToPath(import.meta.url)), "node_modules/timonjs/lib/timon.js"))
});

app.get("/*", (req, res) => {
    let url = req.protocol + '://' + req.get('host');
    res.render("errors/error404.ejs", {
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
        res.redirect(req.body.redir);
    } else res.send({message: error || "Dein Passwort ist falsch."});
});

app.post("/post/signUp", async (req, res) => {
    let data = req.body;
    let users = await db.getAccount(data.username);
    if (users.length > 0) return res.json({message:"Dieser Benutzername ist schon vergeben."});
    if (data.picture !== "/img/svg/personal.svg") {
        data.picture = await imagekitUpload(data.picture, data.username + "_" + timon.randomString(), "/users/");
        data.picture = data.picture.path;
    };
    let result = await db.createAccount(data.username, data.password, data.name, data.family_name, data.email, data.picture, data.phone)
        .catch(err => res.json({message: err}));
    if (result.username) {
        req.session.user = result;
        req.session.user.valid = true;
        req.session.user.darkmode = await db.getDarkmode(req.session.user.username);
        res.redirect(req.body.redir);
    };
});

app.post("/logout", (req, res) => {
    if (req.session?.user) req.session.destroy(err => {
        if (err) return res.status(500).json({status: 500});
    });
    res.status(200).json({status: 200});
});

app.post("/post/newsletter/signUp", async (req, res) => {
    let result = await db.newsletterSignUp(req.body)
        .catch(error => {
            console.error("An Error occured:", error);
            return "No connection to database";
        });
    res.send({status: result});
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
        console.error("An Error occured:", error);
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
            console.error("An Error occured:", error);
            return "No connection to database";
        });
    res.send({status: result});
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
    let result = await db.updateProfile(req.session.user.id, b.username, b.password, b.given_name, b.family_name, b.email, b.phone)
        .catch(() => {return "No connection to database"});
    if (result === "No Error") {
        req.session.user.username = b.username;
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
    if (req.session.user.picture === "/img/svg/personal.svg") path = req.session.user.username + "_" + timon.randomString();
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
    let token;
    LOAD_LEVEL === "prod" ?
    token = process.env.POSTMAIL_TOKEN :
    token = process.env.POSTMAIL_TEST_TOKEN;
    let data = new URLSearchParams();
    let text = createMailText(req.body);
    let subject = createMailSubject(req.body);
    data.append("access_token", token);
    data.append("subject", subject);
    data.append("text", text);
    let result = await fetch("https://postmail.invotes.com/send", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: data
    });
    if (result.status === 200) return res.json({res: "Die E-Mail wurde erfolgreich verschickt."}).status(200);
    else return res.json({res: "Die E-Mail konnte nicht verschickt werden, versuche es in einigen Sekunden noch einmal."}).status(500);
});

app.post("/post/makeAdmin", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let result = await db.makeAdmin(req.body.username)
        .catch(() => {return false});
    res.json({good: result});
});

app.post("/post/deleteAdmin", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    if (req.body.username === "Timon" || req.body.username === "Sara Pieretti") return res.json({good: false});
    let result = await db.deleteAdmin(req.body.username)
        .catch(() => {return false});
    res.json({good: result});
});

app.post("/post/createGallery", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let b = req.body,
        img = b.img;
    for (let i = 0; i < img.arr.length; i++) {
        let {path} = await imagekitUpload(img.arr[i].src, img.arr[i].alt + "___" + timon.randomString(), `/gallery/`);
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


////// TEST
app.post('/charge', async (req, res) => {
    return res.json({error: "501: Forbidden"});
    try {
        const { amount, source, receipt_email } = req.body;
        const charge = await stripeInstance.charges.create({
            amount,
            currency: 'usd',
            source,
            receipt_email,
        });
        res.status(200).json(charge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
/*///// TEST
const request = mailjet.post("send", {version: "v3.1"})
    .request({
        "Messages":[
            {
              "From": {
                "Email": "zuerich.meets.tanzania@gmail.com",
                "Name": "Timon"
              },
              "To": [
                {
                  "Email": "zuerich.meets.tanzania@gmail.com",
                  "Name": "Timon"
                }
              ],
              "Subject": "Greetings from Mailjet.",
              "TextPart": "My first Mailjet email",
              "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
              "CustomID": "CAMPAIGN ID",
              // For File attachments
              "Attachments": [
                {
                        "ContentType": "text/plain",
                        "Filename": "test.txt",
                        "Base64Content": "VGhpcyBpcyB5b3VyIGF0dGFjaGVkIGZpbGUhISEK"
                }
        ]
            }
          ],
          // For Testing
          "SandboxMode":true
        });

//request.then(result => console.log(result.body)).catch(err => console.log(err));

// WORKS

// => https://documentation.mailjet.com/hc/en-us/articles/360043007133-Do-you-have-special-pricing-for-non-profits*/





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});