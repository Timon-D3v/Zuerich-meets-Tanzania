var open_navigation = new Event("open-navigation");

const root = getQuery(":root").get(0);
const menu = getElm("menu");
const navDesktopLinks = [getElm("h-n-b-e-1"), getElm("h-n-b-e-2"), getElm("h-n-b-e-3"), getElm("h-n-b-e-4"), getElm("h-n-b-e-5")];
const navDesktopElements = [getQuery(".n-foldable1").get(0), getQuery(".n-foldable2").get(0), getQuery(".n-foldable3").get(0), getQuery(".n-foldable4").get(0), getQuery(".n-foldable5").get(0)];
const darkmodeButton1 = getElm("darkmode2");
const darkmodeButton2 = getElm("darkmode3");
const newsletterMen = getElm("newsletter-anrede-herr");
const newsletterWoman = getElm("newsletter-anrede-frau");
const logouts = getQuery(".logout");

let currentBlogCount = 5;
let currentGalleryCount = 5;

menu.click(() => {
    menu.toggleClass("is-active");
    document.dispatchEvent(open_navigation);
});

on(document, "open-navigation", () => {
    menu.hasClass("is-active") ? openNav() : closeNav();
});

getQuery(".n-t-summary").forEach((elm, i) => {
    elm.click(() => getQuery(".n-t-details").get(i).toggleClass("open"));
});

getQuery("img").on("dragstart", () => {
    return false;
});

newsletterMen.click(() => {
    if (newsletterWoman.checked) newsletterWoman.checked = false;
});

newsletterWoman.click(() => {
    if (newsletterMen.checked) newsletterMen.checked = false;
});

navDesktopLinks.forEach((elm, i) => {
    gsap.set(navDesktopElements[i], { x: "-50%" });
    elm.click((e) => {
        e.preventDefault();

        navCloseOthers(i);

        elm.toggleClass("active");

        navDesktopElements[i].toggleClass("active");

        navDesktopElements[i].hasClass("active") ? gsap.to(navDesktopElements[i], navGsap("-50%", "100%")) : gsap.to(navDesktopElements[i], navGsap("-50%", 0));

        navDesktopElements[i].hasClass("active") ? getQuery("main *").click(closeNavWithMainDesktop) : getQuery("main *").off("click", closeNavWithMainDesktop);
    });
});

logouts.click(async (e) => {
    e.preventDefault();
    const res = await post("/logout");
    res.status === 200 ? window.location.reload() : errorNotification("Das Ausloggen hat nicht geklappt...");
});

function changeTheme() {
    if (root.data("data-theme") === "dark") {
        root.data("data-theme", "light");
        sessionStorage.setItem("theme", "light");
        darkmodeButton1.data("data-tooltip-content", "Lightmode");
        darkmodeButton2.data("data-tooltip-content", "Lightmode");
    } else {
        root.data("data-theme", "dark");
        sessionStorage.setItem("theme", "dark");
        darkmodeButton1.data("data-tooltip-content", "Darkmode");
        darkmodeButton2.data("data-tooltip-content", "Darkmode");
    }
}

function setTheme() {
    getElm("darkmode").click();
}

function openNav() {
    gsap.to("#nav_mobile", navGsap(0, "100%"));
    gsap.to("#nav_tab", navGsap("-100%", 0));
    gsap.set("main", { filter: "brightness(100%)" });
    gsap.to("main", { filter: "brightness(75%)", duration: 0.5, ease: "power2.inOut" });
    getQuery("main *").click(closeNavWithMain);
}

function closeNav() {
    gsap.to("#nav_mobile", navGsap(0, 0));
    gsap.to("#nav_tab", navGsap(0, 0));
    gsap.to("main", { filter: "brightness(100%)", duration: 0.5, ease: "power2.inOut" });
    getQuery("main *").off("click", closeNavWithMain);
}

function closeNavWithMain(e) {
    e.preventDefault();
    menu.click();
}

function closeNavWithMainDesktop(e) {
    e.preventDefault();
    navCloseOthers();
    getQuery("main *").click(closeNavWithMainDesktop);
}

function navGsap(x, y) {
    return { x: x, y: y, duration: 0.5, ease: "power2.inOut" };
}

function navCloseOthers(i = -1) {
    navDesktopElements.forEach((elm, j) => {
        if (j != i && elm.hasClass("active")) {
            elm.toggleClass("active");
            navDesktopLinks[j].toggleClass("active");
            gsap.to(elm, navGsap("-50%", 0));
        }
    });
}

function setCssVariables() {
    getElm("nav_desktop").css({
        "--nav_desktop_margin": getQuery(".logo").get(0).x() + "px",
        "--h_d_l_1": getElm("h-n-b-e-1").x() + "px",
        "--h_d_l_2": getElm("h-n-b-e-2").x() + "px",
        "--h_d_l_3": getElm("h-n-b-e-3").x() + "px",
        "--h_d_l_4": getElm("h-n-b-e-4").x() + "px",
        "--h_d_l_5": getElm("h-n-b-e-5").x() + "px",
    });
}

