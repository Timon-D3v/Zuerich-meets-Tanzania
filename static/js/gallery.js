const showroom = $(".gallery-show"),
    cinema = $(".gallery-cinema"),
    showroom_img = $(".gallery-big"),
    showroom_vid = $(".gallery-big-vid"),
    gallery_next = $(".gallery-next"),
    gallery_prev = $(".gallery-prev"),
    gallery_next_vid = $(".gallery-next-vid"),
    gallery_prev_vid = $(".gallery-prev-vid");

var close_showroom = true,
    gallery_current = document.getElementById("gallery_0"),
    close_cinema = true,
    cinema_current = document.getElementById("galleryvid_0");

$(".gallery-container").click(e => {
    showroom.show();
    let {alt, src} = e.currentTarget.querySelector(".gallery-img");
    showroom_img.attr({
        alt,
        src: src.replace("?tr=w-200,h-200", "")
    });
    gallery_next.off("click");
    gallery_prev.off("click");
    gallery_next.click(() => moveGallery(1));
    gallery_prev.click(() => moveGallery(-1));
});

$(".gallery-container-vid").click(e => {
    cinema.show();
    let {alt, src} = e.currentTarget.querySelector(".gallery-vid");
    showroom_vid.attr({
        alt,
        src
    });
    gallery_next_vid.off("click");
    gallery_prev_vid.off("click");
    gallery_next_vid.click(() => moveCinema(1));
    gallery_prev_vid.click(() => moveCinema(-1));
});

showroom.click(e => {
    if (close_showroom) showroom.hide();
});

cinema.click(e => {
    if (close_cinema) cinema.hide();
});

function moveGallery (direction) {
    close_showroom = false;
    let id = gallery_current.id.split("_");
    id[0] += "_";
    id[1] = +id[1] + 1 * direction;
    if (id[1] < 0) id[1] = $(".gallery-img").length - 1;
    if (id[1] === $(".gallery-img").length) id[1] = 0;
    gallery_current = document.getElementById(id[0] + id[1].toString());
    let {alt, src} = gallery_current.querySelector(".gallery-img");
    showroom_img.attr({
        alt,
        src: src.replace("?tr=w-200,h-200", "")
    });
    setTimeout(() => close_showroom = true, 100);
};

function moveCinema (direction) {
    close_cinema = false;
    let id = cinema_current.id.split("_");
    id[0] += "_";
    id[1] = +id[1] + 1 * direction;
    if (id[1] < 0) id[1] = $(".gallery-vid").length - 1;
    if (id[1] === $(".gallery-vid").length) id[1] = 0;
    cinema_current = document.getElementById(id[0] + id[1].toString());
    let {alt, src} = cinema_current.querySelector(".gallery-vid");
    showroom_vid.attr({
        alt,
        src
    });
    setTimeout(() => close_cinema = true, 100);
};