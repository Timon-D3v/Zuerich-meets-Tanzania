import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

const pool = mysql
    .createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PW,
        database: process.env.MYSQL_DB,
        port: process.env.MYSQL_PORT,
    })
    .promise();

export async function createPost(title, author, preview, content, tag = "Blog", img = {}, comment = "Kein Kommentar") {
    let query = "INSERT INTO `zmt`.`blog` (`title`, `author`, `preview`, `content`, `tag`, `img`, `comment`) VALUES (?, ?, ?, ?, ?, ?, ?);",
        error;
    await pool.query(query, [title, author, preview, content, tag, JSON.stringify(img), comment]).catch((err) => {
        error = err;
    });
    return error;
}

export async function getPost() {
    let [result] = await pool.query("SELECT * FROM `zmt`.`blog`;");
    return result;
}

/**
 * @deprecated
 */
export async function getPostWhereTitle(title) {
    let query = "SELECT * FROM `zmt`.`blog` WHERE title = ?;";
    let [result] = await pool.query(query, [title]).catch(() => {
        throw new Error("Fehler");
    });
    if (result == []) throw new Error("Seite nicht vorhanden (404)");
    return result;
}

export async function getBlogWhereTitle(title) {
    let query = "SELECT * FROM `zmt`.`blogs` WHERE title = ?;";
    let [result] = await pool.query(query, [title]).catch(() => {
        throw new Error("Fehler");
    });
    if (result == []) throw new Error("Seite nicht vorhanden (404)");
    return result;
}

export async function newsletterSignUp(data) {
    let status = "Alles in Ordnung",
        query = "INSERT INTO `zmt`.`newsletter` (`gender`, `vorname`, `nachname`, `email`) VALUES (?, ?, ?, ?);";
    await pool.query(query, [data.gender, data.vorname, data.nachname, data.email]).catch((error) => (status = error));
    return status;
}

export async function newsletterSignOff(email) {
    let query = "DELETE FROM `zmt`.`newsletter` WHERE (`email` = ?);";
    await pool.query(query, [email]);
}

export async function newsletterCheck(email) {
    let query = "SELECT * FROM `zmt`.`newsletter` WHERE email = ?;";
    let check;
    let [result] = await pool.query(query, [email]).catch(() => (check = false));
    check = result.length === 0 ? false : true;
    return check;
}

/**
 * @deprecated
 */
export async function getLastXPosts(x) {
    let query = "SELECT * from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    if (result.length !== x) throw new Error("Nicht die gewünschte Anzahl Elemente");
    return result;
}

export async function getLastXBlogs(x) {
    let query = "SELECT * from `zmt`.`blogs` ORDER BY `id` DESC LIMIT " + x + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    if (result.length !== x) throw new Error("Nicht die gewünschte Anzahl Elemente");
    return result;
}

/**
 * @deprecated
 */
