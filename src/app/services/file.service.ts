import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GetAllFileInformationApiEndpointResponse, ApiEndpointResponse } from "../..";

@Injectable({
    providedIn: "root",
})
export class FileService {
    private http = inject(HttpClient);

    getAllFiles(): Observable<GetAllFileInformationApiEndpointResponse> {
        const request = this.http.get<GetAllFileInformationApiEndpointResponse>("/api/secured/admin/files/getAllFiles");

        return request;
    }

    replaceFile(uuid: string, file: File): Observable<ApiEndpointResponse> {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("uuid", uuid);

        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/files/replaceFile`, formData);

        return request;
    }

    deleteFile(uuid: string): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/files/deleteFile`, { uuid });

        return request;
    }

    getMimeType(url: string): Observable<any> {
        const request = this.http.head(url, {
            observe: "response",
            responseType: "text",
        });

        return request;
    }
}
