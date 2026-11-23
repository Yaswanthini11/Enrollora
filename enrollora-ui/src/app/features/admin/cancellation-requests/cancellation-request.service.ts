
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CancellationPagedResult, CancellationFilter, CancellationResponse, ReviewCancellationRequest } from './cancellation-request.models';

@Injectable({
  providedIn: 'root',
})
export class CancellationRequestService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/cancellation-requests`;

  // GET: Retrieve all cancellation requests with pagination and filters
  getCancellationRequests(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters?: CancellationFilter,
  ): Observable<CancellationPagedResult> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.courseId != null) {
      params = params.set('courseId', filters.courseId);
    }

    if (filters?.status != null) {
      params = params.set('status', filters.status);
    }

    if (filters?.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }

    if (filters?.toDate) {
      params = params.set('toDate', filters.toDate);
    }

    return this.http.get<CancellationPagedResult>(this.apiUrl, { params });
  }

  // PUT: Approve a cancellation request
  approveCancellationRequest(
    id: number,
    request: ReviewCancellationRequest,
  ): Observable<CancellationResponse> {
    return this.http.put<CancellationResponse>(
      `${this.apiUrl}/${id}/approve`,
      request,
    );
  }

  // PUT: Reject a cancellation request
  rejectCancellationRequest(
    id: number,
    request: ReviewCancellationRequest,
  ): Observable<CancellationResponse> {
    return this.http.put<CancellationResponse>(
      `${this.apiUrl}/${id}/reject`,
      request,
    );
  }
}
