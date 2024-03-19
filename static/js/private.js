var data = "";
let pdf = document.getElementById("news_pdf"),
    s_btn = document.getElementById("news_btn"),
    s_pdf = $("#show_pdf"),
    s_img = $("#show_img"),
    s_btn_menu = $("#show_btn_menu"),
    h_btn_menu = $("#show_nothing");

s_pdf.hide();

$("#hero_img_upload").on("change", async (e) => {
	data = await toBase64(e.target.files[0]);
});

$("#hero_img_upload_submit").click(async () => {
	if (data === "") return;
	let res = await fetch(window.location.origin + "/post/changeHeroImg", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		mode: "cors",
		cache: "default",
		body: JSON.stringify({ base64: data }),
	});
});

$(pdf).click(() => toggleDivs(pdf, s_pdf, s_img));
$(s_btn).click(() => toggleDivs(s_btn, s_btn_menu, h_btn_menu));


function toggleDivs (toggler, first, second) {
    first.hide();
    second.hide();
    toggler.checked ? first.show() : second.show();
};