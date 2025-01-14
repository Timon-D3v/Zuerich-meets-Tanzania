const password = getElm("password");
const new_password = getElm("new_password");
const eye = getElm("show_password");
const new_eye = getElm("show_new_password");
const new_submit = getElm("submit_sign_up");
const file = getElm("file");
var recovery_request = false;

eye.click(() => {
    password.type === "text" ? openEyes(password, eye) : closeEyes(password, eye);
});

new_eye.click(() => {
    new_password.type === "text" ? openEyes(new_password, new_eye) : closeEyes(new_password, new_eye);
});

file.on("change", async () => {
    getQuery(".file")
        .get(0)
        .html("<img alt='Dein Bild' src='" + (await file.getImgBase64()) + "'>");
});

getElm("submit_login").click(validateAccount);
new_submit.click(addAccount);
getQuery(".login_switch").click(toggleForms);

getElm("submit_recovery").click(async (e) => {
    e.preventDefault();

    const mail = getElm("recovery-mail");

    if (mail.valIsEmpty()) return errorNotification("Du musst deine E-Mail eingeben.");

    if (!recovery_request) return requestRecoveryCode();

    const code = getElm("recovery-code");

    if (code.valIsEmpty()) return errorNotification("Bitte gib den Code ein, der dir per E-Mail geschickt wurde.");

    const res = await post("/post/recoverySubmit", {
        email: mail.val(),
        code: code.val(),
    });

    if (res.status === 200) return (window.location = ORIGIN + "/login?js=neutralNotification(`Passwort erfolgreich zurückgesetzt.`);nofunction");

    if (res.status === 501) return errorNotification(res.message);

    errorNotification("Etwas ist schief gelaufen...");
});

getElm("password-forgotten").click((e) => {
    e.preventDefault();

    getQuery(".login").toggleClass("flex");
    getQuery(".password-recovery").toggleClass("flex");
});

getElm("recovery_switch").click(() => {
    getQuery(".login").toggleClass("flex");
    getQuery(".password-recovery").toggleClass("flex");
});

function openEyes(p, e) {
    p.type = "password";
    e.src = "/img/svg/eye.svg";
}

function closeEyes(p, e) {
    p.type = "text";
    e.src = "/img/svg/eye_closed.svg";
}

async function validateAccount(e) {
    e.preventDefault();

    const username = getElm("username");
    const redir = getElm("redir").getAttribute("redirect");

    if (username.valIsEmpty() || password.valIsEmpty()) return errorNotification("Bitte fülle alle Pflichtfelder aus.");

    const result = await post("/post/login", {
        username: username.val(),
        password: password.val(),
    }).catch((err) => {
        console.error(err);
        errorNotification(err.message);
        return { valid: false };
    });

    if (result?.valid) return (window.location.href = redir);

    errorNotification(result.message);
}

async function addAccount(e) {
    e.preventDefault();

    new_submit.disabled = true;

    const username = getElm("new_username");
    const name = getElm("name");
    const family_name = getElm("family_name");
    const email = getElm("email");
    const phone = getElm("phone");
    const location = getElm("address");
    const redir = getElm("redir").getAttribute("redirect");

    const empty = [username, name, family_name, email, new_password, location].filter((e) => e.valIsEmpty());

    if (empty.length > 0) {
        new_submit.disabled = false;
        return errorNotification("Bitte fülle alle Pflichtfelder aus.");
    }

    let base64 = "ERROR";
    try {
        if (file.files.length === 0) throw new Error("Kein Bild ausgewählt.");
        base64 = await toBase64Max1MB(file.file());
    } catch (err) {
        base64 = "/img/svg/personal.svg";
    }

    if (base64 === "ERROR") base64 = "/img/svg/personal.svg";

    const result = await post("/post/signUp", {
        username: username.val(),
        password: new_password.val(),
        name: name.val(),
        family_name: family_name.val(),
        email: email.val(),
        address: location.val(),
        picture: base64,
        phone: phone.valIsEmpty() ? "Keine Nummer" : phone.val(),
    }).catch((err) => {
        console.error(err);
        errorNotification(err.message);
        return { valid: false };
    });

    if (result?.valid) return (window.location.href = redir);

    new_submit.disabled = false;
    errorNotification(result.message);
}

function toggleForms() {
    getQuery(".login").toggleClass("flex");
    getQuery(".sign-up").toggleClass("flex");
}

async function requestRecoveryCode() {
    const res = await post("/post/recoveryRequest", {
        email: getElm("recovery-mail").val(),
    });

    if (res.status !== 200) return errorNotification(res.status === 500 ? "Diese E-Mail ist nicht registriert." : "Etwas ist schief gelaufen...");

    infoNotification("Code gesendet!");
    recovery_request = true;

    getQuery(".recovery-hidden").removeClass("invisible");
}

getQuery(".h-t-b-m").get(0).remove();
getQuery(".h-n-b").get(0).remove();
clearInterval(i);
window.removeEventListener("resize", typeof V === "undefined" ? setCssVariables : V);
