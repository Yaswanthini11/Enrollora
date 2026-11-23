
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CancellationRequestService } from './cancellation-request.service';

import {
  CancellationResponse,
  CancellationFilter,
} from './cancellation-request.models';

@Component({
  selector: 'app-cancellation-request-list',
  standalone: true,
  imports: [DatePipe, NgClass, FormsModule],
  templateUrl: './cancellation-request-list.html',
  styleUrl: './cancellation-request-list.css',
})
export class CancellationRequestList implements OnInit {
  private readonly cancellationService = inject(CancellationRequestService);

  // Signals
  cancellationRequests = signal<CancellationResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  processingId = signal<number | null>(null);

  // Search and filters
  searchTerm = '';
  selectedStatus: number | null = null;

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadCancellationRequests();
  }

  // Load cancellation requests
  loadCancellationRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const filters: CancellationFilter = {
      search: this.searchTerm.trim() || undefined,
      status: this.selectedStatus,
    };

    this.cancellationService
      .getCancellationRequests(this.pageNumber, this.pageSize, filters)
      .subscribe({
        next: (response) => {
          this.cancellationRequests.set(response.items);
          this.totalRecords = response.totalRecords;
          this.totalPages = response.totalPages;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading cancellation requests:', error);

          this.errorMessage.set(
            error.error?.message || 'Failed to load cancellation requests.',
          );

          this.isLoading.set(false);
        },
      });
  }

  // Search requests
  searchRequests(): void {
    this.pageNumber = 1;
    this.loadCancellationRequests();
  }

  // Filter requests by status
  filterByStatus(status: number | null): void {
    this.selectedStatus = status;
    this.pageNumber = 1;
    this.loadCancellationRequests();
  }

  // Approve cancellation request
  approveRequest(request: CancellationResponse): void {
    const confirmed = window.confirm(
      `Are you sure you want to approve the cancellation request from ${request.studentName}?`,
    );

    if (!confirmed) {
      return;
    }

    this.reviewRequest(request.cancellationRequestId, true);
  }

  // Reject cancellation request
  rejectRequest(request: CancellationResponse): void {
    const confirmed = window.confirm(
      `Are you sure you want to reject the cancellation request from ${request.studentName}?`,
    );

    if (!confirmed) {
      return;
    }

    this.reviewRequest(request.cancellationRequestId, false);
  }

  // Process approval or rejection
  private reviewRequest(id: number, approve: boolean): void {
    this.processingId.set(id);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      adminRemarks: '',
    };

    const action = approve
      ? this.cancellationService.approveCancellationRequest(id, request)
      : this.cancellationService.rejectCancellationRequest(id, request);

    action.subscribe({
      next: () => {
        this.successMessage.set(
          approve
            ? 'Cancellation request approved successfully.'
            : 'Cancellation request rejected successfully.',
        );

        this.processingId.set(null);
        this.loadCancellationRequests();
      },
      error: (error) => {
        console.error('Error reviewing cancellation request:', error);

        this.errorMessage.set(
          error.error?.message || 'Unable to process the cancellation request.',
        );

        this.processingId.set(null);
      },
    });
  }

  // Previous page
  previousPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadCancellationRequests();
    }
  }

  // Next page
  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadCancellationRequests();
    }
  }

  // Change page size
  changePageSize(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadCancellationRequests();
  }

  // Get status text
  getStatusLabel(status: number): string {
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

  // Get status CSS class
  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-pending';

      case 1:
        return 'status-approved';

      case 2:
        return 'status-rejected';

      default:
        return '';
    }
  }
}
