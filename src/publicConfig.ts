import { Blog, News, PublicConfig, StaticSite, StaticSiteNames } from ".";

export const PUBLIC_CONFIG: PublicConfig = {
    NAME: "zurich meets tanzania",
    ADDRESS: "Ackersteinstrasse 84\n8049 Zürich\nSwitzerland",

    THEME_COLOR: "#F27C0D",

    UNIKAT_URL: "https://shop.unikat-hoengg.ch/produkte/zurichmeetstanzania-60?d=1",
    FACEBOOK_URL: "https://www.facebook.com/profile.php?id=100064463715451", // New but unused: "https://www.facebook.com/profile.php?id=61577621371823"
    INSTAGRAM_URL: "https://www.instagram.com/zurichmeetstanzania/",
    PROGRAMMER_URL: "https://www.timondev.com/",

    PRIVACY_PDF_URL: "/pdf/Datenschutzerklärung.pdf",
    FALLBACK_IMAGE_URL: "/backup/fallback.png",
    FALLBACK_PROFILE_PICTURE: "/svg/personal.svg",

    REGEX: {
        MATCH_VALID_EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,10}$/,
        MATCH_VALID_PHONE: /^\+?[0-9\s\-()]{6,20}$/,
        MATCH_VALID_POSTAL_CODE: /^(?:[A-Z]{2}-\d{3,6}|\d{3,6})$/,
        MATCH_VALID_FILENAME: /^[a-zA-Z0-9_-]{1,255}$/,
    },

    STATIC_SITES: {
        LOADING: (name: StaticSiteNames, imageUrl: string): StaticSite => {
            return {
                metadata: {
                    title: name,
                    subtitle: "Laden...",
                    imageUrl,
                    imageAlt: "Laden...",
                    author: "Das ZMT-Team",
                },
                data: [],
            };
        },
        ERROR: (name: StaticSiteNames, imageUrl: string, message: string): StaticSite => {
            return {
                metadata: {
                    title: name,
                    subtitle: "Fehler beim Laden der Seite",
                    imageUrl,
                    imageAlt: "Fehler",
                    author: "Das ZMT-Team",
                },
                data: [
                    {
                        type: "title",
                        content: "Fehler beim Laden der Seite",
                    },
                    {
                        type: "paragraph",
                        content: `Beim Laden der Seite ist ein Fehler aufgetreten: ${message}\nBitte versuchen Sie es später erneut oder kontaktieren Sie den Administrator.`,
                    },
                ],
            };
        },
    },

    BLOGS: {
        LOADING: (name: string, imageUrl: string): Blog => {
            return {
                id: -1,
                title: name,
                author: "Das ZMT-Team",
                date: new Date().toLocaleDateString("de-CH", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                data: {
                    metadata: {
                        title: name,
                        subtitle: "Laden...",
                        imageUrl,
                        imageAlt: "Laden...",
                        author: "Das ZMT-Team",
                    },
                    data: [],
                },
            };
        },
        ERROR: (name: string, imageUrl: string, message: string): Blog => {
            return {
                id: -2,
                title: name,
                author: "Das ZMT-Team",
                date: new Date().toLocaleDateString("de-CH", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                data: {
                    metadata: {
                        title: name,
                        subtitle: "Fehler beim Laden der Seite",
                        imageUrl,
                        imageAlt: "Fehler",
                        author: "Das ZMT-Team",
                    },
                    data: [
                        {
                            type: "title",
                            content: "Fehler beim Laden der Seite",
                        },
                        {
                            type: "paragraph",
                            content: `Beim Laden der Seite ist ein Fehler aufgetreten: ${message}\nBitte versuchen Sie es später erneut oder kontaktieren Sie den Administrator.`,
                        },
                    ],
                },
            };
        },
    },

    NEWS: {
        LOADING: (imageUrl: string): News => {
            return {
                id: -1,
                date: new Date().toLocaleDateString("de-CH", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                data: {
                    type: "image",
                    imageUrl: imageUrl,
                    imageAlt: "Laden...",
                    imagePosition: "center",
                    content: [],
                },
            };
        },
        ERROR: (imageUrl: string, message: string): News => {
            return {
                id: -2,
                date: new Date().toLocaleDateString("de-CH", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                data: {
                    type: "image",
                    imageUrl: imageUrl,
                    imageAlt: "Fehler",
                    imagePosition: "center",
                    content: [
                        {
                            type: "title",
                            content: "Fehler beim Laden der Seite",
                        },
                        {
                            type: "paragraph",
                            content: `Beim Laden der Seite ist ein Fehler aufgetreten: ${message}\nBitte versuchen Sie es später erneut oder kontaktieren Sie den Administrator.`,
                        },
                    ],
                },
            };
        },
    },

    PERSONAS: {
        CHAIRMAN: {
            name: "Dr. Stefan Christen",
            email: "info@zurich-meets-tanzania.com",
        },
        SECRETARY: {
            name: "Sara Pieretti",
            email: "info@zurich-meets-tanzania.com",
        },
        DEVELOPER: {
            name: "Timon Fiedler",
            email: "info@timondev.com",
            website: "https://www.timondev.com",
            linkedIn: "https://www.linkedin.com/in/timon-fiedler",
            github: "https://github.com/Timon-D3v/",
        },
    },

    ERROR: {
        INTERNAL_ERROR: "501: Internal Server Error",
        NO_CONNECTION_TO_DATABASE: "Es konnte keine Verbindung mit der Datenbank hergestellt werden. Bitte versuche es später noch einmal.",
        NO_INTERNET_CONNECTION: "Es konnte keine Verbindung zum Internet hergestellt werden. Bitte versuche es später noch einmal.",
        NO_CONNECTION_TO_SERVER: "Es konnte keine Verbindung mit dem Server hergestellt werden. Bitte versuche es später noch einmal.",
        BAD_REQUEST: "Die Anfrage konnte nicht verarbeitet werden, da falsche oder unvollständig Angaben geschickt wurden. Bitte überprüfe deine Daten und versuche es später noch einmal.",
    },

    ROUTES: {
        TYPES: {
            HOME: ["/"],
            AUTH: ["/login", "/signup", "/signup-confirm", "/password-recovery", "/password-recovery-confirm"],
            SECURED: ["/account"],
            PROJECTS: ["/bajaji", "/cardiology", "/gynecology", "/mbuzi", "/meducation", "/surgery", "/tanzania-meets-zurich", "/zurich-meets-tanzania"],
            ADMIN: ["/admin"],
            CONTACT: ["/contact"],
            GENERAL: [
                "/",
                "/archive",
                "/beginning",
                "/blog",
                "/current-team",
                "/donate",
                "/executives",
                "/finances",
                "/gallery",
                "/general-meeting",
                "/history-tanzania",
                "/imprint",
                "/income-statement",
                "/membership",
                "/legacy-membership",
                "/newsletter/unsubscribe",
                "/newsletter/confirm",
                "/privacy",
                "/statutes",
                "/vision",
                "/payment-success",
                "/payment-cancelled",
            ],
            REDIRECTS: ["/shop"],
        },
        TITLE_SUFFIX: " | zurich-meets-tanzania",
        TITLES: {
            "/": {
                title: "Home",
                description:
                    "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren. Eine bunt zusammengemischte Truppe engagierter, hilfsbereiter Leute. Erfahre auf dieser Seite mehr über unser Team, unsere Freunde in Mbalizi und unsere Partner.",
                lastUpdated: "Fri Aug 15 2025 16:33:30 GMT+0200 (Mitteleuropäische Sommerzeit)",
            },
            "/login": {
                title: "Login",
                description: "Logge dich hier in deinen Account ein um deine Rechnungen oder Einstellungen zu verwalten.",
                lastUpdated: "Sat Nov 22 2025 19:02:05 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/signup": {
                title: "Registrieren",
                description: "Erstelle dir einen ZMT-Account um Mitglied bei zurich meets tanzania zu werden.",
                lastUpdated: "Sat Nov 22 2025 19:08:30 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/signup-confirm": {
                title: "Registrierung bestätigen",
                description: "Erstelle dir einen ZMT-Account um Mitglied bei zurich meets tanzania zu werden. Bestätige nun deine E-Mail-Adresse via den Code, den du von uns erhalten hast.",
                lastUpdated: "Sat Dec 13 2025 14:46:47 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/password-recovery": {
                title: "Passwort zurücksetzen",
                description: "Du hast dein Passwort vergessen? Kein Problem. Nach einem kurzen Sicherheitscheck kannst du dir ganz unkompliziert ein neues zuschicken lassen.",
                lastUpdated: "Sat Nov 22 2025 23:52:39 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/password-recovery-confirm": {
                title: "Passwort zurücksetzen Bestätigung",
                description:
                    "Du hast dein Passwort vergessen? Kein Problem. Nach einem kurzen Sicherheitscheck kannst du dir ganz unkompliziert ein neues zuschicken lassen. (Wenn du auf dieser Seite landest hast du schon einen Bestätigungscode per E-Mail erhalten.)",
                lastUpdated: "Fri Dec 05 2025 23:43:05 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/account": {
                title: "Mein Account",
                description: "Auf dieser Seite kannst du jegliche Einstellungen für deinen Account vornehmen oder deine Rechnungen ansehen.",
                lastUpdated: "Sat Nov 22 2025 19:13:03 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/bajaji": {
                title: "Bajaji",
                description: "Alles über das Tochterprojekt 'Bajaji'. (Ein Bajaji ist ein kleines dreirädriges Fahrzeug, welches in Tanzania sehr geläufig ist.)",
                lastUpdated: "Sat Nov 22 2025 20:06:03 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/cardiology": {
                title: "Kardiologie – Herzmedizin",
                description: "Vorstandspräsident Stefan Christen schriebt über die Kardiologie.",
                lastUpdated: "Sat Nov 22 2025 20:07:53 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/gynecology": {
                title: "twenty4forty",
                description: "Seit 2015 ist auch die Gynäkologie und Geburtshilfe mit dem Tochterprojekt twenty4forty dabei. Das Interesse hat unter anderem die grosse Frauenklinik mit über 4000 Geburten pro Jahr geweckt.",
                lastUpdated: "Sat Nov 22 2025 23:32:19 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/mbuzi": {
                title: "Mbuzi",
                description: "Mbuzi ist ein Tochterprojekt, welches vor allem kleineren Kindern mit schweren Verbrennungen helfen soll, soviel wie möglich an Funktion und Aussehen wiederzuerlangen.",
                lastUpdated: "Sat Nov 22 2025 23:26:29 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/meducation": {
                title: "Meducation",
                description: "Das Tochterprojekt Meducation, welches 2017 gegründet wurde, sorgt für eine gezielt Aus- und Weiterbildung des örtlichen Personals in Ifisi.",
                lastUpdated: "Sat Nov 22 2025 23:22:32 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/surgery": {
                title: "Chirurgie",
                description: "Alles über die Chirurgie im Zusammenhang mit zurich meets tanzania findest du hier.",
                lastUpdated: "Sat Nov 22 2025 20:02:34 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/tanzania-meets-zurich": {
                title: "tanzania meets zurich",
                description: "Erfahre mehr über unser Tochterprojekt Tanzania meets Zurich und wieso es wichtig ist.",
                lastUpdated: "Sat Nov 22 2025 19:20:56 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/zurich-meets-tanzania": {
                title: "Das Projekt",
                description: "Erfahre mehr über unser Hauptprojekt und unsere Motivation dahinter.",
                lastUpdated: "Sat Nov 22 2025 19:16:47 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/admin": {
                title: "Verwaltung",
                description: "Dies ist der Einstiegspunkt für alle Verwaltungseinstellungen.",
                lastUpdated: "Sat Nov 22 2025 23:53:42 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/contact": {
                title: "Kontakt",
                description: "Fülle das Formular aus um ganz unkompliziert mit uns in Kontakt zu treten.",
                lastUpdated: "Sat Nov 22 2025 19:14:49 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/archive": {
                title: "News Archiv",
                description: "Hier findest du alle Newsartikel, die auf unserer Webseite veröffentlicht wurden.",
                lastUpdated: "Sat Nov 22 2025 23:51:16 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/beginning": {
                title: "Wie alles begann...",
                description: "Auf dieser Seite findest du die ganze Geschichte vom Verein zurich meets tanzania.",
                lastUpdated: "Sat Nov 22 2025 19:57:13 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/blog": {
                title: "Blog",
                description: "Lese über unsere spannenden Einsätze vor Ort im Ifisi Hospital.",
                lastUpdated: "Sat Nov 22 2025 23:49:06 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/current-team": {
                title: "Aktuelles Team",
                description: "Erfahre auf dieser Seite welche Mitglieder von zurich meets tanzania beim aktuellen Einsatz in Ifisi dabei sind.",
                lastUpdated: "Sat Nov 22 2025 19:48:13 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/donate": {
                title: "Spenden",
                description: "Unser Projekt ist stark abhängig von Spenden. Wir freuen uns über jeden Beitrag mit ganzem Herzen und stellen auch gerne eine Spendenbescheinigung aus. (Bitte melde dich dafür via unserem Kontaktformular)",
                lastUpdated: "Sat Nov 22 2025 23:40:41 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/error404": {
                title: "Nicht gefunden",
                description: "Diese Seite konnte nicht gefunden werden...",
                lastUpdated: "Mon Dec 08 2025 18:45:42 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/executives": {
                title: "Vorstand",
                description:
                    "Wir sind ein Team von medizinischen Fachleuten aus den verschiedensten Berufsgruppen und Lehren. Eine bunt zusammengemischte Truppe engagierter, hilfsbereiter Leute. Erfahre auf dieser Seite mehr über den Vorstand des Vereins",
                lastUpdated: "Sat Nov 22 2025 19:45:48 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/finances": {
                title: "Finanzierung",
                description: "Die vier Säulen zur Finanzierung von zurich meets tanzania.",
                lastUpdated: "Sat Nov 22 2025 20:11:13 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/gallery": {
                title: "Galerie",
                description: "Eine Kollektion an Bildern aus Tanzania.",
                lastUpdated: "Sat Nov 22 2025 23:47:28 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/general-meeting": {
                title: "Generalversammlung",
                description: "Auf unserer Generalversammlungsseite findest du Einblicke in die letzte GV, sowie alle Informationen zu unserer nächsten Generalversammlung.",
                lastUpdated: "Sat Nov 22 2025 23:29:33 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/history-tanzania": {
                title: "Tanzanias Geschichte",
                description: "Die Geschichte, geografische Fakten und die Demografie von Tanzania auf einer Seite.",
                lastUpdated: "Sat Nov 22 2025 20:01:05 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/imprint": {
                title: "Impressum",
                description: "Das Impressum beinhaltet alle Quellenangaben zu den Bildern auf dieser Webseite.",
                lastUpdated: "Sat Nov 22 2025 23:18:55 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/income-statement": {
                title: "Erfolgsrechnung",
                description: "Die gesamte Erfolgsrechnung und Bilanz des Vereins ist hier öffentlich einsehbar.",
                lastUpdated: "Sat Nov 22 2025 23:19:58 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/membership": {
                title: "Mitglied werden",
                description: "Wir freuen uns sehr über jedes neue Mitglied in unserem Verein. Willkommen!",
                lastUpdated: "Sat Nov 22 2025 23:45:27 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/legacy-membership": {
                title: "Mitglied werden",
                description: "Wir freuen uns sehr über jedes neue Mitglied in unserem Verein. Willkommen!",
                lastUpdated: "Sun Jun 28 2026 21:15:50 GMT+0200 (Central European Summer Time)",
            },
            "/newsletter/unsubscribe": {
                title: "Abmelden",
                description: "Du möchtest nicht mehr von uns über aktuelle Neuigkeiten benachrichtigt werden? Das tut uns leid. Hier kannst du dich abmelden.",
                lastUpdated: "Wed Aug 12 2026 11:29:23 GMT+0200 (Central European Summer Time)",
            },
            "/newsletter/confirm": {
                title: "Anmeldung bestätigen",
                description: "Du hast dich für unseren Newsletter angemeldet. Bitte bestätige deine Anmeldung via den Code, den du von uns erhalten hast.",
                lastUpdated: "Wed Aug 12 2026 11:30:08 GMT+0200 (Central European Summer Time)",
            },
            "/privacy": {
                title: "Datenschutz",
                description: "Datenschutz ist uns ein wichtiges Anliegen. Daher bearbeiten wir Ihre personenbezogenen Daten mit grosser Sorgfalt und gemäss den anwendbaren gesetzlichen Vorgaben. Hier kannst du mehr darüber erfahren.",
                lastUpdated: "Sat Nov 22 2025 23:58:04 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/statutes": {
                title: "Statuten",
                description: "Unsere klar definierten Statuten für die rechtliche Gültigkeit unseres Vereins können hier eingesehen werden.",
                lastUpdated: "Sat Nov 22 2025 20:14:01 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/vision": {
                title: "Vision",
                description: "Unsere Vision für das Hauptprojekt sowie die vielen Tochterprojekte findest du auf dieser Seite.",
                lastUpdated: "Sat Nov 22 2025 19:50:52 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
            "/payment-success": {
                title: "Zahlung erfolgreich",
                description: "Vielen Dank für deine Zahlung. Wir haben sie erfolgreich erhalten und werden dich per sofort als Mitglied in unserem System registrieren.",
                lastUpdated: "Mon Aug 10 2026 06:13:51 GMT+0200 (Central European Summer Time)",
            },
            "/payment-cancelled": {
                title: "Zahlung abgebrochen",
                description: "Deine Zahlung wurde abgebrochen. Solltest du Fragen haben, kontaktiere uns gerne.",
                lastUpdated: "Mon Aug 10 2026 06:14:45 GMT+0200 (Central European Summer Time)",
            },
            "/shop": {
                title: "Shop",
                description: "Diese Seite leitet dich zum Unikat weiter, wo wir unsere handgemachten Unikate aus Tanzania verkaufen.",
                lastUpdated: "Sat Nov 22 2025 19:11:22 GMT+0100 (Mitteleuropäische Normalzeit)",
            },
        },
        REDIRECTS: {
            "/": ["/home"],
            "/login": ["/einloggen"],
            "/signup": ["/sign-up", "/registrieren", "/sign%20up", "/account-erstellen", "/account%20erstellen"],
            "/signup-confirm": ["/signup%20confirm"],
            "/password-recovery": ["/password%20recovery"],
            "/password-recovery-confirm": ["/password%20recovery%20confirm"],
            "/account": ["/me", "/profil", "/profile", "/konto"],
            "/bajaji": ["/projects/bajaji"],
            "/cardiology": ["/kardiologie", "/projects/kardiologie"],
            "/gynecology": ["/gyno", "/projects/gyno", "/gyn%C3%A4kologie", "/projects/gyn%C3%A4kologie", "/20for40", "/twenty4forty"],
            "/mbuzi": ["/projects/mbuzi"],
            "/meducation": ["/projects/meducation"],
            "/surgery": ["/chirurgie", "/projects/chirurgie"],
            "/tanzania-meets-zurich": ["/tmz", "/tanzania%20meets%20zurich"],
            "/zurich-meets-tanzania": ["/zmt", "/zurich%20meets%20tanzania"],
            "/admin": [],
            "/contact": ["/kontakt", "/contactUs", "/kontaktiereUns"],
            "/archive": [],
            "/beginning": [
                "/anfang",
                "/der%20anfang",
                "/the%20beginning",
                "/der-anfang",
                "/the-beginning",
                "/wie-alles-begann",
                "/wie%20alles%20began",
                "/in%20the%20beginning",
                "/in-the-beginning",
                "/how-it-all-started",
                "/how%20it%20all%20started",
            ],
            "/blog": [],
            "/current-team": ["/team", "/current%20team"],
            "/donate": ["/spenden", "/spenden-und-mitglied", "/spenden%20und%20mitglied"],
            "/executives": ["/board", "/us", "/vorstand"],
            "/finances": ["/finanzen"],
            "/gallery": [],
            "/general-meeting": ["/gv", "/generalversammlung"],
            "/history-tanzania": ["/tanzania", "/history%20tanzania", "/tanzanias-history", "/tanzanias%20history"],
            "/imprint": ["/impressum", "/quellenangabe", "/quellen", "/sources"],
            "/income-statement": ["/income%20statement", "/erfolgsrechnung"],
            "/membership": ["/mitglied-und-spenden", "/mitglied%20und%20spenden", "/mitglied", "/mitgliedschaft", "/mitglied-werden", "/mitglied%20werden", "/become-member", "/become%20member"],
            "/legacy-membership": ["/legacy%20membership", "/legacy%20mitgliedschaft", "/legacy-mitgliedschaft", "/legacy%20mitglied-werden", "/legacy-mitglied-werden", "/mitgliedschaft-via-bankverbindung"],
            "/newsletter/unsubscribe": ["/newsletter/cancel", "/newsletter/abmelden", "/newsletter-sign-out", "/newsletter%20sign%20out", "/newsletter/signOut", "/newsletter/sign-out", "/newsletter/sign%20out", "/newsletter%20unsubscribe"],
            "/newsletter/confirm": ["/newsletter/confirm-signup", "/newsletter/anmeldung-best%C3%A4tigen", "/newsletter/anmeldung%20best%C3%A4tigen", "/newsletter/confirm-sign-up", "/newsletter/confirm%20sign%20up"],
            "/privacy": ["/datenschutz", "/datenschutzerkl%C3%A4rung", "/privacy-statement", "/privacy%20statement"],
            "/statutes": ["/statuten"],
            "/vision": ["/ideas", "/idee", "/ideen", "/leitideen"],
            "/shop": ["/einkaufen"],
        },
    },
};
