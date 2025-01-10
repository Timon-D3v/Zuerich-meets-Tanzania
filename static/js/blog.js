async function getBlogAuthorImg() {
    const img = getElm("blog_footer_img");
    const name = img.alt.split(" ");

    let url = "/post/getAuthorPicture?name=" + name[0] + "&family_name=" + name[1];

    name.slice(2).forEach((elm) => {
        url += " " + elm;
    });

    const { picture } = await post(url);
    img.src = picture;
}
getBlogAuthorImg();

const editThisBlog = createElm("a");
editThisBlog._text("Bearbeiten");
editThisBlog.href = window.location.href.replace(/\/blog/, "/private/blog");
getQuery(".f-l-social").get(0).append(editThisBlog);
