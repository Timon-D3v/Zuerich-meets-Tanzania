let calendarCount = 5;
const calendarHandler = async (e) => {
    e.preventDefault();
    const calendar = getQuery(".calendar").get(0);
    const countBefore = calendar.children.length;
    calendarCount += 5;
    const result = await fetch(ORIGIN + `/getEvents/${calendarCount}`, {
        method: "GET",
    });
    const data = await result.text();
    calendar.html(data);
    if (countBefore === calendar.children.length) getQuery(".calendar-more").get(0).remove();
    else getQuery(".calendar-more").click(calendarHandler);
};

getQuery(".calendar-more").click(calendarHandler);
