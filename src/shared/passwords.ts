import { LoginInformation } from "..";
import { CONFIG } from "../config";

export const PASSWORDS: LoginInformation[] = [
    {
        websiteLabel: "Google Account",
        websiteUrl: "https://www.google.com/",
        username: CONFIG.EMAIL_GOOGLE_ACCOUNT,
        password: CONFIG.PASSWORD_GOOGLE_ACCOUNT,
    },
    {
        websiteLabel: "Google Mail (Gmail)",
        websiteUrl: "https://mail.google.com/",
        username: CONFIG.EMAIL_GOOGLE_ACCOUNT,
        password: CONFIG.PASSWORD_GOOGLE_ACCOUNT,
    },
    {
        websiteLabel: "Infomaniak Account",
        websiteUrl: "https://manager.infomaniak.com/",
        username: CONFIG.EMAIL_INFOMANIAK_ACCOUNT,
        password: CONFIG.PASSWORD_INFOMANIAK_ACCOUNT,
    },
    {
        websiteLabel: "Infomaniak Mail",
        websiteUrl: "https://mail.infomaniak.com/",
        username: CONFIG.EMAIL_INFOMANIAK_ACCOUNT,
        password: CONFIG.PASSWORD_INFOMANIAK_ACCOUNT,
    },
    {
        websiteLabel: "Stripe Dashboard (Admin)",
        websiteUrl: "https://dashboard.stripe.com/",
        username: CONFIG.EMAIL_STRIPE_ACCOUNT,
        password: CONFIG.PASSWORD_STRIPE_ACCOUNT,
        twoFactorSecret: "Timon Fragen",
    },
    {
        websiteLabel: "Stripe Dashboard (Nur Anzeigen)",
        websiteUrl: "https://dashboard.stripe.com/",
        username: CONFIG.EMAIL_STRIPE_READONLY_ACCOUNT,
        password: CONFIG.PASSWORD_STRIPE_READONLY_ACCOUNT,
        twoFactorSecret: CONFIG.TWO_FACTOR_AUTHENTICATION_SECRET_STRIPE_READONLY_ACCOUNT,
    },
    {
        websiteLabel: "Google Analytics (Unbenutzt)",
        websiteUrl: "https://analytics.google.com/",
        username: CONFIG.EMAIL_GOOGLE_ACCOUNT,
        password: CONFIG.PASSWORD_GOOGLE_ACCOUNT,
    },
    {
        websiteLabel: "Mailjet Account (Unbenutzt)",
        websiteUrl: "https://dashboard.mailjet.com/",
        username: CONFIG.EMAIL_MAILJET_ACCOUNT,
        password: CONFIG.PASSWORD_MAILJET_ACCOUNT,
    },
    {
        websiteLabel: "ImageKit Account (Unbenutzt)",
        websiteUrl: "https://imagekit.io/",
        username: CONFIG.EMAIL_IMAGEKIT_ACCOUNT,
        password: CONFIG.PASSWORD_IMAGEKIT_ACCOUNT,
    },
];
