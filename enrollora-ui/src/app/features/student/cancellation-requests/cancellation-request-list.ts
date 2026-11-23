
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { EnrollmentResponse } from '../../enrollments/enrollment.models';
import { EnrollmentService } from '../../enrollments/enrollment.service';

import {
  CancellationResponse,
  CreateCancellationRequest,
} from './cancellation-request.models';

import { StudentCancellationRequestService } from './cancellation-request.service';

@Component({
  selector: 'app-student-cancellation-requests',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './cancellation-request-list.html',
  styleUrl: './cancellation-request-list.css',
})
export class CancellationRequestList implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);

  private readonly cancellationService =
    inject(StudentCancellationRequestService);

  // Data
  enrollments = signal<EnrollmentResponse[]>([]);
  cancellationRequests = signal<CancellationResponse[]>([]);

  // UI state
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Form fields
  selectedEnrollmentId: number | null = null;
  reason = '';

  // Pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  ngOnInit(): void {
    this.loadEnrollments();
    this.loadCancellationRequests();
  }

  // Load the logged-in student's enrollments
  loadEnrollments(): void {
    this.enrollmentService.getMyEnrollments(1, 100).subscribe({
      next: (response) => {
        this.enrollments.set(
          response.items.filter((enrollment) => enrollment.status === 0),
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading enrollments:', error);
        this.errorMessage.set(
          error.error?.detail ||
          error.error?.message ||
          'Unable to load your enrollments.',
        );
      },
    });
  }

  // Load the logged-in student's cancellation requests
  loadCancellationRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.cancellationService
      .getMyCancellationRequests(this.pageNumber(), this.pageSize())
      .subscribe({
        next: (response) => {
          this.cancellationRequests.set(response.items);
          this.totalRecords.set(response.totalRecords);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading cancellation requests:', error);

          this.errorMessage.set(
            error.error?.detail ||
            error.error?.message ||
            error.error?.title ||
            'Unable to load cancellation requests.',
          );

          this.isLoading.set(false);
        },
      });
  }

  // Check whether an enrollment already has a pending request
  hasPendingRequest(enrollmentId: number): boolean {
    return this.cancellationRequests().some(
      (request) =>
        request.enrollmentId === enrollmentId && request.status === 0,
    );
  }

  // Submit a new cancellation request
  submitRequest(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.selectedEnrollmentId === null) {
      this.errorMessage.set('Please select an enrollment.');
      return;
    }

    if (!this.reason.trim()) {
      this.errorMessage.set('Please enter a reason for cancellation.');
      return;
    }

    if (this.reason.trim().length > 1000) {
      this.errorMessage.set('The reason cannot exceed 1000 characters.');
      return;
    }

    if (this.hasPendingRequest(this.selectedEnrollmentId)) {
      this.errorMessage.set(
        'A pending cancellation request already exists for this enrollment.',
      );
      return;
    }

    const request: CreateCancellationRequest = {
      reason: this.reason.trim(),
    };

    this.isSubmitting.set(true);

    this.cancellationService
      .createCancellationRequest(this.selectedEnrollmentId, request)
      .subscribe({
        next: () => {
          this.successMessage.set(
            'Your cancellation request has been submitted successfully.',
          );

          this.reason = '';
          this.selectedEnrollmentId = null;
          this.isSubmitting.set(false);

          this.pageNumber.set(1);
          this.loadCancellationRequests();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error submitting cancellation request:', error);

          this.errorMessage.set(
            error.error?.detail ||
            error.error?.message ||
            error.error?.title ||
            'Unable to submit your cancellation request.',
          );

          this.isSubmitting.set(false);
        },
      });
  }

  // Display status text
  statusLabel(status: number): string {
    switch (status) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      case 2:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  // Display status CSS class
  statusClass(status: number): string {
    switch (status) {
      case 0:
        return 'pending';
      case 1:
        return 'approved';
      case 2:
        return 'rejected';
      default:
        return '';
    }
  }

  // Pagination
  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update((page) => page - 1);
      this.loadCancellationRequests();
    }
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update((page) => page + 1);
      this.loadCancellationRequests();
    }
  }
}
