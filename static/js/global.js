new Event("open-navigation");

const root = $(":root");

$("#menu").on("click", () => {
	$("#menu").toggleClass("is-active");
	$(document).trigger("open-navigation");
});

$(document).on("open-navitagtion", () => {
	console.log("Triggerd nav");
});

function changeTheme() {
	root.attr("data-theme") === "dark" ?
	root.attr("data-theme", "light") :
	root.attr("data-theme", "dark");
};

$("#darkmode").on("click", changeTheme);