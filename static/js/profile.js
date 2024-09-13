const eye = getElm("show_password"),
password = getElm("password"),
given_name = getElm("name"),
family_name = getElm("family_name"),
email = getElm("email"),
phone = getElm("phone"),
submit_changes = getElm("profile-settings-input-submit"),
change_picture = getElm("edit_picture"),
picture_overlay = getElm("picture_overlay"),
file = getElm("file_upload"),
preview_file = getElm("file_preview"),
submit_file = getElm("file_submit"),
newsletterBtn = getElm("notifications_newsletter"),
newsletterSelect = getElm("newsletterSignUpOption"),
close_picture_overlay = getElm("close_picture_overlay"),
get_member = getElm("get_member");


for (let i = 0; i < 3; i++) {
    const elm = getElm("profile_dashboard_btn" + (i + 1));
    const profile_dashboard_content = [
        getQuery(".dynamic .settings"),
        getQuery(".dynamic .preferences"),
        getQuery(".dynamic .membership")
    ];
    elm.click(() => {
        colorizePDButtons(elm);
        profile_dashboard_content.forEach(elm => {
            elm.removeClass("active");
        });
        profile_dashboard_content[i].addClass("active");
    });
}

eye.click(() => {
    password.type === "text" ?
    openEyes(password, eye) :
    closeEyes(password, eye);
});

[
    password,
    given_name,
    family_name,
    email,
    phone
].forEach(elm => elm.on("input", () => {
    checkDefaultProfileVal() ?
    submit_changes.addClass("active") :
    submit_changes.removeClass("active");
}));

submit_changes.click(async () => {
    const result = await post("/post/updateProfile", {
        password: password.valIsEmpty() ? password.placeholder : password.val(),
        given_name: given_name.valIsEmpty() ? given_name.placeholder : given_name.val(),
        family_name: family_name.valIsEmpty() ? family_name.placeholder : family_name.val(),
        email: email.valIsEmpty() ? email.placeholder : email.val(),
        phone: phone.valIsEmpty() ? phone.placeholder : phone.val()
    });

    if (result.res === "No Error") window.location.href = ORIGIN + window.location.pathname + "?js=successField";

    errorField("Fehler beim senden.");
});

change_picture.click(() => {
    picture_overlay.toggleClass("active");
    close_picture_overlay.toggleClass("active");
});

close_picture_overlay.click(() => change_picture.click());

file.on("input", async () => {
    preview_file.src = await toBase64Max1MB(file.file());
    submit_file.addClass("flex");
});

submit_file.click(async () => {
    picture_overlay.toggleClass("active");
    submit_file.removeClass("flex");
    sendNewProfilePicture();
});

if (JSON.stringify(get_member) !== "{}") {
    get_member.click(async () => {
        window.location.href = ORIGIN + "/spenden?js=donate_toggleForms";
    });
} else {
    getMyBills();
};

getElm("preferences_darkmode").click(preferences_toggleDarkmode);
newsletterBtn.click(handleNewsletterCalling);

function colorizePDButtons (btn) {
    for (let i = 0; i < 3; i++) {
        getElm("profile_dashboard_btn" + (i + 1)).removeClass("active");
    }
    btn.addClass("active");
};

function openEyes (p, e) {
    p.type = "password";
    e.src = "/img/svg/eye.svg";
};

function closeEyes (p, e) {
    p.type = "text";
    e.src = "/img/svg/eye_closed.svg";
};

function checkDefaultProfileVal () {
    const valid = element => element.placeholder === element.val() || element.valIsEmpty();

    if (
        valid(password) &&
        valid(given_name) &&
        valid(family_name) &&
        valid(email) &&
        valid(phone)
    ) return false;

    return true;
};

async function sendNewProfilePicture () {
    const result = await post("/post/changePicture", {
        base64: preview_file.src
    });
    if (result.res === "No Error") window.location.href = ORIGIN + window.location.pathname + "?js=successField";

    errorField("Fehler beim hochladen des Bildes.")
};

function preferences_toggleDarkmode () {
    post("/post/toggleDarkmode");
    setTheme();
};

async function checkNewsletter () {
    const result = await post("/post/newsletter/check");
    if (result.check) newsletterBtn.checked = true;
};
checkNewsletter();

async function submitNewsletter () {
    if (newsletterSelect.value === "") return newsletter_noGender();

    const result = await post("/post/newsletter/signUp/logedIn", {
        gender: newsletterSelect.value
    });

    return result.status;
};

async function getMyBills () {
    const bills = await post("/post/getMyBills");
    bills.forEach(bill => {
        const tr = createElm("tr");
        const id = createElm("td");
        const abo = createElm("td");
        const price = createElm("td");
        const status = createElm("td");
        const link = createElm("td");
        const file = createElm("td");
        const stripe = createElm("a");
        const pdf = createElm("a");
        const img = createElm("img");

        img.alt = "Download";
        img.src = "/img/svg/download.svg";
        pdf.append(img)
        stripe.innerHTML = "Zu Stripe";
        pdf.target = "_blank";
        stripe.target = "_blank";
        pdf.href = bill.pdf;
        stripe.href = bill.url;
        id.innerHTML = bill.id;
        abo.innerHTML = "Mitgliedschaft";
        price.innerHTML = "40 CHF";
        status.innerHTML = "Bezahlt";
        link.append(stripe);
        file.append(pdf);
        tr.append(id, abo, price, status, link, file);
        getElm("invoice_append").append(tr);
    });
};

function cancelNewsletter () {
    post("/post/newsletter/signOff");
};

function newsletter_noGender () {
    alert("Du musst eine Anrede wählen.");
    console.warn("Du musst eine Anrede wählen.");
    newsletterBtn.checked = false;
};

function handleNewsletterCalling () {
    if (newsletterBtn.checked) submitNewsletter();
    else cancelNewsletter();
};

function profile_toSection (num) {
    profile_dashboard_buttons[num - 1].click();
};

function profile_toMembership () {
    profile_toSection(3);
};