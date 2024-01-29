new Event("open-navigation");

const root = $(":root");

$("#menu").on("click", () => {
	$("#menu").toggleClass("is-active");
	$(document).trigger("open-navigation");
});

$(document).on("open-navigation", () => {
	$("#menu").hasClass("is-active") ?
	openNav() :
	closeNav();
});

function changeTheme() {
	root.attr("data-theme") === "dark" ?
	root.attr("data-theme", "light") :
	root.attr("data-theme", "dark");
};

function openNav () {
	gsap.to("#nav_mobile", {y: "100%", duration: 0.5, ease: "power2.inOut"});
	gsap.to("#nav_tab", {x: "-100%", duration: 0.5, ease: "power2.inOut"});
};

function closeNav () {
	gsap.to("#nav_mobile", {y: 0, duration: 0.5, ease: "power2.inOut"});
	gsap.to("#nav_tab", {x: 0, duration: 0.5, ease: "power2.inOut"});
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