import { errorLog } from "timonjs";
import { addInvoiceToDatabase, createTempPayment, deleteMemberWithSubscriptionId, getMemberWithCustomerId, getMemberWithSubscriptionId, getSubscriptionIdWithCustomerId, removeMemberWithUserId, updateMemberPeriodEnd, updateMemberPeriodStart, updateMemberStatus, updateTempSubscriptionPeriodEnd, updateTempSubscriptionPeriodStart, updateTempSubscriptionStatus } from "../backend/db/db.zmt.js";
import { sendCriticalErrorMail } from "./emailMethods.js";

export async function stripe_c_s_created(subscription_id, period_start, period_end, customer_id, start_date, status) {
    try {
        await createTempPayment(subscription_id, period_start, period_end, customer_id, start_date, status);
    } catch (err) {
        const message = "Beim Bezahlen eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        errorLog(err.message);
        sendCriticalErrorMail(err.message, message);
    }
}

export async function stripe_c_s_updated(subscription_id, period_start, period_end, status) {
    try {
        const member = await getMemberWithSubscriptionId(subscription_id);
        const data = [period_start, period_end, status];

        if (member.length > 0) {
            member = member[0];
            const update = [updateMemberPeriodStart, updateMemberPeriodEnd, updateMemberStatus];

            data.forEach(async (set, i) => {
                if (typeof set !== "undefined") await update[i](subscription_id, set);
            });
        } else {
            const update = [updateTempSubscriptionPeriodStart, updateTempSubscriptionPeriodEnd, updateTempSubscriptionStatus];

            data.forEach(async (set, i) => {
                try {
                    if (typeof set !== "undefined") await update[i](subscription_id, set);
                } catch (err) {
                    console.error("Error:", err);
                }
            });
        }
    } catch (err) {
        const message = "Beim Erneuern des Abos eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        errorLog(err.message);
        sendCriticalErrorMail(err.message, message);
    }
}

export async function stripe_c_s_deleted(subscription_id) {
    try {
        const [member] = await getMemberWithSubscriptionId(subscription_id);
        const user_id = member.user_id;
        await deleteMemberWithSubscriptionId(subscription_id);
        await removeMemberWithUserId(user_id);
    } catch (err) {
        const message = "Beim Löschen eines Abos eines Benutzers ist ein kritischer Fehler aufgetreten. Bitte sofort überprüfen (lassen).<br><br>Weitere Informationen:";
        errorLog(err.message);
        sendCriticalErrorMail(err.message, message);
    }
}

export async function stripe_i_p_success(customer_id, pdf, url) {
    try {
        const session = await getSubscriptionIdWithCustomerId(customer_id);
        let subscription_id;
        if (typeof session === "undefined") {
            subscription_id = await getMemberWithCustomerId(customer_id);
            subscription_id = subscription_id.subscription_id;
        } else {
            subscription_id = session.sub_id;
        }
        await addInvoiceToDatabase(subscription_id, pdf, url);
    } catch (err) {
        errorLog(err);
    }
}
