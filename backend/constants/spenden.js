/*
 *
 * * Bearbeiten
 * Diese Datei darf nur von Vorstandsmitgliedern des Vereins Zurich meets Tanzania verändert werden.
 *
 * * Wegleitung zum Bearbeiten
 * Grundsätzlich können alle Daten ganz normal ersetzt oder ausgetauscht werden.
 * "bild" ist der Link zu einem Bild und "alt" ist eine kurze Beschreibung des Bilds.
 * "datum" sollte immer das Datum der Bearbeitung haben.
 * Es gibt allerdings einige Ausnahmen:
 * - Die Zeichen < und > müssen als &lt; und &gt; geschrieben werden.
 * - Es dürfen keine Absätze gemacht werden, falls der Text trotzdem welche braucht kann dafür ein <br> verwendet werden.
 * - Wenn ein Gänsefüsschen benutzt werden möchte muss davor ein \ kommen, also: \"
 * - Falls ein \ benutzt werden möchte, müssen zwei davon geschrieben werden, also: \\
 *
 * ! Die Änderungen sind erst nach einem Neustart des Servers live
 *
 *
 */
const DONATE = {
    datum: "Fri Apr 19 2024 19:53:02 GMT+0200 (Mitteleuropäische Sommerzeit)",
    titel: "Ihre Unterstützung zählt",
    bild: "/img/common/donate.jpg",
    alt: "Ein armes Kind, welches Ihre Hilfe braucht!",
    ZAHLUNG: {
        link50: "https://donate.stripe.com/4gw8xxefY8x78pycMM",
        link80: "https://donate.stripe.com/28o5llfk28x749i6or",
        link120: "https://donate.stripe.com/5kA4hh5Js6oZ7ludQR",
        linkX: "https://donate.stripe.com/00g8xx7RA4gR8py3ce",
        member: "https://buy.stripe.com/eVabJJ7RA7t35dmfZ2",
        dev: {
            link50: "https://buy.stripe.com/test_bIY02kcJU02ggKI4gm",
            link80: "https://donate.stripe.com/test_7sI8yQfW6bKY9igcMT",
            link120: "https://donate.stripe.com/test_3cs5mE39k2ao0LKcMU",
            linkX: "https://donate.stripe.com/test_9AQaGY11c02geCA5kt",
            member: "https://buy.stripe.com/test_7sI4iA5hsg1e3XW7sx",
        },
    },
};

export default DONATE;
