import { CONFIG } from "../config";
import { DelivApiFile } from "../.";

export async function getAllDelivApiFiles(): Promise<{
    error: boolean;
    message: string;
    metadata: DelivApiFile[] | null;
}> {
    const request = await fetch(CONFIG.DELIVAPI_URL + "/api/getFilesMetadata", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: CONFIG.DELIVAPI_USER,
        }),
    });

    const response = await request.json();

    return response;
}

export async function getMimeType(url: string): Promise<string | null> {
    const request = await fetch(url, {
        method: "HEAD",
    });

    if (!request.ok) {
        console.error(`Failed to fetch mime type for ${url}. Status: ${request.status}`);
        return null;
    }

    const mimeType = request.headers.get("Content-Type");

    return mimeType;
}

export async function getActualMimeType(supposedMimeType: string, uuid: string): Promise<string> {
    let mimeType = supposedMimeType;

    if (mimeType === "application/json") {
        // This is most likely a chunked file
        const response = await getMimeType(`${CONFIG.DELIVAPI_URL}/cdn/${CONFIG.DELIVAPI_USER}/${uuid}`);

        if (response) {
            mimeType = response;
        }
    }
    return mimeType;
}
