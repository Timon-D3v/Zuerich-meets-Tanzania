var data = "";
const pdf = document.getElementById("news_pdf"),
    s_btn = document.getElementById("news_btn"),
    s_pdf = $("#show_pdf"),
    s_img = $("#show_img"),
    s_btn_menu = $("#show_btn_menu"),
    h_btn_menu = $("#show_nothing");

s_pdf.hide();

$("#hero_img_upload").on("change", async (e) => {
	data = await toBase64(e.target.files[0]);
	$("#hero_file_preview").attr("src", data);
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

$("#submit-make-admin").click(async () => {
	let username = $("#make-admin").val();
	if (username === "") return alert("Bitte gib einen gültigen Benutzernamen ein.");
	let res = await fetch("/post/makeAdmin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		mode: "cors",
		cache: "default",
		body: JSON.stringify({username: username})
	});
	res = await res.json();
	if (res.good) return alert(username + " ist jetzt ein Admin.");
	alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

$("#submit-delete-admin").click(async () => {
	let username = $("#delete-admin").val();
	if (username === "") return alert("Bitte gib einen gültigen Benutzernamen ein.");
	let res = await fetch("/post/deleteAdmin", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		mode: "cors",
		cache: "default",
		body: JSON.stringify({username: username})
	});
	res = await res.json();
	if (res.good) return alert(username + " ist jetzt kein Admin mehr.");
	alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

$(pdf).click(() => toggleDivs(pdf, s_pdf, s_img));
$(s_btn).click(() => toggleDivs(s_btn, s_btn_menu, h_btn_menu));


function toggleDivs (toggler, first, second) {
    first.hide();
    second.hide();
    toggler.checked ? first.show() : second.show();
};