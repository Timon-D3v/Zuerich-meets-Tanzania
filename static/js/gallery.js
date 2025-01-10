const showroom = getQuery(".gallery-show");
const cinema = getQuery(".gallery-cinema");
const showroom_img = getQuery(".gallery-big").get(0);
const showroom_vid = getQuery(".gallery-big-vid").get(0);

let close_showroom = true;
let close_cinema = true;
let gallery_current = getElm("gallery_0");
let cinema_current = getElm("galleryvid_0");

getQuery(".gallery-container").click((e) => {
    showroom.show();

    const { alt, src } = e.currentTarget.getQuery(".gallery-img").get(0);

    showroom_img.alt = alt;
    showroom_img.src = src.replace("?tr=w-200,h-200", "").replace(`?tr=w-${window.innerWidth}`, "");
});

getQuery(".gallery-next").click(() => moveGallery(1));
getQuery(".gallery-prev").click(() => moveGallery(-1));

getQuery(".gallery-container-vid").click((e) => {
    cinema.show();
    showroom_vid.src = e.currentTarget.getQuery(".gallery-vid").get(0).src;
});

getQuery(".gallery-next-vid").click(() => moveCinema(1));
getQuery(".gallery-prev-vid").click(() => moveCinema(-1));

showroom.click(() => {
    if (close_showroom) showroom.hide();
});

cinema.click(() => {
    if (close_cinema) cinema.hide();
});

addEventListener("DOMContentLoaded", () => {
    getQuery(".gallery")
        .get(0)
        .getQuery(".gallery-img")
        .forEach((elm) => {
            let img = new Image();
            img.src = elm.src.replace("?tr=w-200,h-200", `?tr=w-${window.innerWidth}`);
            img.onload = () => (elm.src = img.src);
        });
});

function moveGallery(direction) {
    close_showroom = false;

    let id = gallery_current.id.split("_");
    id[0] += "_";
    id[1] = +id[1] + 1 * direction;

    if (id[1] < 0) id[1] = getQuery(".gallery-img").length - 1;
    if (id[1] === getQuery(".gallery-img").length) id[1] = 0;

    gallery_current = getElm(id[0] + id[1]);

    const { alt, src } = gallery_current.getQuery(".gallery-img").get(0);

    showroom_img.alt = alt;
    showroom_img.src = src.replace("?tr=w-200,h-200", "").replace(`?tr=w-${window.innerWidth}`, "");

    setTimeout(() => (close_showroom = true), 100);
}

function moveCinema(direction) {
    close_cinema = false;

    const id = cinema_current.id.split("_");

    id[0] += "_";
    id[1] = +id[1] + 1 * direction;

    if (id[1] < 0) id[1] = getQuery(".gallery-vid").length - 1;
    if (id[1] === getQuery(".gallery-vid").length) id[1] = 0;

    cinema_current = getElm(id[0] + id[1]);

    showroom_vid.src = cinema_current.getQuery(".gallery-vid").get(0).src;

    setTimeout(() => (close_cinema = true), 100);
}
