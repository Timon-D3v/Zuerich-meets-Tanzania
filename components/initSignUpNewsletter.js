import { randomString } from "timonjs";
import { sendNewsletterSignUpConfirmation } from "./emailMethods.js";

const Requests = {};

export async function initSignUpNewsletter(data) {
    const id = randomString(64);

    for (const key in Requests) {
        if (Requests[key].email === data.email) return "ALREADY_REQUESTED";
    }

    const response = await sendNewsletterSignUpConfirmation(data.email, id, data.firstName, data.lastName, data.gender);

    if (!response) return response;

    Requests[id] = data;

    setTimeout(() => {
        delete Requests[id];
    }, 1000 * 60 * 30); // 30 minutes

    return response;
}

export function validateSignUpNewsletter(id, email, name, family_name, gender) {
    if (!Requests.hasOwnProperty(id)) return false;

    const request = Requests[id];

    const valid = request.email === email && request.firstName === name && request.lastName === family_name && request.gender === gender;

    if (!valid) return valid;

    delete Requests[id];

    return valid;
}