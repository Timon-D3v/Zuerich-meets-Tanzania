const success_field = $("#success_field");
const error_field = $("#error_field");



$("#contact-form").on("submit", async e => {
    e.preventDefault();
    let res = await fetch("/post/sendMail", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
		body: JSON.stringify({
            message: $("#contact-message").val(),
            author_name: $("#contact-name").val(),
            author_family_name: $("#contact-family-name").val(),
            author_email: $("#contact-email").val()
        })
	});
    let status = res.status;
    res = await res.json();
    status === 500 ?
    mailError(res.res) :
    mailSuccess(res.res);
});


function mailError (message) {
    error_field.html('<img alt="Achtung" src="/img/svg/alert.svg">' + message);
    gsap.set(error_field, {opacity: 1, display: "block"});
    setTimeout(() => {
        gsap.to(error_field, {opacity: 0, duration: 5, ease: "power2.in", display: "none"});
    }, 5000);
};

function mailSuccess (message) {
    success_field.html('<img alt="Info" src="/img/svg/alert.svg">' + message);
    gsap.set(success_field, {opacity: 1, display: "block"});
    setTimeout(() => {
        gsap.to(success_field, {opacity: 0, duration: 5, ease: "power2.in", display: "none"});
    }, 5000);
    $("#contact-submit").attr("disabled", true);
};