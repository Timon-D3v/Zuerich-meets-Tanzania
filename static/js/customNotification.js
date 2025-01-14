const notificationModes = {
    neutral: {
        iconSrc: "/img/svg/notification/neutral.svg",
        iconAlt: "Neutrale Benachrichtigung Icon",
    },
    success: {
        iconSrc: "/img/svg/notification/success.svg",
        iconAlt: "Erfolgreiche Benachrichtigung Icon",
    },
    error: {
        iconSrc: "/img/svg/notification/error.svg",
        iconAlt: "Fehlerhafte Benachrichtigung Icon",
    },
    warn: {
        iconSrc: "/img/svg/notification/warn.svg",
        iconAlt: "Warnende Benachrichtigung Icon",
    },
    info: {
        iconSrc: "/img/svg/notification/info.svg",
        iconAlt: "Informative Benachrichtigung Icon",
    },
};

const notificationWrapper = getElm("notifications-wrapper");
const notificationTemplate = getElm("notification-template");

/**
 * Displays an error notification with a custom message and title.
 *
 * @param {string} message - The message to be displayed in the notification.
 * @param {string} [title="Ein Fehler ist aufgetreten!"] - The title of the notification. Defaults to "Ein Fehler ist aufgetreten!".
 * @param {number} [duration=5000] - The duration the notification should be displayed in milliseconds. Defaults to 5000ms.
 *
 * @returns {void}
 */
function errorNotification(message, title = "Ein Fehler ist aufgetreten!", duration = 5000) {
    customNotification("error", title, message, duration);
}

/**
 * Displays a success notification with a custom message and title.
 *
 * @param {string} message - The message to be displayed in the notification.
 * @param {string} [title="Das hat geklappt."] - The title of the notification. Defaults to "Das hat geklappt.".
 * @param {number} [duration=5000] - The duration the notification should be displayed in milliseconds. Defaults to 5000ms.
 *
 * @returns {void}
 */
function successNotification(message, title = "Das hat geklappt.", duration = 5000) {
    customNotification("success", title, message, duration);
}

/**
 * Displays a warning notification with a custom message and title.
 *
 * @param {string} message - The message to be displayed in the notification.
 * @param {string} [title="Achtung!"] - The title of the notification. Defaults to "Achtung!".
 * @param {number} [duration=5000] - The duration the notification should be displayed in milliseconds. Defaults to 5000ms.
 *
 * @returns {void}
 */
function warnNotification(message, title = "Achtung!", duration = 5000) {
    customNotification("warn", title, message, duration);
}

/**
 * Displays a neutral notification with a custom message and title.
 *
 * @param {string} message - The message to be displayed in the notification.
 * @param {string} [title="Änderung:"] - The title of the notification. Defaults to "Änderung:".
 * @param {number} [duration=5000] - The duration the notification should be displayed in milliseconds. Defaults to 5000ms.
 *
 * @returns {void}
 */
function neutralNotification(message, title = "Änderung:", duration = 5000) {
    customNotification("neutral", title, message, duration);
}

/**
 * Displays an informational notification with a custom message and title.
 *
 * @param {string} message - The message to be displayed in the notification.
 * @param {string} [title="Information:"] - The title of the notification. Defaults to "Information:".
 * @param {number} [duration=5000] - The duration the notification should be displayed in milliseconds. Defaults to 5000ms.
 *
 * @returns {void}
 */
function infoNotification(message, title = "Information:", duration = 5000) {
    customNotification("info", title, message, duration);
}

/**
 * Displays a custom notification on the screen.
 *
 * @param {string} type - The type of notification (e.g., 'success', 'error', 'info').
 * @param {string} title - The title of the notification.
 * @param {string} message - The message content of the notification.
 * @param {number} duration - The duration (in milliseconds) for which the notification should be displayed.
 * @param {boolean} [closable=true] - Whether the notification can be closed manually by the user.
 *
 * @returns {void}
 */
function customNotification(type, title, message, duration, closable = true) {
    const clone = notificationTemplate.content.cloneNode(true);
    const id = "notification-" + randomString(19);

    const wrapper = clone.querySelector(".notification-wrapper");
    const img = clone.querySelector(".notification-img");

    wrapper.classList.add(type, id);

    if (closable) wrapper.classList.add("notification-closable");

    img.src = notificationModes[type].iconSrc;
    img.alt = notificationModes[type].iconAlt;

    clone.querySelector(".notification-title").innerText = title;
    clone.querySelector(".notification-text").innerText = message;
    clone.querySelector(".notification-svg").classList.add(type);

    clone.querySelector(".notification-close").addEventListener("click", () => closeNotification(id));

    notificationWrapper.append(clone);

    setTimeout(() => closeNotification(id), duration);
}

/**
 * Closes and removes a notification element from the DOM.
 *
 * @param {string} id - The unique identifier of the notification to be closed.
 *
 * @returns {void}
 */
function closeNotification(id) {
    document.querySelector(`.notification-wrapper.${id}`).remove();
}
