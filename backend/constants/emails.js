/*
 *
 * * Bearbeiten
 * Diese Datei darf nur von Vorstandsmitgliedern des Vereins Zurich meets Tanzania verändert werden.
 * 
 * * Wegleitung zum Bearbeiten
 * Diese Datei sollte nur von einer Person bearbeitet werden, die sich mit HTML auskennt und weiss, wo man Text ersetzten darf und wo nicht.
 * Abgesehen vom HTML kann man aber alles bearbeiten.
 * 
 * 
 * * Für HTML-Kenner
 * In der Anschrift (auch HTML) sind ___ANREDE___ und die Anderen Variablen und werden mit .replace() ersetzt.
 * Inline CSS ist erforderlich: Es sind keine <link> oder <style> Elemente erlaubt in einer E-Mail.
 * Einige CSS Optionen sind ebenfalls verboten. Dazu zählen alle Flexbox attribute, deswegen sind die Sachen auch so kompliziert mit <table> zentriert.
 * 
 * ! Die Änderungen sind erst nach einem Neustart des Servers live
 * 
 * 
*/
const EMAILS = {
    sender_email: "info@timondev.com",
    sender_name: "Zurich meets Tanzania",
    anschrift: "___ANREDE___ ___GENDER___ ___NACHNAME___",
    anschrift_html: `<p style="font-size: 18px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; display: block; margin-block-start: 0; margin-block-end: 0; margin-inline-start: 0; margin-inline-end: 0; margin: 1em 0; word-wrap: normal; word-break: keep-all; hyphens: auto; -webkit-hyphens: auto;">
                    ___ANREDE___ ___GENDER___ ___NACHNAME___</p>`,
    grüsse_text: "\n\nMit freundlichen Grüssen\nZurich meets Tanzania",
    grüsse_html: `<p style="font-size: 18px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; display: block; margin-block-start: 0; margin-block-end: 0; margin-inline-start: 0; margin-inline-end: 0; margin: 1em 0; word-wrap: normal; word-break: keep-all; hyphens: auto; -webkit-hyphens: auto;">
                Mit freundlichen Grüssen<br><strong style="font-size: 18px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; font-weight: bold;">Zurich meets Tanzania</strong></p>`,
    header: `<div style="display: block; overflow-x: auto;">
            <table align="center" style="width: 100%; background-color: #fff5e5;">
                <td style="display: block; min-height: 100px; margin-bottom: 20px;">
                    <table align="right">
                        <tbody>
                            <tr>
                                <td>
                                    <a style="text-decoration: none; cursor: pointer; height: 100px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" href="https://zurich-meets-tanzania.com">
                                        <img style="height: 90px; padding: 5px; margin: 0 5px;" alt="Banner" src="https://ik.imagekit.io/zmt/email%20files/logo.png?updatedAt=1714585233271">
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
                <td style="width: 100%; display: block;">
                    <table align="center" style="background-color: #fff5e5;">
                        <tbody>
                            <tr>
                                <td>
                                    <div style="display: block; max-width: 640px; min-width: 250px; background-color: #ffebcc; padding: 25px;">`,
    footer: `                       </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                    <td style="display: block; width: 100%; min-height: 50px; padding-top: 20px;">
                        <table align="center">
                            <tbody>
                                <tr>
                                    <td>
                                        <a style="font-size: 20px; margin-right: 20px; line-height: 1.5; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; cursor: pointer; text-decoration: underline;" href="https://zurich-meets-tanzania.com/#scroll_to_news">Aktuelles</a>
                                    </td>
                                    <td>
                                        <a style="font-size: 20px; margin-right: 20px; line-height: 1.5; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; cursor: pointer; text-decoration: underline;" href="https://zurich-meets-tanzania.com">Homepage</a>
                                    </td>
                                    <td>
                                        <a style="font-size: 20px; line-height: 1.5; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; cursor: pointer; text-decoration: underline;" href="https://timondev.com">Programmiert</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table align="center" style="padding: 20px 0;">
                            <tbody>
                                <tr>
                                    <td>
                                        <a style="display: block; height: 30px; width: 30px; cursor: pointer; text-decoration: none; margin-right: 20px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" href="https://www.facebook.com/profile.php?id=100064463715451">
                                            <img style="height: 30px; width: 30px; overflow: clip; overflow-clip-margin: content-box;" alt="Facebook Link" src="https://ik.imagekit.io/zmt/email%20files/facebook.png?updatedAt=1714585219445">
                                        </a>
                                    </td>
                                    <td>
                                        <a style="display: block; height: 30px; width: 30px; cursor: pointer; text-decoration: none; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif;" href="https://www.instagram.com/zurichmeetstanzania/">
                                            <img style="height: 30px; width: 30px; overflow: clip; overflow-clip-margin: content-box;" alt="Instagram Link" src="https://ik.imagekit.io/zmt/email%20files/instgram.png?updatedAt=1714585204115">
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </table>
            </div>`,
    newsletter: `<p style="font-size: 16px; color: #070d13; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; display: block; margin-block-start: 0; margin-block-end: 0; margin-inline-start: 0; margin-inline-end: 0; margin: 1em 0; word-wrap: normal; word-break: keep-all; hyphens: auto; -webkit-hyphens: auto;">
                Wir freuen uns Ihnen mitteilen zu können, dass wir Neuigkeiten haben. Sie können sie sich gerne unter folgendem <a style="color: #c2630a; text-decoration: underline; cursor: pointer; font-size: 16px; font-family: 'Titillium Web', Helvetica, Arial, sans-serif; display: inline; word-wrap: normal; word-break: keep-all; hyphens: auto; -webkit-hyphens: auto;" href="https://zurich-meets-tanzania.com/#scroll_to_news">Link</a>
                anschauen.<br><br>Hier ist schon eine kleine Vorschau:<br>`
};

export default EMAILS;