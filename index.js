import session from "express-session";
import bodyParser from "body-parser";
import ImageKit from "imagekit";
import express, { response } from "express";
import dotenv from "dotenv";
import https from "https";
import cors from "cors";
import * as db from "./backend/db/db.zmt.js";


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
    res.render("index.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Sun Jan 21 2024 22:43:11 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Home",
        desc: "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren. Eine bunt zusammengemischte Truppe engagierter, hilfsbereiter Leute. Erfahre auf dieser Seite mehr über unser Team, unsere Freunde in Mbalizi und unsere Partner.",
        sitetype: "home",
        user: req.session.user,
        last4blogs: result
    });
});

app.get("/login", async (req, res) => {
    res.render("login.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Thu Feb 22 2024 20:36:37 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Login",
        desc: "Hier können sich Mitglieder und Verwalter einloggen oder neu registrieren.",
        sitetype: "login",
        error: undefined
    });
});

app.get("/shop", async (req, res) => {
    res.render("shop.ejs", {
        env: LOAD_LEVEL,
        url: req.url,
        origin_url: req.protocol + '://' + req.get('host'),
        date: "Fri Feb 23 2024 21:15:35 GMT+0100 (Mitteleuropäische Normalzeit)",
        title: "Shop",
        desc: "Auf dieser Seite können Sie direkt zum Unikat Höngg weiter um die einzigartigen Unikate zu kaufen, die beim Kauf den Verein unterstützen.",
        sitetype: "static"
    });
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
        blog: result
    }) : res.redirect("/");
});

app.get("/private/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    if (req.session.user.type !== "admin") return res.redirect("/");
    let url = req.protocol + '://' + req.get('host');
    switch (req.params.id) {
        case "management":
            res.render("private/management.ejs", {
                env: LOAD_LEVEL,
                url: req.url,
                origin_url: url,
                date: "Fri Feb 23 2024 21:46:26 GMT+0100 (Mitteleuropäische Normalzeit)",
                title: "Management",
                desc: "Hier können die Mitglieder des Vereins Statistiken erfassen und alle Adminfunktionen benutzen.",
                sitetype: "private",
                user: req.session.user
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
                user: req.session.user
            });
            break;
        default:
            res.redirect("/error404");
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
        res.redirect("/");
    } else res.send({message: error || "Dein Passwort ist falsch."});
});

app.post("/post/signUp", async (req, res) => {
    let data = req.body;
    if (await db.getAccount(data.username).length === 0) return res.send({message:"Dieser Benutzername ist schon vergeben."});
    if (data.picture !== "/img/svg/personal.svg") {
        data.picture = await imagekitUpload(data.picture, data.username + "_" + randomId(), "/users/");
        data.picture = data.picture.path;
    };
    let result = await db.createAccount(data.username, data.password, data.name, data.family_name, data.email, data.picture, data.phone)
        .catch(err => res.send({message: err}));
    if (result.username) {
        req.session.user = result;
        res.redirect("/");
    };
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
    req.body.img.forEach(async (element, i) => {
        await imagekitUpload(element, req.body.alt[i].replaceAll(" ", "-") + "___" + req.body.suffix[i], "/blog/");
    });
    res.end();
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});







async function imagekitUpload (base64, name, folder) {
    let res;
    imagekit.upload({
        file: base64,
        fileName: name,
        folder: folder,
        useUniqueFileName: false
    },
    (err, result) => {
        err ? res = err : res = result;
    });
    return {
        path: "https://ik.imagekit.io/zmt" + folder + name,
        res: res
    };
};

function randomId () {
    let result = 'auto_';
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 27; i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    };
    return result;
};