import session from "express-session";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import https from "https";
import cors from "cors";
import * as db from "./backend/db/db.zmt.js";


const LOAD_LEVEL = "dev"; // Auf Produktions zu prod umstellen



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





app.get("/", (req, res) => {
    res.render("index.ejs", {
        user: req.session.user,
        url: req.url,
        date: "Sun Jan 21 2024 22:43:11 GMT+0100 (Mitteleuropäische Normalzeit)",
        env: LOAD_LEVEL
    });
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});