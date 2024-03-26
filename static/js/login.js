const login = $(".login"),
    signUp = $(".sign-up"),
    password = $("#password"),
    new_password = $("#new_password"),
    eye = $("#show_password"),
    new_eye = $("#show_new_password"),
    submit = $("#submit_login"),
    new_submit = $("#submit_sign_up"),
    username = $("#username"),
    new_username = $("#new_username"),
    first_name = $("#name"),
    family_name = $("#family_name"),
    email = $("#email"),
    phone = $("#phone"),
    file = $("#file"),
    error = $("#error"),
    error_field = $(".error");


eye.click(() => {
    password.attr("type") === "text" ?
    openEyes(password, eye) :
    closeEyes(password, eye);
});

new_eye.click(() => {
    new_password.attr("type") === "text" ?
    openEyes(new_password, new_eye) :
    closeEyes(new_password, new_eye);
});

file.change(async () => {
    $(".file").html("<img alt='Dein Bild' src='" + await toBase64(file.prop('files')[0]) + "'>");
});

submit.click(validateAccount);
new_submit.click(addAccount);
$(".login_switch").click(toggleForms);

function openEyes (p, e) {
    p.attr("type", "password");
    e.attr("src", "/img/svg/eye.svg");
};

function closeEyes (p, e) {
    p.attr("type", "text");
    e.attr("src", "/img/svg/eye_closed.svg");
};

async function validateAccount (e) {
    e.preventDefault();
    let u = username.val(),
        p = password.val(),
        r = $("#redir").attr("redirect");
    if (u === "" || p === "") return;
    let res = await fetch(window.location.origin + "/post/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
        body: JSON.stringify({
            username: u,
            password: p,
            redir: r
        })
    })
    .catch(err => {
        error.html(err);
        showErrorField();
    });
    if (res.ok && res.redirected) window.location.href = res.url;
    else {
        res = await res.json();
        error.html(res.message);
        showErrorField();
    };
};

async function addAccount (e) {
    e.preventDefault();
    new_submit.attr("disabled", true);
    let u = new_username.val(),
        p = new_password.val(),
        n = first_name.val(),
        f = family_name.val(),
        m = email.val(),
        t = phone.val(),
        i = file.prop('files')[0],
        r = $("#redir").attr("redirect");
    if (u === "" || p === "" || n === "" || f === "" || m === "") return;
    t === "" ? t = "Keine Nummer" : t = t.toString();
    i ? i = await toBase64Max1MB(i) : i = "/img/svg/personal.svg";
    let res = await fetch(window.location.origin + "/post/signUp", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
        body: JSON.stringify({
            username: u,
            password: p,
            name: n,
            family_name: f,
            email: m,
            picture: i,
            phone: t,
            redir: r
        })
    })
    .catch(err => {
        error.html(err);
        showErrorField();
    });
    if (res.ok && res.redirected) window.location.href = res.url;
    else {
        new_submit.attr("disabled", false);
        res = await res.json();
        error.html(res.message);
        showErrorField();
    };
};

function showErrorField () {
    gsap.set(error_field, {opacity: 1, display: "block"});
    setTimeout(() => {
        gsap.to(error_field, {opacity: 0, duration: 5, ease: "power2.in", display: "none"});
    }, 5000);
};

function toggleForms () {
    login.toggleClass("flex");
    signUp.toggleClass("flex");
};

$(".h-t-b-m").remove();
$(".h-n-b").remove();
$(window).off("resize");
clearInterval(interval_setCssVariables);