getElm("contact-form").on("submit", async e => {
    e.preventDefault();
    
    const result = await post("/post/sendMail", {
        message: getElm("contact-message").val(),
        author_name: getElm("contact-name").val(),
        author_family_name: getElm("contact-family-name").val(),
        author_email: getElm("contact-email").val()
    });

    if (result.status === 500) return errorField(result.res);

    successField(result.res);
    getElm("contact-submit").disabled = true;
});

const contactImg = getQuery(".bg").get(0);

root.data("data-theme") === "dark" ?
contactImg.src = "/img/stock/nightsky.jpg" :
contactImg.src = "/img/stock/sky.jpg";

root.on("change", () => {
    console.log("changed")
    root.data("data-theme") === "dark" ?
    contactImg.src = "/img/stock/nightsky.jpg" :
    contactImg.src = "/img/stock/sky.jpg";
});