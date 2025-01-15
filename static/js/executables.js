addEventListener("DOMContentLoaded", () => {
    const executables = {
        paymentMember: () => successNotification("Die Zahlung war erfolgreich. Danke, dass du ein Mitglied von Zurich meets Tanzania bist!"),
        dataSuccessfulUpdated: () => successNotification("Daten erfolgreich aktualisiert"),
        passwordSuccessfulReset: () => neutralNotification("Passwort erfolgreich zurückgesetzt."),
        alreadyMember: () => infoNotification("Du bist schon ein Mitglied"),
        profileMembership: () => getElm("profile_dashboard_btn3").click(),
        toggleDonateForm: () => donate_toggleForms(),
        toggleLoginForm: () => toggleForms(),
        error: () => {
            const param = new URLSearchParams(window.location.search);

            if (param.has("message")) {
                errorNotification(param.get("message"));
            } else {
                errorNotification("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
            }
        },
    };

    const executablesURLParams = new URLSearchParams(window.location.search);
    if (executablesURLParams.has("exec")) {
        const exec = executablesURLParams.get("exec");
        if (executables.hasOwnProperty(exec)) {
            executables[exec]();
        }
    }
});