import session from "express-session";
import bodyParser from "body-parser";
import ImageKit from "imagekit";
import express from "express";
import dotenv from "dotenv";
import https from "https";
import cors from "cors";
import * as db from "./backend/db/db.zmt.js";
import { copyFileSync } from "fs";


const LOAD_LEVEL = "dev", // Auf Produktions zu prod umstellen
    BACKUP = {
        BLOGS: [
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: ["Das Bild zeigt ein Fehlersymbol"], img: ["/img/backup/blogerror (1).jpg"]},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: ["Das Bild zeigt ein Fehlersymbol"], img: ["/img/backup/blogerror (2).jpg"]},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: ["Das Bild zeigt ein Fehlersymbol"], img: ["/img/backup/blogerror (3).jpg"]},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: ["Das Bild zeigt ein Fehlersymbol"], img: ["/img/backup/blogerror (4).jpg"]},
            }
        ]
    };



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



app.use(express.static("./static"));
app.use(express.urlencoded({
    extended: true,
    limit: "1000mb"
}));
app.use(express.json({
    limit: '1000mb'
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





app.get("/", async (req, res) => {
    let result = await db.getLastXPosts(4)
        .catch(() => {return BACKUP.BLOGS});
    let url = req.protocol + '://' + req.get('host');
    res.render("index.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: url,
        date: "Sun Jan 21 2024 22:43:11 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Home",
        desc: "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren. Eine bunt zusammengemischte Truppe engagierter, hilfsbereiter Leute. Erfahre auf dieser Seite mehr über unser Team, unsere Freunde in Mbalizi und unsere Partner.",
        sitetype: "home",
        user: req.session.user,
        last4blogs: result
    });
});

app.get("/blog/:id", async (req, res) => {
    let result = await db.getPostWhereTitle(req.params.id)
        .catch(() => res.redirect("/"));
    result = result?.[0];
    let url = req.protocol + '://' + req.get('host');
    result ? res.render("blog.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: url,
        date: "Mon Feb 12 2024 16:40:44 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: result.title,
        desc: result.preview + " | Written by " + result.author,
        sitetype: "blog",
        user: req.session.user,
        blog: result
    }) : res.redirect("/");
});

app.get("/private/:id", async (req, res) => {
    /*

    NEEDS AUTHENTICATION WITH ADMIN RIGHTS

    */
    let url = req.protocol + '://' + req.get('host');
    switch (req.params.id) {
        case "writeBlog":
            res.render("builder.ejs", {
                env: LOAD_LEVEL,
                url: req.url,
                origin_url: url,
                date: "Sat Feb 17 2024 11:53:24 GMT+0100 (Mitteleuropäische Normalzeit)",
                title: "Blog Verfassen",
                desc: "Hier können die Mitglieder des Vereins Blogposts erstellen.",
                sitetype: "private",
                user: req.session.user
            });
            break;
        case "management":
            // TEMP ---------------------- //
            res.redirect(url + "/private/writeBlog");
            break;
        default:
            res.redirect("/");
            break;
    };
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





app.post("/post/newsletter/signUp", async (req, res) => {
    let result = await db.newsletterSignUp(req.body)
        .catch(error => {
            console.error("An Error occured:", error);
            return "No connection to database";
        });
    res.send({status: result});
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
    let response;
    req.body.img.forEach((element, i) => {
        imagekit.upload({
            file: element,
            fileName: req.body.alt[i].replaceAll(" ", "-") + "___" + req.body.suffix[i],
            folder: "/blog/",
            useUniqueFileName: false
        }, (err, result) => {
            err ? response = err : response = result;
        });
    });
    res.send({res: response});
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});