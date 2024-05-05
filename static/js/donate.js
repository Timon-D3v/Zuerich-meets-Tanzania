const donate_btn = $("#donate_btn"),
    donate_once = $(".donate-onetime"),
    donate_member = $(".donate-membership"),
    donate_switch_onetime = $("#donate_switch_onetime"),
    donate_switch_member = $("#donate_switch_member"),
    donate_selections = getQuery(".donate-amount"),
    donate_custom = getElm("donate_custom");

donate_switch_member.click(donate_toggleForms);
donate_switch_onetime.click(donate_toggleForms);

donate_selections.click(e => {
    donate_selections.forEach(elm => elm.classList.remove("active"));
    e.target.classList.toggle("active");
});

donate_custom.on("input", () => {
    if (donate_custom.value === "") return;
    donate_selections.forEach(elm => elm.classList.remove("active"));
    donate_selections[3].classList.add("active");
});

donate_btn.click(async () => {
    const data = {
        type: donate_switch_member.hasClass("active") ?
            "membership" : "onetime",
        amount: donate_switch_member.hasClass("active") ?
            20 : donate_getAmount()
    };
    if (isNaN(data.amount)) return;
    let res = await post("/post/getPaymentLink", data);
    if (typeof res.link === "string") return window.location.href = res.link;
    return alert("Etwas hat nicht geklappt...");
});

function donate_toggleForms () {
    [
        donate_once,
        donate_member,
        donate_switch_onetime, 
        donate_switch_member
    ].forEach(elm => elm.toggleClass("active"));

    if (donate_once.hasClass("active")) donate_btn.html("Jetzt spenden");
    else donate_btn.html("Mitglied werden");
};

function donate_getAmount () {
    let value = undefined;
    donate_selections.forEach(elm => {
        if (elm.classList.contains("active")) value = elm.querySelector("input").value;
    });
    if (typeof value === "number") return value;
    value = Number(value);
    return value;
};

function membership_click () {
    donate_switch_member.click();
};