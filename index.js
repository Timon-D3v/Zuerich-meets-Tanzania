import session from "express-session";
import bodyParser from "body-parser";
import Mailjet from "node-mailjet";
import ImageKit from "imagekit";
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import https from "https";
import cors from "cors";
import * as db from "./backend/db/db.zmt.js";


const LOAD_LEVEL = "dev", // Possible Values: "dev" or "prod"
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
        ],
        NEWS: {
            text: "Keine Neuigkeiten",
            img_path: "/img/stock/zebra.jpg",
            img_alt: "Drei Zebras",
            img_pos: "left",
            btn: false,
            btn_text: undefined,
            btn_link: undefined,
            pdf: false,
            pdf_src: undefined
        }
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
const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_PUBLIC_KEY,
    apiSecret: process.env.MAILJET_PRIVAT_KEY
});
const stripe = Stripe(process.env.STRIPE_PRIVAT_KEY);



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
        news: news
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
        js: req.query.js
    });
});

app.get("/logout", (req, res) => {
    if (req.session?.user) delete req.session.user;
    res.redirect("/");
});

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
    if (!req.session.user?.valid) return res.redirect("/login");
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
    if (!req.session.user) return res.redirect("/login");
    if (req.session.user.type !== "admin") return res.redirect("/");
    let url = req.protocol + '://' + req.get('host');
    switch (req.params.id) {
        case "management":
            let users = await db.getAllUsers();
            let newsletter = await db.getAllNewsletterSignUps();
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
                all_newsletter: newsletter
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
        req.session.user.valid = true;
        req.session.user.darkmode = await db.getDarkmode(req.session.user.username);
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
    if (req.session.user.picture === "/img/svg/personal.svg") path = req.session.user.username + "_" + randomId();
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
    await db.submitNews(b.text, b.img_path, b.img_alt, b.img_pos, b.btn, b.btn_text, b.btn_link, b.pdf, b.pdf_src)
        .catch(err => status = err);
    res.json({res: status});
});

app.post("/post/changeHeroImg", async (req, res) => {
    if (req.session?.user?.type !== "admin") return res.json({error: "501: Forbidden"});
    let status = await imagekitUpload(req.body.base64, "hero", "/assets/");
    res.json({res: status});
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
////// TEST
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

// => https://documentation.mailjet.com/hc/en-us/articles/360043007133-Do-you-have-special-pricing-for-non-profits





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});