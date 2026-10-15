import { PUBLIC_CONFIG } from "../publicConfig";
import { addLocalFile, getAllLocalFiles, updateLocalFileMimeType, deleteLocalFile } from "./files.database";
import { getActualMimeType, getAllDelivApiFiles } from "./files.utils";
import { sendCriticalJobFailureNotification } from "./jobs.email";
import { sleep } from "./utils";
import { LocalFile } from "../.";

export async function updateLocalFilesMetadataDatabase(maxRetries: number = 5, retries: number = 0): Promise<void> {
    const name = "updateLocalFilesMetadataDatabase";

    if (retries > maxRetries) {
        const errorMessage = `${name} failed after ${maxRetries} retries. Sending email to admins...`;

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

    console.info(`Running job: ${name} (Attempt ${retries + 1}/${maxRetries})`);

    const remoteResult = await getAllDelivApiFiles();

    if (remoteResult.error || remoteResult.metadata === null || !remoteResult.metadata || !Array.isArray(remoteResult.metadata)) {
        console.error(`${name} failed with error: ${remoteResult.error}. Retrying in 10 seconds... (${retries + 1}/${maxRetries})`);

        await sleep(10000); // Wait for 10 seconds before retrying

        return await updateLocalFilesMetadataDatabase(maxRetries, retries + 1);
    }

    const localResult = await getAllLocalFiles();

    if (localResult.error || localResult.data === null) {
        console.error(`${name} failed with error: ${localResult.error}. Retrying in 10 seconds... (${retries + 1}/${maxRetries})`);

        await sleep(10000); // Wait for 10 seconds before retrying

        return await updateLocalFilesMetadataDatabase(maxRetries, retries + 1);
    }

    const localData = localResult.data as LocalFile[];

    let addedFilesErrors = 0;

    // Check for additions and updates
    for (let i = 0; i < remoteResult.metadata.length; i++) {
        const remoteFile = remoteResult.metadata[i];

        const localFile = localData.find((file) => file.uuid === remoteFile.uuid);

        if (!localFile) {
            // The files is not yet in the local database, so we need to add it
            let mimeType = await getActualMimeType(remoteFile.mimetype, remoteFile.uuid);

            console.info(`Adding new file to local database: ${remoteFile.uuid} (${mimeType})`);

            const addResult = await addLocalFile(remoteFile.uuid, mimeType);

            if (addResult.error) {
                addedFilesErrors++;

                if (addedFilesErrors > maxRetries) {
                    // To many errors, we will retry the whole job after 10 seconds
                    console.warn(`${name} failed with error: Failed to add ${addedFilesErrors} files to local database. Retrying in 10 seconds... (${retries + 1}/${maxRetries})`);

                    await sleep(10000); // Wait for 10 seconds before retrying

                    return await updateLocalFilesMetadataDatabase(maxRetries, retries + 1);
                } else {
                    console.warn(
                        `Failed to add file to local database: ${remoteFile.uuid}. Error: ${addResult.error}. This will not be retried, since the admins can manually rerun this job if needed. (Warning will be triggered after ${maxRetries - addedFilesErrors} errors)`,
                    );
                }
            }
        } else if (localFile.uuid === remoteFile.uuid && (localFile.mimeType !== remoteFile.mimetype || localFile.mimeType === "application/json")) {
            let mimeType = await getActualMimeType(remoteFile.mimetype, remoteFile.uuid);

            if (mimeType === localFile.mimeType) {
                // The mimetype is actually the same, so we don't need to update it
                continue;
            }

            // The file is already in the local database, but the mimetype has changed
            console.info(`Updating mimetype for file in local database: ${remoteFile.uuid} (${localFile.mimeType} -> ${remoteFile.mimetype})`);

            const updateResult = await updateLocalFileMimeType(remoteFile.uuid, mimeType);

            if (updateResult.error) {
                console.warn(`Failed to update mimetype for file in local database: ${remoteFile.uuid}. Error: ${updateResult.error}. This will not be retried, since the admins can manually rerun this job if needed.`);
            }
        }
    }

    // Check for deletions
    for (let i = 0; i < localData.length; i++) {
        const localFile = localData[i];

        const remoteFile = remoteResult.metadata.find((file) => file.uuid === localFile.uuid);

        if (!remoteFile) {
            // The file is not in the remote database, so we need to delete it from the local database
            console.info(`Deleting file from local database: ${localFile.uuid}`);

            const deleteResult = await deleteLocalFile(localFile.uuid);

            if (deleteResult.error) {
                console.warn(`Failed to delete file from local database: ${localFile.uuid}. Error: ${deleteResult.error}. This will not be retried, since the admins can manually rerun this job if needed.`);
            }
        }
    }

    console.info(`${name} completed successfully.`);

    return;
}
