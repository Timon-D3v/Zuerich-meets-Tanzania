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

$("#news_form").on("submit", admin_sendNews);

$("#hero_img_upload_submit").click(async () => {
	if (data === "") return alert("Kein Bild hochgeladen.");
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
	let res = await fetch(window.location.origin + "/post/makeAdmin", {
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
	let res = await fetch(window.location.origin + "/post/deleteAdmin", {
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

$("#gallery_img_upload_submit").click(async () => {
	let title = $("#gallery_title").val(),
		subtitle = $("#gallery_subtitle").val(),
		author = $("#username").val();
	if (title === "") return alert("Fülle alle Felder aus.");
	let img = {arr: [], vid: []};
	let files = document.getElementById("gallery_img_upload").files;
	if (files.length === 0) return alert("Keine Bilder hochgeladen.");
	for (let i = 0; i < files.length; i++) {
		let obj = {
			alt: title + "_" + i.toString(),
			src: await toBase64(files[i])
		};
		if (files[i].type.startsWith('video/')) {
			obj.type = files[i].type;
			img.vid.push(obj);
		} else {
			img.arr.push(obj);
		};
	};
	let res = await fetch(window.location.origin + "/post/createGallery", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		mode: "cors",
		cache: "default",
		body: JSON.stringify({
			title,
			subtitle,
			author,
			img
		}),
	});
	res = await res.json();
	res.error === "OK" ?
	alert("Galerie erfolgreich hochgeladen.") :
	alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

$(pdf).click(() => toggleDivs(pdf, s_pdf, s_img));
$(s_btn).click(() => toggleDivs(s_btn, s_btn_menu, h_btn_menu));


function toggleDivs (toggler, first, second) {
    first.hide();
    second.hide();
    toggler.checked ? first.show() : second.show();
};

async function admin_sendNews (e) {
	e.preventDefault();

	let picture = await toBase64(
		document.getElementById("news_img_file").files[0]
	);

	let res = await fetch(window.location.origin + "/post/submitNews", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default",
		body: JSON.stringify({
			text: $("#news_text").val(),
			img: picture,
			img_alt: $("#news_img_alt").val(),
			img_pos: $("#news_img_pos").val(),
			btn: document.getElementById("news_btn").checked.toString(),
			btn_text: $("#news_btn_text").val(),
			btn_link: $("#news_btn_link").val(),
			pdf: document.getElementById("news_pdf").checked.toString(),
			pdf_src: $("#news_pdf_src").val()
		})
	});

	res = await res.json();

	let message;

	res.res === 200 ?
	message = "Das hat geklappt. Die News sind jetzt online." :
	message = "Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut";

	alert(message);
};