
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

export interface CreateCancellationRequest {
  reason: string;
}

export type CancellationPagedResult =
  PagedResult<CancellationResponse>;