export async function getLastXPostLinks(x) {
    let query = "SELECT title from `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x.toString() + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function getLastXBlogLinks(x) {
    let query = "SELECT title from `zmt`.`blogs` ORDER BY `id` DESC LIMIT " + x.toString() + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function validateAccount(username, password) {
    let [account] = await getAccount(username).catch(() => {
        throw new Error("Keine Verbindung möglich...");
    });
    if (!account) throw new Error("Dieser Benutzername existiert nicht.");
    if (password === account.password) account.valid = true;
    else account.valid = false;
    return account;
}

export async function getAccount(username) {
    let query = "SELECT * from `zmt`.`users` WHERE `username` = ?;";
    let [result] = await pool.query(query, [username]).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function getAccountWithId(id) {
    let query = "SELECT * from `zmt`.`users` WHERE `id` = ?;";
    let [result] = await pool.query(query, [id]).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function createAccount(username, password, name, family_name, email, picture, phone, address) {
    let query = "INSERT INTO `zmt`.`users` (`username`, `password`, `name`, `family_name`, `email`, `picture`, `phone`, `type`, `address`) VALUES (?, ?, ?, ?, ?, ?, ?, 'user', ?);";
    await pool.query(query, [username, password, name, family_name, email, picture, phone, address]);
    let [result] = await getAccount(username);
    await createDarkmodeRow(result.id);
    return result;
}

export async function getPictureWithFullName(name, family_name) {
    let query = "SELECT picture FROM `zmt`.`users` WHERE name = ? AND family_name = ?;";
    let [result] = await pool.query(query, [name, family_name]).catch(() => {
        throw new Error("Keine Verbindung möglich...");
    });
    return result;
}

export async function updateProfile(_id, username, password, name, family_name, email, phone, address) {
    let query = "UPDATE `zmt`.`users` SET `username` = ?, `password` = ?, `name` = ?, `family_name` = ?, `email` = ?, `phone` = ?, `address` = ? WHERE (`id` = '" + _id.toString() + "');";
    await pool.query(query, [username, password, name, family_name, email, phone, address]).catch((err) => {
        console.error(err);
        throw new Error("Error");
    });
    return "No Error";
}

export async function updateProfilePicture(username, picture) {
    let query = "UPDATE `zmt`.`users` SET `picture` = ? WHERE (`username` = '" + username + "');";
    await pool.query(query, [picture]).catch((err) => {
        return err, console.error(err);
    });
    return "No Error";
}

export async function toggleDarkmode(username) {
    let [{ id }] = await getAccount(username);
    let getQuery = "SELECT darkmode FROM `zmt`.`darkmode` WHERE (`user_id` = ?);";
    let currentDarkmode = await pool.query(getQuery, [id]);
    currentDarkmode = currentDarkmode[0][0].darkmode;
    currentDarkmode < 1 ? currentDarkmode++ : currentDarkmode--;
    let toggleQuery = "UPDATE `zmt`.`darkmode` SET `darkmode` = ? WHERE (`user_id` = ?);";
    await pool.query(toggleQuery, [currentDarkmode, id]);
}

export async function createDarkmodeRow(id) {
    let query = "INSERT INTO `zmt`.`darkmode` (`user_id`) VALUES (?);";
    await pool.query(query, [id]);
}

export async function getDarkmode(username) {
    let [{ id }] = await getAccount(username);
    let query = "SELECT darkmode FROM `zmt`.`darkmode` WHERE (`user_id` = ?);";
    let result = await pool.query(query, [id]);
    return result[0][0].darkmode;
}

export async function getNews() {
    let query = "SELECT * from `zmt`.`news` ORDER BY `id` DESC LIMIT 1;";
    let [[result]] = await pool.query(query).catch((err) => {
        throw new Error("Something went wrong");
    });
    if (result.length === 0) throw new Error("Nothing there");
    return result;
}

export async function getXNews(i) {
    let query = "SELECT * from `zmt`.`news` ORDER BY `id` DESC LIMIT ?;";
    let [result] = await pool.query(query, [i]).catch((err) => {
        throw new Error("Something went wrong");
    });
    if (result.length === 0) throw new Error("Nothing there");
    return result;
}

export async function submitNews(html, type, src, position) {
    let query = "INSERT INTO `zmt`.`news` (`html`, `type`, `src`, `position`) VALUES (?, ?, ?, ?);";
    await pool.query(query, [JSON.stringify(html), type, src, position]);
    return true;
}

export async function updateNews(html, type, src, position, id) {
    let query = "UPDATE `zmt`.`news` SET `html` = ?, `type` = ?, `src` = ?, `position` = ? WHERE (`id` = ?);";
    await pool.query(query, [JSON.stringify(html), type, src, position, id]);
    return true;
}

export async function getAllUsers() {
    let query = "SELECT username, name, family_name, email, phone, type, address FROM `zmt`.`users`;";
    let [result] = await pool.query(query).catch((err) => {
        throw new Error("Something went wrong");
    });
    return result;
}

export async function getAllUsersFull() {
    let query = "SELECT * FROM `zmt`.`users`;";
    let [result] = await pool.query(query).catch((err) => {
        throw new Error("Something went wrong");
    });
    return result;
}

export async function getAllNewsletterSignUps() {
    let query = "SELECT gender, vorname, nachname, email FROM `zmt`.`newsletter`;";
    let [result] = await pool.query(query).catch((err) => {
        throw new Error("Something went wrong");
    });
    return result;
}

export async function makeAdmin(username) {
    let query = "UPDATE `zmt`.`users` SET `type` = 'admin' WHERE (`username` = ?);";
    let result = true;
    await pool.query(query, username).catch(() => (result = false));
    toggleIsAdmin(username);
    return result;
}

export async function deleteAdmin(username) {
    let query = "UPDATE `zmt`.`users` SET `type` = 'user' WHERE (`username` = ?);";
    let result = true;
    await pool.query(query, username).catch(() => (result = false));
    toggleIsAdmin(username);
    return result;
}

export async function getGalleyWhereTitle(title) {
    let query = "SELECT * FROM `zmt`.`gallery` WHERE title = ?;";
    let [result] = await pool.query(query, [title]).catch(() => {
        throw new Error("Fehler");
    });
    if (result == []) throw new Error("Seite nicht vorhanden (404)");
    return result;
}

export async function createGallery(title, subtitle, author, img) {
    let query = "INSERT INTO `zmt`.`gallery` (`author`, `title`, `subtitle`, `date`, `img`) VALUES (?, ?, ?, ?, ?);",
        error;
    await pool.query(query, [author, title, subtitle, Date().toString(), JSON.stringify(img)]).catch((err) => {
        error = err;
    });
    return error;
}

export async function getLastXGalleryLinks(x) {
    let query = "SELECT title from `zmt`.`gallery` ORDER BY `id` DESC LIMIT " + x.toString() + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function getSessionIdWithUserId(user_id) {
    let query = "SELECT * from `zmt`.`payment_session` WHERE (`user_id` = ?) ORDER BY `pay_id` DESC LIMIT 1;";
    let [result] = await pool.query(query, [user_id]);
    return result[0];
}

export async function linkUserWithSession(user, session_id, key) {
    let query = "INSERT INTO `zmt`.`payment_session` (`user_id`, `session_id`, `username`, `user_password`, `pay_key`) VALUES (?, ?, ?, ?, ?);";
    await pool.query(query, [user.id, session_id, user.username, user.password, key]);
}

export async function createTempPayment(subscription_id, period_start, period_end, customer_id, start_date, status) {
    let query = "INSERT INTO `zmt`.`temp_sub` (`sub_id`, `customer_id`, `period_end`, `period_start`, `start_date`, `status`) VALUES (?, ?, ?, ?, ?, ?);";
    await pool.query(query, [subscription_id, customer_id, period_end, period_start, start_date, status]);
}

export async function getMemberWithSubscriptionId(subscription_id) {
    let query = "SELECT * FROM `zmt`.`members` WHERE `subscription_id` = ?;";
    let [result] = await pool.query(query, [subscription_id]);
    return result;
}

export async function updateTempSubscriptionPeriodStart(subscription_id, period_start) {
    let query = "UPDATE `zmt`.`temp_sub` SET `period_start` = ? WHERE (`subscription_id` = ?);";
    await pool.query(query, [period_start, subscription_id]);
}

export async function updateTempSubscriptionPeriodEnd(subscription_id, period_end) {
    let query = "UPDATE `zmt`.`temp_sub` SET `period_end` = ? WHERE (`subscription_id` = ?);";
    await pool.query(query, [period_end, subscription_id]);
}

export async function updateTempSubscriptionStatus(subscription_id, status) {
    let query = "UPDATE `zmt`.`temp_sub` SET `status` = ? WHERE (`sub_id` = ?);";
    await pool.query(query, [status, subscription_id]);
}

export async function updateMemberPeriodStart(subscription_id, period_start) {
    let query = "UPDATE `zmt`.`members` SET `period_start` = ? WHERE (`subscription_id` = ?);";
    await pool.query(query, [period_start, subscription_id]);
}

export async function updateMemberPeriodEnd(subscription_id, period_end) {
    let query = "UPDATE `zmt`.`members` SET `period_end` = ? WHERE (`subscription_id` = ?);";
    await pool.query(query, [period_end, subscription_id]);
}

export async function updateMemberStatus(subscription_id, status) {
    let query = "UPDATE `zmt`.`members` SET `status` = ? WHERE (`subscription_id` = ?);";
    await pool.query(query, [status, subscription_id]);
}

export async function deleteMemberWithSubscriptionId(subscription_id) {
    let query = "DELETE FROM `zmt`.`members` WHERE (`subscription_id` = ?);";
    await pool.query(query, [subscription_id]);
}

export async function removeMemberWithUserId(id) {
    let query = "UPDATE `zmt`.`users` SET `type` = 'user' WHERE (`id` = ?);";
    await pool.query(query, [id]);
}

export async function getSubscriptionIdWithCustomerId(customer_id) {
    let query = "SELECT * FROM `zmt`.`temp_sub` WHERE `customer_id` = ?;";
    let [result] = await pool.query(query, customer_id);
    return result[0];
}

export async function getMemberWithCustomerId(customer_id) {
    let query = "SELECT * FROM `zmt`.`members` WHERE `cusomer_id` = ?;";
    let [result] = await pool.query(query, customer_id);
    return result[0];
}

export async function getMemberWithUserId(user_id) {
    let query = "SELECT * FROM `zmt`.`members` WHERE `user_id` = ?;";
    let [result] = await pool.query(query, user_id);
    return result[0];
}

export async function addInvoiceToDatabase(subscription_id, pdf, url) {
    let query = "INSERT INTO `zmt`.`invoice` (`subscription_id`, `pdf`, `url`) VALUES (?, ?, ?);";
    await pool.query(query, [subscription_id, pdf, url]);
}

export async function getTempPaymentWithSubscriptionId(subscription_id) {
    let query = "SELECT * FROM `zmt`.`temp_sub` WHERE `sub_id` = ?;";
    let [result] = await pool.query(query, [subscription_id]);
    return result[0];
}

export async function createMember(user_id, subscription_id, customer_id, status, period_start, period_end, start_date, is_admin) {
    let query = "INSERT INTO `zmt`.`members` (`user_id`, `subscription_id`, `cusomer_id`, `status`, `period_start`, `period_end`, `start_date`, `is_admin`) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
    await pool.query(query, [user_id, subscription_id, customer_id, status, period_start, period_end, start_date, is_admin]);
}

export async function addMemberWithUserId(user_id) {
    let query = "UPDATE `zmt`.`users` SET `type` = 'member' WHERE (`id` = ?);";
    await pool.query(query, [user_id]);
}

export async function getBills(subscription_id) {
    let query = "SELECT * FROM `zmt`.`invoice` WHERE (`subscription_id` = ?);";
    let [result] = await pool.query(query, [subscription_id]);
    return result;
}

export async function getNewsletterSignUpWithEmail(email) {
    let query = "SELECT * FROM `zmt`.`newsletter` WHERE `email` = ?;";
    let [result] = await pool.query(query, [email]);
    return result;
}

export async function deleteNewsletterSignUpWithEmail(email) {
    let query = "DELETE FROM `zmt`.`newsletter` WHERE (`email` = ?);";
    await pool.query(query, [email]);
}

export async function deleteLastXPosts(x) {
    let query = "DELETE FROM `zmt`.`blog` ORDER BY `id` DESC LIMIT " + x + ";";
    let [result] = await pool.query(query).catch(() => {
        throw new Error("Fehler");
    });
    return result;
}

export async function mergeBlogs(number, title, description, team, img, alt) {
    try {
        const json = {
            alt: [alt],
            img: [img],
        };
        let content = "";
        const blogs = await getLastXPosts(number);
        for (let i = 0; i < blogs.length; i++) {
            content += blogs[blogs.length - 1 - i].content;
        }
        content += '<div class="blog_line"></div><br><h1 class="title">Das Team</h1>';
        content += team;
        await deleteLastXPosts(number);
        await createPost(title, "Das ZMT Team", description, content, "Blog", json, "Zusammengefügt");
        return {
            status: 200,
            message: "Das hat geklappt! Die Blogs sind jetzt zusammengefügt.",
        };
    } catch (err) {
        console.error(err.message);
        return {
            status: 500,
            message: "Etwas hat nicht geklappt: " + err.message,
        };
    }
}

export async function getAllNewsletterEmails() {
    let query = "SELECT email FROM `zmt`.`newsletter`;";
    let [result] = await pool.query(query).catch(() => []);
    result.forEach((element, i) => {
        result[i] = element.email;
    });
    return result;
}

export async function getCurrentTeamInfo() {
    let query = "SELECT * FROM `zmt`.`team` ORDER BY `id` DESC LIMIT 1;";
    let [result] = await pool.query(query).catch(() => []);
    return result[0];
}

export async function createTeam(date, spruch, desc, img) {
    let query = "INSERT INTO `zmt`.`team` (`aktualisiert`, `leitsatz`, `text`, `bild`, `members`) VALUES (?, ?, ?, ?, ?);";
    await pool.query(query, [date, spruch, desc, img, JSON.stringify([])]);
    return true;
}

export async function addTeamMember(user) {
    let query = "SELECT * FROM `zmt`.`team` ORDER BY `id` DESC LIMIT 1;";
    let [result] = await pool.query(query);
    let team = result[0]?.members || [];
    team.push(user);
    query = "UPDATE `zmt`.`team` SET `members` = ? WHERE (`id` = ?);";
    await pool.query(query, [JSON.stringify(team), result[0].id]);
    return true;
}

export async function removeTeamMember(username) {
    let query = "SELECT * FROM `zmt`.`team` ORDER BY `id` DESC LIMIT 1;";
    let [result] = await pool.query(query);
    let team = result[0]?.members || [];
    let length = team.length;
    for (let i = 0; i < team.length; i++) {
        if (team[i].username === username) {
            team.splice(i, 1);
            break;
        }
    }
    if (length === team.length) return false;
    query = "UPDATE `zmt`.`team` SET `members` = ? WHERE (`id` = ?);";
    await pool.query(query, [JSON.stringify(team), result[0].id]);
    return true;
}

export async function updateGallery(title, gallery) {
    let query = "UPDATE `zmt`.`gallery` SET `date` = ?, `img` = ? WHERE (`title` = ?);";
    let status = "OK";
    try {
        await pool.query(query, [gallery.date, JSON.stringify(gallery.img), title]);
    } catch (e) {
        console.error(e);
        status = "Not OK";
    }
    return status;
}

export async function getLast5Events() {
    return await getLastXEvents(5);
}

export async function getLastXEvents(x) {
    let query = "SELECT title, date FROM `zmt`.`calendar` WHERE date >= CURDATE() ORDER BY date ASC LIMIT ?;";
    let [result] = await pool.query(query, [x]);
    result.map(
        (event) =>
            (event.date = event.date.toLocaleDateString("de-ch", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "2-digit",
            })),
    );
    return result;
}

export async function insertEvent(title, date) {
    let query = "INSERT INTO `zmt`.`calendar` (title, date) VALUES (?, ?);";
    let array = date.split("-");
    await pool.query(query, [title, `${array[2]}-${array[1]}-${array[0]}`]);
    return true;
}

/**
 * @deprecated
 */
export async function deletePost(titel) {
    let query = "DELETE FROM `zmt`.`blog` WHERE title = ?;";
    await pool.query(query, [titel]);
    return true;
}

export async function deleteBlog(titel) {
    let query = "DELETE FROM `zmt`.`blogs` WHERE title = ?;";
    await pool.query(query, [titel]);
    return true;
}

export async function deleteEvent(titel) {
    let query1 = "SELECT * FROM `zmt`.`calendar` WHERE title = ?;";
    let [result] = await pool.query(query1, [titel]);
    if (result.length === 0) return {
        valid: true,
        found: false,
    };

    let query = "DELETE FROM `zmt`.`calendar` WHERE title = ?;";
    await pool.query(query, [titel]);
    return {
        valid: true,
        found: true,
    };
}

export async function putBlogPost(title, data) {
    let query = "INSERT INTO `zmt`.`blogs` (`title`, `data`) VALUES (?, ?);";
    await pool.query(query, [title, JSON.stringify(data)]);
    return true;
}

export async function updateBlogPost(originalName, title, data) {
    let query = "UPDATE `zmt`.`blogs` SET `title` = ?, `data` = ? WHERE (`title` = ?);";
    await pool.query(query, [title, JSON.stringify(data), originalName]);
    return true;
}

export async function getBlogPost(title) {
    let query = "SELECT * FROM `zmt`.`blogs` WHERE title = ?;";
    let [result] = await pool.query(query, [title]);
    return result;
}

export async function getLastXBlogPosts(x) {
    let query = "SELECT * FROM `zmt`.`blogs` ORDER BY `id` DESC LIMIT ?;";
    let [result] = await pool.query(query, [x]);
    return result;
}
