consentEvent = new Event("cookie_consent_updated");

/**
 * Accepts the cookie consent by setting the appropriate values in localStorage.
 * This method should only be called in a browser environment.
 *
 * - Sets "cookie_consent" to "true" in localStorage.
 * - Sets "cookie_consent_mode" in localStorage with the following granted permissions:
 *   - ad_storage
 *   - analytics_storage
 *   - functionality_storage
 *   - personalization_storage
 *   - security_storage
 *
 * Finally, dispatches a consent event to notify other parts of the application.
 *
 * @returns {void}
 */
function acceptCookies() {
    localStorage.setItem("cookie_consent", "true");
    localStorage.setItem(
        "cookie_consent_mode",
        JSON.stringify({
            ad_storage: "granted",
            analytics_storage: "granted",
            functionality_storage: "granted",
            personalization_storage: "granted",
            security_storage: "granted",
        }),
    );
    document.dispatchEvent(consentEvent);
}

/**
 * Rejects cookies by setting the appropriate values in localStorage.
 *
 * This method performs the following actions:
 * - Checks if the code is running in a browser environment.
 * - Sets the "cookie_consent" item in localStorage to "false".
 * - Sets the "cookie_consent_mode" item in localStorage with a JSON string
 *   that denies ad, analytics, and personalization storage, but grants
 *   functionality and security storage.
 * - Dispatches a consent event to notify other parts of the application.
 *
 * @returns {void}
 */
function rejectCookies() {
    localStorage.setItem("cookie_consent", "false");
    localStorage.setItem(
        "cookie_consent_mode",
        JSON.stringify({
            ad_storage: "denied",
            analytics_storage: "denied",
            personalization_storage: "denied",
            functionality_storage: "granted",
            security_storage: "granted",
        }),
    );
    document.dispatchEvent(this.consentEvent);
}

/**
 * Checks if the user has accepted cookies.
 *
 * @returns {boolean} Returns `true` if the user has accepted cookies, otherwise `false`.
 *                      If the platform is not a browser, it returns `false`.
 */
function hasAcceptedCookies() {
    return localStorage.getItem("cookie_consent") === "true";
}

/**
 * Checks if the user has rejected cookies.
 *
 * @returns {boolean} Returns `true` if the user has rejected cookies, otherwise `false`.
 */
function hasRejectedCookies() {
    return localStorage.getItem("cookie_consent") === "false";
}

/**
 * Initializes the cookie consent settings for the application.
 *
 * This method checks if the platform is a browser and if the user has already accepted cookies.
 * If the user has not accepted cookies, it sets the default cookie consent mode in localStorage.
 *
 * The default consent mode denies storage for ads, analytics, and personalization,
 * while granting storage for functionality and security.
 *
 * @returns {void}
 */
function initCookies() {
    if (hasAcceptedCookies() || hasRejectedCookies()) return;

    getElm("cookie-notification").removeClass("invisible");

    localStorage.setItem(
        "cookie_consent_mode",
        JSON.stringify({
            ad_storage: "denied",
            analytics_storage: "denied",
            personalization_storage: "denied",
            functionality_storage: "granted",
            security_storage: "granted",
        }),
    );
}

addEventListener("DOMContentLoaded", () => {
    initCookies();

    getElm("cookie-accept").click(() => {
        acceptCookies();
        getElm("cookie-notification").addClass("invisible");
    });

    getElm("cookie-close").click(() => {
        rejectCookies();
        getElm("cookie-notification").addClass("invisible");
    });
});
