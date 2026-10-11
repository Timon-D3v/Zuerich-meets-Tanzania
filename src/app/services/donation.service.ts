import { Service, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetDonationUsageTypesApiEndpointResponse, ApiEndpointResponse, GetDonationMetersApiEndpointResponse, GetDonationHistoryApiEndpointResponse, GetAllDonorsApiEndpointResponse } from "../..";

@Service()
export class DonationService {
    private http = inject(HttpClient);

    getDonationUsageTypes(): Observable<GetDonationUsageTypesApiEndpointResponse> {
        const request = this.http.get<GetDonationUsageTypesApiEndpointResponse>(`/api/donation/getDonationUsageTypes`);

        return request;
    }

    submitDonationForm(amount: number, firstName: string, lastName: string, email: string, usageType: string): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/donation/submitDonationForm`, {
            amount,
            firstName,
            lastName,
            email,
            usageType,
        });

        return request;
    }

    getDonationMeters(): Observable<GetDonationMetersApiEndpointResponse> {
        const request = this.http.get<GetDonationMetersApiEndpointResponse>(`/api/donation/getDonationMeters`);

        return request;
    }

    updateDonationMeter(id: number, title: string, description: string, currentValue: number, maxValue: number): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/donation/updateDonationMeter`, {
            id,
            title,
            description,
            currentValue,
            maxValue,
        });

        return request;
    }

    addDonationMeter(title: string, description: string, target: number): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/donation/addDonationMeter`, {
            title,
            description,
            target,
        });

        return request;
    }

    deactivateDonationMeter(id: number): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/donation/deactivateDonationMeter`, {
            id,
        });

        return request;
    }

    getDonationHistory(): Observable<GetDonationHistoryApiEndpointResponse> {
        const request = this.http.get<GetDonationHistoryApiEndpointResponse>(`/api/secured/admin/donation/getDonationHistory`);

        return request;
    }

    getDonorList(): Observable<GetAllDonorsApiEndpointResponse> {
        const request = this.http.get<GetAllDonorsApiEndpointResponse>(`/api/secured/admin/donation/getDonorList`);

        return request;
    }

    getOpenDonationRequests(): Observable<GetDonationHistoryApiEndpointResponse> {
        const request = this.http.get<GetDonationHistoryApiEndpointResponse>(`/api/secured/admin/donation/getOpenDonationRequests`);

        return request;
    }

    verifyDonationRequest(id: number, accepted: boolean): Observable<ApiEndpointResponse> {
        const request = this.http.post<ApiEndpointResponse>(`/api/secured/admin/donation/verifyDonationRequest`, {
            id,
            accepted,
        });

        return request;
    }
}
