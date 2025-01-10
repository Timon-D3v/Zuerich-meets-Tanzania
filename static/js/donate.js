const donate_btn = getElm("donate_btn"),
    donate_once = getQuery(".donate-onetime").get(0),
    donate_member = getQuery(".donate-membership").get(0),
    donate_switch_onetime = getElm("donate_switch_onetime"),
    donate_switch_member = getElm("donate_switch_member"),
    donate_selections = getQuery(".donate-amount"),
    donate_custom = getElm("donate_custom"),
    donate_qr_link = getElm("donate_btn_iban");

donate_switch_member.click(donate_toggleForms);
donate_switch_onetime.click(donate_toggleForms);

donate_selections.click((e) => {
    donate_selections.forEach((elm) => elm.removeClass("active"));
    e.target.classList.toggle("active");
});

donate_custom.on("input", () => {
    if (donate_custom.value === "") return;
    donate_selections.forEach((elm) => elm.removeClass("active"));
    donate_selections[3].addClass("active");
});

donate_btn.click(async () => {
    const data = donate_switch_member.hasClass("active")
        ? {
              type: "membership",
              amount: -1,
          }
        : {
              type: "onetime",
              amount: donate_getAmount(),
          };

    if (isNaN(data.amount)) return;

    const { link } = await post("/post/getPaymentLink", data);

    if (typeof link === "string") return (window.location.href = link);

    return errorField("Etwas hat nicht geklappt...");
});

donate_qr_link.click(() => window.open(donate_qr_link.data("data-redir"), "_blank"));

function donate_toggleForms() {
    [donate_once, donate_member, donate_switch_onetime, donate_switch_member].forEach((elm) => elm.toggleClass("active"));

    if (donate_once.hasClass("active")) {
        donate_btn.toggleClass("secondary");
        donate_btn.text("Online Spenden");

        donate_qr_link.toggleClass("secondary");
        donate_qr_link.text("Jetzt Spenden");
        donate_qr_link.data("data-redir", "https://ik.imagekit.io/zmt/pdf/Rechnung%20Spendenkonto.pdf");
    } else {
        donate_btn.toggleClass("secondary");
        donate_btn.text("Mitglied werden");

        donate_qr_link.toggleClass("secondary");
        donate_qr_link.text("Mitglied werden (IBAN)");
        donate_qr_link.data("data-redir", "https://ik.imagekit.io/zmt/pdf/Rechnung%20Mitgliederkonto.pdf");
    }
}

function donate_getAmount() {
    let value;
    donate_selections.forEach((elm) => {
        if (elm.classList.contains("active")) value = elm.querySelector("input").value;
    });
    if (typeof value === "number") return value;
    value = Number(value);
    return value;
}

function membership_click() {
    donate_switch_member.click();
}
