var data = "";
const pdf = document.getElementById("news_pdf"),
    s_btn = document.getElementById("news_btn"),
    s_pdf = $("#show_pdf"),
    s_img = $("#show_img"),
    s_btn_menu = $("#show_btn_menu"),
    h_btn_menu = $("#show_nothing"),
	merge_blogs_num = getElm("merge_blogs"),
	merge_blogs_title = getElm("merge_blogs_title"),
	merge_blogs_desc = getElm("merge_blogs_desc"),
	merge_blogs_author = getElm("merge_blogs_author"),
	merge_blogs_file = getElm("merge_blogs_basic_img"),
	merge_blogs_alt = getElm("merge_blogs_basic_alt"),
	merge_blogs_btn = getElm("merge_blogs_btn");

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

merge_blogs_btn.click(async () => {
	const res = await post("/post/mergeBlogs", {
		title: merge_blogs_title.val(),
		description: merge_blogs_desc.val(),
		author: merge_blogs_author.val(),
		base64: await merge_blogs_file.getImgBase64(),
		alt: merge_blogs_alt.val(),
		number: Number(merge_blogs_num.val())
	});

	alert(res.message);

	if (res.status === 200) console.log(res.message);
	else if (res.status === 500) console.error(res.message);
	else console.error("Unbekannter Fehler");
});

getElm("team-m-submit").click(async () => {
	const leitsatz = getElm("team-m-leitsatz");
	const beschreibung = getElm("team-m-beschreibung");

	if (leitsatz.valIsEmpty() || beschreibung.valIsEmpty()) {
		alert("Bitte fülle alle Felder aus");
		return;
	}

	const base64 = await getElm("team-m-img").getImgBase64();
	
	if (base64 === undefined) {
		alert("Bitte wähle ein Bild aus");
		return;
	}

	const res = await post("/post/createTeam", {
		leitsatz: leitsatz.val(),
		beschreibung: beschreibung.val(),
		base64
	});

	alert(res.valid ? "Team wurde erstellt" : "Team konnte nicht erstellt werden");
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

	let picture = "";
	try {
		picture = await toBase64(
			document.getElementById("news_img_file").files[0]
		);
	} catch (err) {
		warnLog("No image uploaded");
	};

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