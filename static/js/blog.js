async function getBlogAuthorImg () {
    const img = getElm("blog_footer_img");
    const name = img.alt.split(" ");

    let url = "/post/getAuthorPicture?name=" + name[0] + "&family_name=" + name[1];

    name.slice(2).forEach(elm => {
        url += " " + elm;
    });

    const { picture } = await post(url);
    img.src = picture;
}
getBlogAuthorImg();