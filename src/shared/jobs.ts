// Run these jobs on startup and every 24 hours to ensure that the member data is up-to-date.
// If some jobs fail, they will be retried 5 times and if that does not work, an email will be sent to the admins
// If that email cannot be sent, the app will crash, because this is a critical error and needs to be fixed immediately

import { PUBLIC_CONFIG } from "../publicConfig";
import { waitForDatabase } from "./connection.database";
import { updateLocalFilesMetadataDatabase } from "./files.job";
import { sendCriticalJobFailureNotification } from "./jobs.email";
import { setUserTypeToMemberForAllVerifiedLegacyMembers, resetUserTypeForAllUnverifiedOrRejectedLegacyMembers } from "./member.database";
import { resetLegacyMemberStatusIfPeriodHasEnded } from "./member.jobs";
import { sleep } from "./utils";

const MAX_RETRIES = 5;

async function databaseJobsWrapper(jobFunction: Function, name: string, retries: number = 0) {
    if (retries > MAX_RETRIES) {
        const errorMessage = `${name} failed after ${MAX_RETRIES} retries. Sending email to admins...`;

        console.error(errorMessage);

        const developerResult = await sendCriticalJobFailureNotification(PUBLIC_CONFIG.PERSONAS["DEVELOPER"].name, PUBLIC_CONFIG.PERSONAS["DEVELOPER"].email, errorMessage);
        const chairmanResult = await sendCriticalJobFailureNotification(PUBLIC_CONFIG.PERSONAS["CHAIRMAN"].name, PUBLIC_CONFIG.PERSONAS["CHAIRMAN"].email, errorMessage);

        if (!developerResult || !chairmanResult) {
            // Something went terribly wrong, when not even the email could be sent
            // => Crash the app
            throw new Error("Critical error: Failed to send email to admins after job failure.");
        }

        return;
    }

    console.info(`Running job: ${name} (Attempt ${retries + 1}/${MAX_RETRIES})`);

    const result = await jobFunction();

    if (result.error) {
        console.error(`${name} failed with error: ${result.error}. Retrying in 10 seconds... (${retries + 1}/${MAX_RETRIES})`);

        await sleep(10000); // Wait for 10 seconds before retrying

        await databaseJobsWrapper(jobFunction, name, retries + 1);

        return;
    } else {
        console.info(`${name} completed successfully.`);
        return;
    }
}

async function runAllJobs() {
    console.info("Waiting for database to be ready...");

    await waitForDatabase();

    console.info("Running all jobs...");

    await resetLegacyMemberStatusIfPeriodHasEnded(MAX_RETRIES);

    await databaseJobsWrapper(setUserTypeToMemberForAllVerifiedLegacyMembers, "setUserTypeToMemberForAllVerifiedLegacyMembers");

    await databaseJobsWrapper(resetUserTypeForAllUnverifiedOrRejectedLegacyMembers, "resetUserTypeForAllUnverifiedOrRejectedLegacyMembers");

    await updateLocalFilesMetadataDatabase(MAX_RETRIES);

    console.info("All jobs completed.");
}

runAllJobs();

setInterval(runAllJobs, 24 * 60 * 60 * 1000);
