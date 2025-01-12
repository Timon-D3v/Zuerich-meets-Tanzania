var data = "";
const pdf = getElm("news_pdf");
const s_btn = getElm("news_btn");

getElm("hero_img_upload").on("change", async (e) => {
    data = await toBase64(e.target.files[0]);
    getElm("hero_file_preview").src = data;
});

getElm("news_form").on("submit", admin_sendNews);

getElm("hero_img_upload_submit").click(async () => {
    if (data === "") return alert("Kein Bild hochgeladen.");
    post("/post/changeHeroImg", { base64: data });
});

getElm("submit-make-admin").click(async () => {
    let username = getElm("make-admin").val();
    if (username === "") return alert("Bitte gib einen gültigen Benutzernamen ein.");
    const res = await post("/post/makeAdmin", { username });
    if (res.good) return alert(username + " ist jetzt ein Admin.");
    alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

getElm("submit-delete-admin").click(async () => {
    let username = getElm("delete-admin").val();
    if (username === "") return alert("Bitte gib einen gültigen Benutzernamen ein.");
    let res = await post("/post/deleteAdmin", { username });
    if (res.good) return alert(username + " ist jetzt kein Admin mehr.");
    alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

getElm("gallery_img_upload_submit").click(async () => {
    let title = getElm("gallery_title").val(),
        subtitle = getElm("gallery_subtitle").val(),
        author = getElm("username").val();
    if (title === "") return alert("Fülle alle Felder aus.");
    let img = { arr: [], vid: [] };
    let files = getElm("gallery_img_upload").files;
    if (files.length === 0) return alert("Keine Bilder hochgeladen.");
    for (let i = 0; i < files.length; i++) {
        let obj = {
            alt: title + "_" + i,
            src: await toBase64(files[i]),
        };
        if (files[i].type.startsWith("video/")) {
            obj.type = files[i].type;
            img.vid.push(obj);
        } else {
            img.arr.push(obj);
        }
    }
    const res = await post("/post/createGallery", {
        title,
        subtitle: markdownToHtml(subtitle),
        author,
        img,
    });
    res.error === "OK" ? alert("Galerie erfolgreich hochgeladen.") : alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

getElm("gallery_update_submit").click(async (e) => {
    e.preventDefault();

    const title = getElm("gallery_update_title");

    if (title.valIsEmpty()) return alert("Fülle alle Felder aus.");

    const data = { img: [], vid: [] };

    const files = getElm("gallery_update").files;

    if (files.length === 0) return alert("Keine Bilder hochgeladen.");

    for (let i = 0; i < files.length; i++) {
        const obj = {
            alt: title.val() + `_${i}_updated_${Date.now()}`,
            src: await toBase64(files[i]),
        };

        if (files[i].type.startsWith("video/")) {
            obj.type = files[i].type;
            data.vid.push(obj);
        } else {
            data.img.push(obj);
        }
    }

    const res = await post("/post/updateGallery", {
        title: title.val(),
        data,
    });

    res.status === "OK" ? alert("Galerie erfolgreich hochgeladen.") : alert("Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.");
});

getElm("merge_blogs_btn").click(async () => {
    let team = await fetch(ORIGIN + "/chunks/team/getCurrentTeam", {
        method: "GET",
    });

    team = await team.text();

    const res = await post("/post/mergeBlogs", {
        title: getElm("merge_blogs_title").val(),
        description: getElm("merge_blogs_desc").val(),
        base64: await getElm("merge_blogs_basic_img").getImgBase64(),
        alt: getElm("merge_blogs_basic_alt").val(),
        number: Number(getElm("merge_blogs").val()),
        team,
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
        leitsatz: markdownToHtml(leitsatz.val()),
        beschreibung: markdownToHtml(beschreibung.val()),
        base64,
    });

    alert(res.valid ? "Team wurde erstellt" : "Team konnte nicht erstellt werden");
});

getElm("delete_blog_btn").click(async () => {
    const title = getElm("delete_blog");

    if (title.valIsEmpty()) return alert("Bitte gib einen gültigen Titel ein.");

    const res = await post("/post/deleteBlog", { title: title.val() });

    alert(res.valid ? "Blog wurde gelöscht oder existiert nicht." : "Blog konnte nicht gelöscht werden. Bitte versuche es später erneut.");
});

getElm("delete_event_btn").click(async () => {
    const title = getElm("delete_event");

    if (title.valIsEmpty()) return alert("Bitte gib einen gültigen Titel ein.");

    const res = await post("/post/deleteEvent", { title: markdownToHtml(title.val().trim()) });

    if (res.valid && res.found) alert("Event wurde gelöscht.");
    else if (res.valid && !res.found) alert("Event existiert nicht.");
    else alert("Event konnte nicht gelöscht werden. Bitte versuche es später erneut.");
});

pdf.click(() => toggleDivs(pdf, getElm("show_pdf"), getElm("show_img")));
s_btn.click(() => toggleDivs(s_btn, getElm("show_btn_menu"), getElm("show_nothing")));

function toggleDivs(toggler, first, second) {
    first.hide();
    second.hide();
    toggler.checked ? first.show() : second.show();
}

async function admin_sendNews(e) {
    e.preventDefault();

    let picture = "";
    try {
        picture = await toBase64(getElm("news_img_file").file());
    } catch (err) {
        warnLog("No image uploaded");
    }

    let res = await post("/post/submitNews", {
        text: getElm("news_text").val(),
        img: picture,
        img_alt: getElm("news_img_alt").val(),
        img_pos: getElm("news_img_pos").val(),
        btn: getElm("news_btn").checked.toString(),
        btn_text: getElm("news_btn_text").val(),
        btn_link: getElm("news_btn_link").val(),
        pdf: getElm("news_pdf").checked.toString(),
        pdf_src: getElm("news_pdf_src").val(),
    });

    let message;

    res.res === 200 ? (message = "Das hat geklappt. Die News sind jetzt online.") : (message = "Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut");

    alert(message);
}

getElm("team-m-add").click(async () => {
    const username = getElm("team-m-username");
    const job = getElm("team-m-job");
    const motivation = getElm("team-m-motivation");

    if (username.valIsEmpty() || job.valIsEmpty() || motivation.valIsEmpty()) {
        alert("Bitte fülle alle Felder aus");
        return;
    }

    const res = await post("/post/addTeamMember", {
        username: username.val(),
        job: markdownToHtml(job.val()),
        motivation: markdownToHtml(motivation.val()),
    });

    alert(res.valid ? "Erfolgreich hinzugefügt" : "Mitglied konnte nicht hinzugefügt werden");
});

getElm("team-m-remove").click(async () => {
    const username = getElm("team-m-username-remove");

    if (username.valIsEmpty()) {
        alert("Bitte gib einen gültigen Benutzernamen ein");
        return;
    }

    const res = await post("/post/removeTeamMember", { username: username.val() });

    alert(res.valid ? "Erfolgreich entfernt" : "Mitglied konnte nicht entfernt werden");
});

getElm("event_submit").click(async (e) => {
    e.preventDefault();
    const title = getElm("event_title");
    const date = getElm("event_date");

    if (title.valIsEmpty() || date.valIsEmpty()) return alert("Bitte fülle alle Felder aus.");

    const res = await post("/post/addCalendarEvent", {
        title: markdownToHtml(title.val()).trim(),
        date: date.val(),
    });

    alert(res.message);
});

function markdownToHtml(text) {
    return text
        .replace(/\*\*\*([^\*]{1,})\*\*\*/gm, "<b>$1</b>")
        .replace(/\_\_\_([^\_]{1,})\_\_\_/gm, "<i>$1</i>")
        .replace(/\+\+\+([^\+]{1,})\+\+\+/gm, "<u>$1</u>")
        .replace(/\{\[([^\]]+)\]\(([^)]+)\)\}/gm, "<a href='$2' target='_blank'>$1</a>");
}

function HTMLToMarkdown(text) {
    return text
        .replace(/<b>((?:(?!<\/b>).)+)<\/b>/gm, "***$1***")
        .replace(/<i>((?:(?!<\/b>).)+)<\/i>/gm, "___$1___")
        .replace(/<u>((?:(?!<\/b>).)+)<\/u>/gm, "+++$1+++")
        .replace(/<a href='([^']*)' target='_blank'>(.*?)<\/a>/gm, "{[$2]($1)}");
}
