new Event("open-navigation");

const root = $(":root"),
	nav_desktop_l = [
		$("#h-n-b-e-1"),
		$("#h-n-b-e-2"),
		$("#h-n-b-e-3"),
		$("#h-n-b-e-4"),
		$("#h-n-b-e-5")
	],
	nav_desktop_elm = [
		".n-foldable1",
		".n-foldable2",
		".n-foldable3",
		".n-foldable4",
		".n-foldable5",
	],
	b1 = $("#darkmode2"),
	f_a_h = $("#newsletter-anrede-herr"),
	f_a_f = $("#newsletter-anrede-frau");

$("#menu").click(() => {
	$("#menu").toggleClass("is-active");
	$(document).trigger("open-navigation");
});

$(document).on("open-navigation", () => {
	$("#menu").hasClass("is-active") ?
	openNav() :
	closeNav();
});

b1.click(() => {
	$("#darkmode").click();
	root.attr("data-theme") === "light" ?
	b1.attr("data-tooltip-content", "Darkmode") :
	b1.attr("data-tooltip-content", "Lightmode");
});

document.querySelectorAll(".n-t-summary").forEach((elm, i) => {
	$(elm).click(() => {
		$(document.querySelectorAll(".n-t-details")[i]).toggleClass("open");
	});
});

$("img").on("dragstart", () => {return false});
$("svg").on("dragstart", () => {return false});

f_a_h.click(() => {
	f_a_f.prop("checked") ? f_a_f.prop("checked", false) : undefined;
});

f_a_f.click(() => {
	f_a_h.prop("checked") ? f_a_h.prop("checked", false) : undefined;
});


nav_desktop_l.forEach((elm, i) => {
	gsap.set(nav_desktop_elm[i], {x: "-50%"});
	elm.click(() => {
		navCloseOthers(i);
		elm.toggleClass("active");
		$(nav_desktop_elm[i]).toggleClass("active");
		$(nav_desktop_elm[i]).hasClass("active") ?
		gsap.to(nav_desktop_elm[i], navGsap("-50%", "100%")) :
		gsap.to(nav_desktop_elm[i], navGsap("-50%", 0));
	});
});

function changeTheme() {
	root.attr("data-theme") === "dark" ?
	root.attr("data-theme", "light") :
	root.attr("data-theme", "dark");
};

function openNav () {
	gsap.to("#nav_mobile", navGsap(0, "100%"));
	gsap.to("#nav_tab", navGsap("-100%", 0));
};

function closeNav () {
	gsap.to("#nav_mobile", navGsap(0, 0));
	gsap.to("#nav_tab", navGsap(0, 0));
};

function navGsap (x, y) {
	return {x: x, y: y, duration: 0.5, ease: "power2.inOut"};
};

function navCloseOthers (i) {
	nav_desktop_elm.forEach((elm, j) => {
		if (j != i && $(elm).hasClass("active")) {
			$(elm).toggleClass("active");
			nav_desktop_l[j].toggleClass("active");
			gsap.to(elm, navGsap("-50%", 0));
		};
	});
};

function setCssVariables () {
	root.css({
		"--nav_desktop_margin": $(".logo").outerWidth().toString() + "px",
		"--h_d_l_1": $("#h-n-b-e-1").outerWidth().toString() + "px",
		"--h_d_l_2": $("#h-n-b-e-2").outerWidth().toString() + "px",
		"--h_d_l_3": $("#h-n-b-e-3").outerWidth().toString() + "px",
		"--h_d_l_4": $("#h-n-b-e-4").outerWidth().toString() + "px",
		"--h_d_l_5": $("#h-n-b-e-5").outerWidth().toString() + "px",
	});
};

function validateNewsletterForm () {
	const ah = $("#newsletter-anrede-herr"),
		  af = $("#newsletter-anrede-frau"),
		  vn = $("#newsletter-vorname"),
		  nn = $("#newsletter-nachname"),
		  em = $("#newsletter-email"),
		  sb = $("#newsletter-submit");
	let obj = {gender: "Divers"}, 
		err = 0;
	ah.prop("checked") ? obj.gender = "Herr" : undefined;
	af.prop("checked") ? obj.gender = "Frau" : undefined;
	vn.val() === "" ? err = 1 : obj.vorname = vn.val();
	nn.val() === "" ? err = 2 : obj.nachname = nn.val();
	em.val() === "" ? err = 3 : obj.email = em.val();
	return {
		error: err,
		data: obj
	};
};

function newsletterSignUp (e) {
	e.preventDefault();
	const errField = $("#newsletter-form-error");
	let res = validateNewsletterForm();
	if (res.error === 0) {
		sendNewsetter(res.data);
		errField.html("Deine Anmeldung war erfolgreich!")
			.css({
				display: "block",
				color: "var(--c-accent-500)"
			});
		setTimeout(() => errField.css({
			display: "none",
			color: "var(--c-secondary-600)"
		}), 5000);
	} else if (res.error === 1) {
		errField.html("Du musst deinen Vornamen angeben.")
			.css("display", "block");
	} else if (res.error === 2) {
		errField.html("Du musst deinen Nachnamen angeben.")
			.css("display", "block");
	} else if (res.error === 3) {
		errField.html("Du musst deine E-Mail angeben.")
			.css("display", "block");
	};
};

async function sendNewsetter (data) {
	let res = await fetch(window.location.origin + "/post/newsletter/signUp", {
		method: "POST",
		headers: {'Content-Type': 'application/json'},
        mode: 'cors',
        cache: 'default',
		body: JSON.stringify(data)
	})
	.catch(() => $("#newsletter-form-error").css("display", "block")
		.html("Es ist ein unerwarteter Fehler aufgetreten, bitte versuche es in einigen Sekunden erneut...")
	);
	res = await res.json();
	res.status !== "Alles in Ordnung" ? () => {
		$("#newsletter-form-error").css("display", "block")
			.html("Es ist ein unerwarteter Fehler aufgetreten, bitte versuche es in einigen Sekunden erneut...");
		console.error("An Error occured:", res.status);
	} :
	undefined;
};

$("#darkmode").click(changeTheme);
$("#newsletter-submit").click(newsletterSignUp);
$(document).ready(setCssVariables);
$(window).resize(setCssVariables);



setInterval(setCssVariables, 1000);