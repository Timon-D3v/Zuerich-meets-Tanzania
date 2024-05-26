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
	b2 = $("#darkmode3"),
	f_a_h = $("#newsletter-anrede-herr"),
	f_a_f = $("#newsletter-anrede-frau"),
	logouts = getQuery(".logout");

let	num_of_title = 5,
	num_of_gallery = 5;

$("#menu").click(() => {
	$("#menu").toggleClass("is-active");
	$(document).trigger("open-navigation");
});

$(document).on("open-navigation", () => {
	$("#menu").hasClass("is-active") ?
	openNav() :
	closeNav();
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
	elm.click((e) => {
		e.preventDefault();
		navCloseOthers(i);
		elm.toggleClass("active");
		$(nav_desktop_elm[i]).toggleClass("active");
		$(nav_desktop_elm[i]).hasClass("active") ?
		gsap.to(nav_desktop_elm[i], navGsap("-50%", "100%")) :
		gsap.to(nav_desktop_elm[i], navGsap("-50%", 0));
		$(nav_desktop_elm[i]).hasClass("active") ?
		document.querySelectorAll("main *")
		.forEach(elm => elm.addEventListener("click", closeNavWithMainDesktop)) :
		document.querySelectorAll("main *")
		.forEach(elm => elm.removeEventListener("click", closeNavWithMainDesktop));
	});
});

if (logouts.length > 0) logouts.click(async e => {
	e.preventDefault();
	let res = await post("/logout");
	res.status === 200 ?
	window.location.reload() :
	errorField();
});

function changeTheme() {
	if (root.attr("data-theme") === "dark") {
		root.attr("data-theme", "light");
		b1.attr("data-tooltip-content", "Lightmode");
		b2.attr("data-tooltip-content", "Lightmode");
	} else {
		root.attr("data-theme", "dark");
		b1.attr("data-tooltip-content", "Darkmode");
		b2.attr("data-tooltip-content", "Darkmode");
	};
};

function setTheme () {
	$("#darkmode").click();
};

function openNav () {
	gsap.to("#nav_mobile", navGsap(0, "100%"));
	gsap.to("#nav_tab", navGsap("-100%", 0));
	gsap.set("main", {filter: "brightness(100%)"});
	gsap.to("main", {filter: "brightness(75%)", duration: 0.5, ease: "power2.inOut"});
	document.querySelectorAll("main *")
	.forEach(elm => elm.addEventListener("click", closeNavWithMain));
};

function closeNav () {
	gsap.to("#nav_mobile", navGsap(0, 0));
	gsap.to("#nav_tab", navGsap(0, 0));
	gsap.to("main", {filter: "brightness(100%)", duration: 0.5, ease: "power2.inOut"});
	document.querySelectorAll("main *")
	.forEach(elm => elm.removeEventListener("click", closeNavWithMain));
};

function closeNavWithMain (e) {
	e.preventDefault();
	$("#menu").click();
};

function closeNavWithMainDesktop (e) {
	e.preventDefault();
	navCloseOthers();
	document.querySelectorAll("main *")
	.forEach(elm => elm.removeEventListener("click", closeNavWithMainDesktop));
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
	$("#nav_desktop").css({
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
		  em = $("#newsletter-email");
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
		sendNewsletter(res.data);
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

function toBase64Max1MB (file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.src = reader.result;
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				let width = img.width;
				let height = img.height;
				const maxSize = 1048576;
				if (file.size > maxSize) {
					const scaleFactor = Math.min(1, maxSize / file.size);
					width *= scaleFactor;
					height *= scaleFactor;
				};
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);
				const resizedImage = canvas.toDataURL('image/jpeg', 0.75);
				resolve(resizedImage);
            };
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
};

function toRealDate (date) {
	date = date.toString();
	let time = date.slice(15, 24);
	let day = date.slice(8, 10);
	let year = date.slice(11, 15);
	let month = date.slice(4, 7);
	switch (month) {
		case "Jan":
			month = "Januar";
			break;
		case "Feb":
			month = "Februar";
			break;
		case "Mar":
			month = "März";
			break;
		case "Apr":
			month = "April";
			break;
		case "May":
			month = "Mai";
			break;
		case "Jun":
			month = "Juni";
			break;
		case "Jul":
			month = "Juli";
			break;
		case "Aug":
			month = "August";
			break;
		case "Sep":
			month = "September";
			break;
		case "Oct":
			month = "Oktober";
			break;
		case "Nov":
			month = "November";
			break;
		case "Dec":
			month = "Dezember";
			break;
	};
	return `${day}. ${month} ${year} um ${time}`;
};

function nofunction () {return false;};

async function sendNewsletter (data) {
	let res = await fetch(window.location.origin + "/post/newsletter/signUp", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
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

async function getBlogTitle (num) {
	let res = await fetch(window.location.origin + "/post/blog/getLinks/" + num.toString(), {
		method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
	});
	res = await res.json();
	[
		$(".n-t li .n-t-details ul").eq(2),
		$(".n-m li .n-t-details ul").eq(2),
		$(".n-foldable3 ul")
	].forEach(container => {
		container.html("");
		res.title.forEach(elm => {
			let li = document.createElement("li");
			let a = document.createElement("a");
			a.href = window.location.origin + "/blog/" + elm.title;
			a.innerText = elm.title;
			container.append(li);
			$(li).append(a);
		});
		if (res.title.length === num) {
			let a = document.createElement("a");
			let li = document.createElement("li");
			a.href = "#";
			a.innerText = "Weitere";
			a.onclick = (e) => {
				e.preventDefault();
				num_of_title += 5;
				getBlogTitle(num_of_title);
			};
			container.append(li);
			$(li).append(a);
		};
	});
};
getBlogTitle(num_of_title);

async function getGalleryTitle (num) {
	let res = await fetch(window.location.origin + "/post/gallery/getLinks/" + num.toString(), {
		method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
	});
	res = await res.json();
	[
		$(".n-t li .n-t-details ul").eq(3),
		$(".n-m li .n-t-details ul").eq(3),
		$(".n-foldable4 ul")
	].forEach(container => {
		container.html("");
		res.title.forEach(elm => {
			let li = document.createElement("li");
			let a = document.createElement("a");
			a.href = window.location.origin + "/gallery/" + elm.title;
			a.innerText = elm.title;
			container.append(li);
			$(li).append(a);
		});
		if (res.title.length === num) {
			let a = document.createElement("a");
			let li = document.createElement("li");
			a.href = "#";
			a.innerText = "Weitere";
			a.onclick = (e) => {
				e.preventDefault();
				num_of_gallery += 5;
				getBlogTitle(num_of_gallery);
			};
			container.append(li);
			$(li).append(a);
		};
	});
};
getGalleryTitle(num_of_gallery);

$("#darkmode").click(changeTheme);
$("#newsletter-submit").click(newsletterSignUp);
$(document).ready(setCssVariables);
$(window).resize(setCssVariables);
[b1, b2].forEach(e => e.click(setTheme)); 



var interval_setCssVariables = setInterval(setCssVariables, 1000);