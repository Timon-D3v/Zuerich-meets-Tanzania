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

export async function createPost (title, author, preview, content, tag = "Blog", img = [], comment = "Kein Kommentar") {
    let query = "INSERT INTO `zmt`.`blog` (`title`, `author`, `preview`, `content`, `tag`, `img`, `comment`) VALUES (?, ?, ?, ?, ?, ?, ?);",
        json_img = {}, error;
    img.forEach((elm, i) => {json_img[i.toString()] = elm;});
    json_img = JSON.stringify(json_img);
    await pool.query(query, [title, author, preview, content, tag, json_img, comment])
    .catch(err => {error = err});
    return error; 
};

export async function getPost () {
    let [result] = await pool.query("SELECT * FROM `zmt`.`blog`;");
    return result;
};