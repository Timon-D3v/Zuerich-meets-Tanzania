import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { transcode } from "buffer";
import { query } from "express";
import exp from "constants";



dotenv.config({path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../../.env")});



const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PW,
    database: process.env.MYSQL_DB
}).promise();





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
        .catch(() => {throw new Error("Fehler");});
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

export async function newsletterSignOff (email) {
    let query = "DELETE FROM `zmt`.`newsletter` WHERE (`email` = ?);";
    await pool.query(query, [email]);
};

export async function newsletterCheck (email) {
    let query = "SELECT * FROM `zmt`.`newsletter` WHERE email = ?;";
    let check;
    let [result] = await pool.query(query, [email])
        .catch(() => check = false);
    check = result.length === 0 ? false : true;
    return check;
};

export async function getLastXPosts (x) {
    let query = "SELECT * from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x + ";";
    let [result] = await pool.query(query)
        .catch(() => {throw new Error("Fehler");});
    if (result.length !== x) throw new Error("Nicht die gewünschte Antahl Elemente");
    return result;
};

export async function getLastXPostLinks (x) {
    let query = "SELECT title from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x.toString() + ";";
    let [result] = await pool.query(query)
        .catch(() => {throw new Error("Fehler");});
    return result;
};

export async function validateAccount (username, password) {
    let [account] = await getAccount(username)
        .catch(() => {throw new Error("Keine Verbindung möglich...");});
    if (!account) throw new Error("Dieser Benutzername existiert nicht.");
    if (password === account.password) account.valid = true;
    else account.valid = false;
    return account;
};

export async function getAccount (username) {
    let query = "SELECT * from `zmt`.`users` WHERE `username` = ?;";
    let [result] = await pool.query(query, [username])
        .catch(() => {throw new Error("Fehler");});
    return result;
};

export async function createAccount (username, password, name, family_name, email, picture, phone) {
    let query = "INSERT INTO `zmt`.`users` (`username`, `password`, `name`, `family_name`, `email`, `picture`, `phone`, `type`) VALUES (?, ?, ?, ?, ?, ?, ?, 'user');"
    await pool.query(query, [username, password, name, family_name, email, picture, phone]);
    let [result] = await getAccount(username);
    await createDarkmodeRow(result.id);
    return result;
};

export async function getPictureWithFullName (name, family_name) {
    let query = "SELECT picture FROM `zmt`.`users` WHERE name = ? AND family_name = ?;";
    let [result] = await pool.query(query, [name, family_name])
        .catch(() => {throw new Error("Keine Verbindung möglich...");});
    return result;
};

export async function updateProfile (_id, username, password, name, family_name, email, phone) {
    let query = "UPDATE `zmt`.`users` SET `username` = ?, `password` = ?, `name` = ?, `family_name` = ?, `email` = ?, `phone` = ? WHERE (`id` = '" + _id.toString() + "');";
    await pool.query(query, [username, password, name, family_name, email, phone])
        .catch(err => {return err, console.error(err)});
    return "No Error";
};

export async function updateProfilePicture (username, picture) {
    let query = "UPDATE `zmt`.`users` SET `picture` = ? WHERE (`username` = '" + username + "');";
    await pool.query(query, [picture])
        .catch(err => {return err, console.error(err)});
    return "No Error";
};

export async function toggleDarkmode (username) {
    let [{ id }] = await getAccount(username);
    let getQuery = "SELECT darkmode FROM `zmt`.`darkmode` WHERE (`user_id` = ?);";
    let currentDarkmode = await pool.query(getQuery, [id]);
    currentDarkmode = currentDarkmode[0][0].darkmode;
    currentDarkmode < 1 ? currentDarkmode++ : currentDarkmode--;
    let toggleQuery = "UPDATE `zmt`.`darkmode` SET `darkmode` = ? WHERE (`user_id` = ?);";
    await pool.query(toggleQuery, [currentDarkmode, id]);
};

export async function createDarkmodeRow (id) {
    let query = "INSERT INTO `zmt`.`darkmode` (`user_id`) VALUES (?);";
    await pool.query(query, [id]);
};

export async function getDarkmode (username) {
    let [{ id }] = await getAccount(username);
    let query = "SELECT darkmode FROM `zmt`.`darkmode` WHERE (`user_id` = ?);";
    let result = await pool.query(query, [id]);
    return result[0][0].darkmode;
};

export async function getNews () {
    let query = "SELECT * from `zmt`.`news` ORDER BY `id` DESC LIMIT 1;";
    let [[result]] = await pool.query(query)
        .catch(err => {throw new Error("Something went wrong");});
    if (result.length === 0) throw new Error("Nothing there");
    return result;
};

export async function submitNews(text, img_path, img_alt, img_pos, btn, btn_text, btn_link, pdf, pdf_src) {
    let query = "INSERT INTO `zmt`.`news` (`text`, `img_path`, `img_alt`, `img_pos`, `btn`, `btn_text`, `btn_link`, `pdf`, `pdf_src`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
    btn === "on" ? btn = 1 : btn = 0;
    pdf === "on" ? pdf = 1 : pdf = 0;
    let [result] = await pool.query(query, [text, img_path, img_alt, img_pos, btn, btn_text, btn_link, pdf, pdf_src])
        .catch(err => {return err, console.error(err)});
    return result;
};