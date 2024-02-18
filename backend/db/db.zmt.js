import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";



dotenv.config({path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")});



const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB
}).promise();





export async function getChat (user1, user2) {
    const query = "SELECT * FROM `messages`.`" + user2 + `_` + user1 + "`;";
    const [result] = await pool.query(query);
    return result;
};

export async function createPost (title, author, preview, content, tag = "Blog", img = {}, comment = "Kein Kommentar") {
    let query = "INSERT INTO `zmt`.`blog` (`title`, `author`, `preview`, `content`, `tag`, `img`, `comment`) VALUES (?, ?, ?, ?, ?, ?, ?);",
        error;
    await pool.query(query, [title, author, preview, content, tag, JSON.stringify(img), comment])
    .catch(err => {error = err});
    return error; 
};

export async function getPost () {
    let [result] = await pool.query("SELECT * FROM `zmt`.`blog`;");
    return result;
};

export async function getPostWhereTitle (title) {
    let query = "SELECT * FROM `zmt`.`blog` WHERE title = ?;";
    let [result] = await pool.query(query, [title])
        .catch(() => {throw new Error("Fehler")});
    if (result == []) throw new Error("Seite nicht vorhanden (404)");
    return result;
};

export async function newsletterSignUp (data) {
    let status = "Alles in Ordnung",
        query = "INSERT INTO `zmt`.`newsletter` (`gender`, `vorname`, `nachname`, `email`) VALUES (?, ?, ?, ?);";
    await pool.query(query, [data.gender, data.vorname, data.nachname, data.email])
        .catch(error => status = error);
    return status;
};

export async function getLastXPosts (x) {
    let query = "SELECT * from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x + ";";
    let [result] = await pool.query(query)
        .catch(() => {throw new Error("Fehler")});
    if (result.length !== x) throw new Error("Nicht die gewünschte Antahl Elemente");
    return result;
};

export async function getLastXPostLinks (x) {
    let query = "SELECT title from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x.toString() + ";";
    let [result] = await pool.query(query)
        .catch(() => {throw new Error("Fehler")});
    return result;
};