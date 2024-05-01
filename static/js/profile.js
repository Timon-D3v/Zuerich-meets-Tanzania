const profile_dashboard_buttons = [
    $("#profile_dashboard_btn1"),
    $("#profile_dashboard_btn2"),
    $("#profile_dashboard_btn3"),
    $("#profile_dashboard_btn4")
],
profile_dashboard_content = [
        $(".dynamic .settings"),
        $(".dynamic .preferences"),
        $(".dynamic .membership"),
        $(".dynamic .notifications")
],
eye = $("#show_password"),
password = $("#password"),
username = $("#username"),
given_name = $("#name"),
family_name = $("#family_name"),
email = $("#email"),
phone = $("#phone"),
submit_changes = $("#profile-settings-input-submit"),
change_picture = $("#edit_picture"),
picture_overlay = $("#picture_overlay"),
file = $("#file_upload"),
preview_file = $("#file_preview"),
submit_file = $("#file_submit"),
newsletterBtn = $("#notifications_newsletter"),
newsletterSelect = document.getElementById("newsletterSignUpOption"),
close_picture_overlay = $("#close_picture_overlay"),
get_member = $("#get_member");
const default_val = {
    username: username.attr("placeholder"),
    password: password.val(),
    given_name: given_name.attr("placeholder"),
    family_name: family_name.attr("placeholder"),
    email: email.attr("placeholder"),
    phone: phone.attr("placeholder"),
};

profile_dashboard_buttons.forEach((elm, i) => {
    elm.click(() => {
        colorizePDButtons(elm);
        profile_dashboard_content.forEach(elm => {
            elm.removeClass("active");
        });
        profile_dashboard_content[i].addClass("active");
    });
});

eye.click(() => {
    password.attr("type") === "text" ?
    openEyes(password, eye) :
    closeEyes(password, eye);
});

[
    username,
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
    let data = default_val;
    if (username.val() !== "") data.username = username.val();
    if (password.val() !== "") data.password = password.val();
    if (given_name.val() !== "") data.given_name = given_name.val();
    if (family_name.val() !== "") data.family_name = family_name.val();
    if (email.val() !== "") data.email = email.val();
    if (phone.val() !== "") data.phone = phone.val();
    let res = await fetch(window.location.origin + "/post/updateProfile", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
        body: JSON.stringify(data)
    });
    res = await res.json();
    if (res.res === "No Error") window.location.href = window.location.origin 
        + window.location.pathname + "?js=showCommitFeedback";
    showNegativeCommitFeedback("Fehler beim senden.");
});

change_picture.click(() => {
    picture_overlay.toggleClass("active");
    close_picture_overlay.toggleClass("active");
});

close_picture_overlay.click(() => change_picture.click());

file.on("input", async () => {
    preview_file.attr("src", await toBase64Max1MB(file[0].files[0]));
    submit_file.addClass("flex");
});

submit_file.click(async () => {
    picture_overlay.toggleClass("active");
    submit_file.removeClass("flex");
    sendNewProfilePicture();
});

if (JSON.stringify(get_member) !== "{}") {
    get_member.click(async () => {
        const res = await post("/post/getPaymentLink", {
            amount: 40,
            type: "membership"
        });
        window.location.href = res.link;
    });
} else {
    getMyBills();
};

$("#preferences_darkmode").click(preferences_toggleDarkmode);
$("#notifications_newsletter").click(handleNewsletterCalling);

function showCommitFeedback () {
    let p = document.createElement("p");
    p.innerHTML = "<img alt='Achtung' src='/img/svg/alert.svg'> Einstellungen aktualisiert";
    p.classList.add("no-error");
    $("main").append(p);
    gsap.set(p, {opacity: 1, display: "block"});
    setTimeout(() => {
        gsap.to(p, {opacity: 0, duration: 5, ease: "power2.in", display: "none"});
    }, 5000);
};

function showNegativeCommitFeedback (msg) {
    let p = document.createElement("p");
    p.innerHTML = "<img alt='Achtung' src='/img/svg/alert.svg'> " + msg;
    p.classList.add("error");
    $("main").append(p);
    gsap.set(p, {opacity: 1, display: "block"});
    setTimeout(() => {
        gsap.to(p, {opacity: 0, duration: 5, ease: "power2.in", display: "none"});
    }, 5000);
};

function colorizePDButtons (btn) {
    profile_dashboard_buttons.forEach(elm => {
        elm.removeClass("active");
    });
    btn.addClass("active");
};

function openEyes (p, e) {
    p.attr("type", "password");
    e.attr("src", "/img/svg/eye.svg");
};

function closeEyes (p, e) {
    p.attr("type", "text");
    e.attr("src", "/img/svg/eye_closed.svg");
};

function checkDefaultProfileVal () {
    if (
        (default_val.username === username.val() ||
        username.val() === "") &&
        (default_val.password === password.val() ||
        password.val() === "") &&
        (default_val.given_name === given_name.val() ||
        given_name.val() === "") &&
        (default_val.family_name === family_name.val() ||
        family_name.val() === "") &&
        (default_val.email === email.val() ||
        email.val() === "") &&
        (default_val.phone === phone.val() ||
        phone.val() === "")
    ) return false;
    return true;
};

async function sendNewProfilePicture () {
    let res = await fetch(window.location.origin + "/post/changePicture", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
        body: JSON.stringify({
            base64: preview_file.attr("src")
        })
    });
    res = await res.json();
    if (res.res === "No Error") window.location.href = window.location.origin 
        + window.location.pathname + "?js=showCommitFeedback";
    showNegativeCommitFeedback("Fehler beim hochladen des Bildes.")
};

function preferences_toggleDarkmode () {
    fetch(window.location.origin + "/post/toggleDarkmode", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
    });
    setTheme();
};

async function checkNewsletter () {
    let res = await fetch(window.location.origin + "/post/newsletter/check", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
    });
    res = await res.json();
    if (res.check) newsletterBtn.attr("checked", true);
};
checkNewsletter();

async function submitNewsletter () {
    if (newsletterSelect.value === "") return newsletter_noGender();
    let res = await fetch(window.location.origin + "/post/newsletter/signUp/logedIn", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
        body: JSON.stringify({
            gender: newsletterSelect.value
        })
    });
    res = await res.json();
    return res.status;
};

async function getMyBills () {
    const bills = await post("/post/getMyBills");
    bills.forEach((bill, i) => {
        if (i === 0) {
            // Append to Aktuell
        } else if (i === 1) {
            // Create "More Bills"
            // Append there
        } else {
            // Append to "More Bills"
        };
    });
};

function cancelNewsletter () {
    fetch(window.location.origin + "/post/newsletter/signOff", {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
    });
};

function newsletter_noGender () {
    alert("Du musst eine Anrede wählen.");
    console.warn("Du musst eine Anrede wählen.");
    document.getElementById("notifications_newsletter").checked = false;
};

function handleNewsletterCalling () {
    if (document.getElementById("notifications_newsletter").checked) submitNewsletter();
    else cancelNewsletter();
};

function profile_toSection (num) {
    profile_dashboard_buttons[num - 1].click();
};

function profile_toMembership () {
    profile_toSection(3);
};