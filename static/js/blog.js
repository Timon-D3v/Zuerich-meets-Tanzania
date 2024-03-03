const picture = $("#blog_footer_img");

async function getBlogAuthorImg () {
    let name = picture.attr("alt").split(" ");
    let url = window.location.origin + "/post/getAuthorPicture?name=" 
        + name[0] + "&family_name=" + name[1];
    name.slice(2).forEach(elm => {
        url += " " + elm;
    });
    let res = await fetch(url, {
        method: "POST",
		headers: {"Content-Type": "application/json"},
        mode: "cors",
        cache: "default"
    });
    res = await res.json();
    picture.attr("src", res.picture);
};
getBlogAuthorImg();