function validateNewsletterForm() {
    const genderMen = getElm("newsletter-anrede-herr");
    const genderWoman = getElm("newsletter-anrede-frau");
    const firstName = getElm("newsletter-vorname");
    const lastName = getElm("newsletter-nachname");
    const email = getElm("newsletter-email");

    if (firstName.valIsEmpty()) return { err: 1 };
    if (lastName.valIsEmpty()) return { err: 2 };
    if (email.valIsEmpty()) return { err: 3 };

    const data = {
        gender: "Divers",
        firstName: firstName.val(),
        lastName: lastName.val(),
        email: email.val(),
    };

    if (genderMen.checked) data.gender = "Herr";
    if (genderWoman.checked) data.gender = "Frau";

    return {
        err: 0,
        data,
    };
}

function newsletterSignUp(e) {
    e.preventDefault();

    const response = validateNewsletterForm();

    if (response.err === 0) return sendNewsletter(response.data);

    errorNotification(["Du musst deinen Vornamen angeben.", "Du musst deinen Nachnamen angeben.", "Du musst deine E-Mail angeben."][response.err - 1]);
}

function toBase64Max1MB(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = createElm("canvas");
                const ctx = canvas.getContext("2d");
                let width = img.width;
                let height = img.height;
                const maxSize = 1048576;
                if (file.size > maxSize) {
                    const scaleFactor = Math.min(1, maxSize / file.size);
                    width *= scaleFactor;
                    height *= scaleFactor;
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const resizedImage = canvas.toDataURL("image/jpeg", 0.75);
                resolve(resizedImage);
            };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function toRealDate(date) {
    return toDateString(date);
}

function nofunction() {}

async function sendNewsletter(data) {
    const result = await post("/post/newsletter/signUp", data).catch(() => errorNotification("Es ist ein unerwarteter Fehler aufgetreten, bitte versuche es in einigen Sekunden erneut..."));

    if (result.status === "Du bist schon angemeldet.") return infoNotification(result.status);

    if (result.status !== "Alles in Ordnung") return errorNotification(result.status);

    successNotification("Du hast dich erfolgreich für den Newsletter angemeldet. Bitte bestätige deine Anmeldung in deinem E-Mail Postfach.");
}

function initTheme() {
    if (sessionStorage.getItem("theme") === null) {
        sessionStorage.setItem("theme", "light");
    } else if (sessionStorage.getItem("theme") === "dark") {
        setTheme();
    }
}

async function getBlogTitle(number) {
    const result = await post("/post/blog/getLinks/" + number);

    const elements = [getQuery(".n-t li .n-t-details ul").get(2), getQuery(".n-m li .n-t-details ul").get(2), getQuery(".n-foldable3 ul").get(0)];

    elements.forEach((container) => {
        container.html("");

        result.title.forEach((elm) => {
            const a = createElm("a");
            const li = createElm("li");
            a.href = ORIGIN + "/blog/" + elm.title;
            a._text(elm.title);
            li.append(a);
            container.append(li);
        });

        if (result.title.length === number) {
            const a = createElm("a");
            const li = createElm("li");
            a.href = "#";
            a._text("Weitere");
            a.click((e) => {
                e.preventDefault();
                currentBlogCount += 5;
                getBlogTitle(currentBlogCount);
            });
            li.append(a);
            container.append(li);
        }
    });
}
getBlogTitle(currentBlogCount);

async function getGalleryTitle(number) {
    const result = await post("/post/gallery/getLinks/" + number);

    const elements = [getQuery(".n-t li .n-t-details ul").get(3), getQuery(".n-m li .n-t-details ul").get(3), getQuery(".n-foldable4 ul").get(0)];

    elements.forEach((container) => {
        container.html("");

        result.title.forEach((elm) => {
            const a = createElm("a");
            const li = createElm("li");
            a.href = ORIGIN + "/gallery/" + elm.title;
            a._text(elm.title);
            li.append(a);
            container.append(li);
        });

        if (result.title.length === number) {
            const a = createElm("a");
            const li = createElm("li");
            a.href = "#";
            a._text("Weitere");
            a.click((e) => {
                e.preventDefault();
                currentGalleryCount += 5;
                getBlogTitle(currentGalleryCount);
            });
            li.append(a);
            container.append(li);
        }
    });
}
getGalleryTitle(currentGalleryCount);

getElm("darkmode").click(changeTheme);
getElm("newsletter-submit").click(newsletterSignUp);
ready(setCssVariables);
on(window, "resize", setCssVariables);
[darkmodeButton1, darkmodeButton2].forEach((e) => e.click(setTheme));

initTheme();
timonjs_message();

var i = setInterval(setCssVariables, 1000);

if (!ORIGIN.includes("://www.")) window.location.replace(ORIGIN.replace("://", "://www."));
