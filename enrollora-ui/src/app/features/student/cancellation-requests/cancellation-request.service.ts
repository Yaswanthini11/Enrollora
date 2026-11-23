
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import {
  CancellationPagedResult,
  CancellationResponse,
  CreateCancellationRequest,
} from './cancellation-request.models';

@Injectable({
  providedIn: 'root',
})
export class StudentCancellationRequestService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/cancellation-requests`;

  // Get cancellation requests belonging to the logged-in student
  getMyCancellationRequests(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<CancellationPagedResult> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<CancellationPagedResult>(
      `${this.apiUrl}/my`,
      { params },
    );
  }

  // Submit a cancellation request for an enrollment
  createCancellationRequest(
    enrollmentId: number,
    request: CreateCancellationRequest,
  ): Observable<CancellationResponse> {
    return this.http.post<CancellationResponse>(
      `${environment.apiUrl}/enrollments/${enrollmentId}/cancellation-request`,
      request,
    );
  }
}
