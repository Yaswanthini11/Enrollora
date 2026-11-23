
import { PagedResult } from '../../../shared/models/paged-result.model';

export interface CancellationResponse {
  cancellationRequestId: number;
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseName: string;
  reason: string;
  status: number;
  requestedAt: string;
  reviewedAt: string | null;
  adminRemarks: string | null;
}

export interface CancellationFilter {
  search?: string;
  courseId?: number | null;
  status?: number | null;
  fromDate?: string;
  toDate?: string;
}

export interface ReviewCancellationRequest {
  adminRemarks?: string;
}

export type CancellationPagedResult =
  PagedResult<CancellationResponse>;
