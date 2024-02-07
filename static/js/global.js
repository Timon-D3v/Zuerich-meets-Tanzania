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
	b1 = $("#darkmode2");

$("#menu").on("click", () => {
	$("#menu").toggleClass("is-active");
	$(document).trigger("open-navigation");
});

$(document).on("open-navigation", () => {
	$("#menu").hasClass("is-active") ?
	openNav() :
	closeNav();
});

b1.on("click", () => {
	$("#darkmode").click();
	root.attr("data-theme") === "light" ?
	b1.attr("data-tooltip-content", "Darkmode") :
	b1.attr("data-tooltip-content", "Lightmode");
});

document.querySelectorAll(".n-t-summary").forEach((elm, i) => {
	$(elm).on("click", () => {
		$(document.querySelectorAll(".n-t-details")[i]).toggleClass("open");
	});
});

nav_desktop_l.forEach((elm, i) => {
	gsap.set(nav_desktop_elm[i], {x: "-50%"})
	elm.on("click", () => {
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

$("#darkmode").on("click", changeTheme);
$(document).ready(setCssVariables);
$(window).resize(setCssVariables);



setInterval(setCssVariables, 1000);