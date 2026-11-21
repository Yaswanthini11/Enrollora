import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../course.service';
import { CourseResponse, SaveCourseRequest } from '../course.models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);

  courses = signal<CourseResponse[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);
  totalPages = signal(0);

  showForm = signal(false);
  isSaving = signal(false);
  editingCourseId = signal<number | null>(null);
  formErrorMessage = signal('');

  course: SaveCourseRequest = this.emptyCourse();

  ngOnInit(): void {
    this.loadCourses();
  }

  emptyCourse(): SaveCourseRequest {
    return {
      courseName: '',
      duration: '',
      fees: 0,
      capacity: 1,
      isActive: true,
    };
  }

  openAddForm(): void {
    this.course = this.emptyCourse();
    this.editingCourseId.set(null);
    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
    this.showForm.set(true);
  }

  openEditForm(course: CourseResponse): void {
    this.formErrorMessage.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    this.courseService.getCourseById(course.courseId).subscribe({
      next: (response) => {
        this.course = {
          courseName: response.courseName,
          duration: response.duration,
          fees: response.fees,
          capacity: response.capacity,
          isActive: response.isActive,
        };

        this.editingCourseId.set(response.courseId);
        this.showForm.set(true);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.errorMessage.set('Unable to load course details.');
      },
    });
  }


deactivateCourse(course: CourseResponse): void {
  const confirmed = window.confirm(
    `Are you sure you want to deactivate ${course.courseName}?`
  );

  if (!confirmed) {
    return;
  }

  this.errorMessage.set('');
  this.successMessage.set('');

  this.courseService.deactivateCourse(course.courseId).subscribe({
    next: () => {
      this.successMessage.set(
        `${course.courseName} deactivated successfully!`
      );

      this.loadCourses();
    },
    error: (error) => {
      console.error('Error deactivating course:', error);

      this.errorMessage.set(
        error.error?.message || 'Unable to deactivate course.'
      );
    },
  });
}

  closeForm(): void {
    this.showForm.set(false);
    this.editingCourseId.set(null);
    this.formErrorMessage.set('');
  }

  saveCourse(): void {
    this.formErrorMessage.set('');

    if (!this.course.courseName.trim() || !this.course.duration.trim()) {
      this.formErrorMessage.set('Please enter course name and duration.');
      return;
    }

    if (this.course.fees < 0 || this.course.capacity < 1) {
      this.formErrorMessage.set(
        'Fees cannot be negative and capacity must be at least 1.'
      );
      return;
    }

    const request: SaveCourseRequest = {
      ...this.course,
      courseName: this.course.courseName.trim(),
      duration: this.course.duration.trim(),
    };

    this.isSaving.set(true);

    const courseId = this.editingCourseId();

    const saveRequest = courseId === null
      ? this.courseService.createCourse(request)
      : this.courseService.updateCourse(courseId, request);

    saveRequest.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showForm.set(false);

        this.successMessage.set(
          courseId === null
            ? 'Course added successfully!'
            : 'Course updated successfully!'
        );

        this.editingCourseId.set(null);
        this.loadCourses();
      },
      error: (error) => {
        console.error('Error saving course:', error);
        this.isSaving.set(false);
        this.formErrorMessage.set(
          error.error?.message || 'Unable to save course. Please try again.'
        );
      },
    });
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.courseService.getCourses(this.pageNumber(), this.pageSize()).subscribe({
      next: (response) => {
        this.courses.set(response.items);
        this.totalRecords.set(response.totalRecords);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage.set('Unable to load courses.');
        this.isLoading.set(false);
      },
    });
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update(page => page + 1);
      this.loadCourses();
    }
  }

  previousPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update(page => page - 1);
      this.loadCourses();
    }
  }
}
