import session from "express-session";
import bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import https from "https";
import cors from "cors";



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
    typeof req.session.user != "undefined" ?
    res.render("index", {user: user}) :
    res.render("index");
});





app.listen(8080, () => {
    console.log("Server listens on localhost:8080");
});