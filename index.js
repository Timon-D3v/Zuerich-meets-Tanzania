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
                img: {alt: {preview: "Das Bild zeigt ein Fehlersymbol"}, img: {preview: "./img/backup/blogerror (1).jpg"}},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: {preview: "Das Bild zeigt ein Fehlersymbol"}, img: {preview: "./img/backup/blogerror (2).jpg"}},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: {preview: "Das Bild zeigt ein Fehlersymbol"}, img: {preview: "./img/backup/blogerror (3).jpg"}},
            },
            {
                title: "Fehler",
                preview: "Sieht so aus, als würden wir keine Verbindung herstellen können...",
                img: {alt: {preview: "Das Bild zeigt ein Fehlersymbol"}, img: {preview: "./img/backup/blogerror (4).jpg"}}
            }
        ]
    };



const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_SECRET_KEY,
    urlEndpoint: "https://ik.imagekit.io/zmt"
})
const app = express();/*
const https_options = {
    key: fs.readFileSync("./cert/private.key.pem"),
    cert: fs.readFileSync("./cert/domain.cert.pem"),
    ca: fs.readFileSync("./cert/intermediate.cert.pem"),
};*/



app.set("view engine", "ejs");
dotenv.config();



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
    result = result[0];
    let url = req.protocol + '://' + req.get('host');
    res.render("blog.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: url,
        date: "Mon Feb 12 2024 16:40:44 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: result.title,
        desc: result.preview + " | Written by " + result.author,
        sitetype: "blog",
        user: req.session.user,
        blog: result
    });
});





app.post("/post/newsletter/signUp", async (req, res) => {
    let result = db.newsletterSignUp(req.body)
        .catch(error => {
            console.error("An Error occured:", error);
            return "No connection to database";
        });
    res.send({status: result});
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});