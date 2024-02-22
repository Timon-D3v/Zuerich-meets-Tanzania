const login = $(".login"),
    signUp = $(".sign-up"),
    password = $("#password"),
    new_password = $("#new_password"),
    eye = $("#show_password"),
    new_eye = $("#show_new_password");


$(".login_switch").click(() => {
    login.toggleClass("flex");
    signUp.toggleClass("flex");
});

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

function openEyes (p, e) {
    p.attr("type", "password");
    e.attr("src", "/img/svg/eye.svg");
};

function closeEyes (p, e) {
    p.attr("type", "text");
    e.attr("src", "/img/svg/eye_closed.svg");
};

$(".h-t-b-m").remove();
$(".h-n-b").remove();
$(window).off("resize");
clearInterval(interval_setCssVariables);