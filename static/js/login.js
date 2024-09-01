const password = getElm("password");
const new_password = getElm("new_password");
const eye = getElm("show_password");
const new_eye = getElm("show_new_password");
const new_submit = getElm("submit_sign_up");
const file = getElm("file");


eye.click(() => {
    password.type === "text" ?
    openEyes(password, eye) :
    closeEyes(password, eye);
});

new_eye.click(() => {
    new_password.type === "text" ?
    openEyes(new_password, new_eye) :
    closeEyes(new_password, new_eye);
});

file.on("change", async () => {
    getQuery(".file").get(0).html("<img alt='Dein Bild' src='" + await file.getImgBase64() + "'>");
});

getElm("submit_login").click(validateAccount);
new_submit.click(addAccount);
getQuery(".login_switch").click(toggleForms);

function openEyes (p, e) {
    p.type = "password";
    e.src = "/img/svg/eye.svg";
};

function closeEyes (p, e) {
    p.type = "text";
    e.src = "/img/svg/eye_closed.svg";
};

async function validateAccount (e) {
    e.preventDefault();

    const username = getElm("username");
    const redir = getElm("redir").getAttribute("redirect");
    
    if (username.valIsEmpty() || password.valIsEmpty()) errorField("Bitte fülle alle Felder aus.");

    const result = await post("/post/login", {
        username: username.val(),
        password: password.val()
    }).catch(err => {
        console.error(err);
        errorField(err.message);
        return { valid: false };
    });

    if (result?.valid) return window.location.href = redir;

    errorField(result.message);
};

async function addAccount (e) {
    e.preventDefault();

    new_submit.disabled = true;

    const username = getElm("new_username");
    const name = getElm("name");
    const family_name = getElm("family_name");
    const email = getElm("email");
    const phone = getElm("phone");
    const redir = getElm("redir").getAttribute("redirect");

    const empty = [username, name, family_name, email, new_password].filter(e => e.valIsEmpty());

    if (empty.length > 0) return errorField("Bitte fülle alle Pflichtfelder aus.");

    let base64 = "ERROR";
    try {
        if (file.files.length === 0) throw new Error("Kein Bild ausgewählt.");
        base64 = await toBase64Max1MB(file.file());
    } catch (err) {
        base64 = "/img/svg/personal.svg"
    }

    if (base64 === "ERROR") base64 = "/img/svg/personal.svg";
    
    const result = await post("/post/signUp", {
        username: username.val(),
        password: new_password.val(),
        name: name.val(),
        family_name: family_name.val(),
        email: email.val(),
        picture: base64,
        phone: phone.valIsEmpty() ? "Keine Nummer" : phone.val()
    }).catch(err => {
        console.error(err);
        errorField(err.message);
        return { valid: false };
    });

    if (result?.valid) return window.location.href = redir;

    new_submit.disabled = false;
    errorField(result.message);
};

function toggleForms () {
    getQuery(".login").toggleClass("flex");
    getQuery(".sign-up").toggleClass("flex");
};

getQuery(".h-t-b-m").get(0).remove();
getQuery(".h-n-b").get(0).remove();
clearInterval(i);
window.removeEventListener("resize", typeof V === "undefined" ? setCssVariables : V);