
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { StudentResponse } from '../../admin/students/student.models';
import { StudentService } from '../../admin/students/student.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private cdr = inject(ChangeDetectorRef);

  student: StudentResponse | null = null;

  isLoading = false;
  isSaving = false;

  successMessage = '';
  errorMessage = '';

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    department: ['', Validators.required],
    age: [18, [Validators.required, Validators.min(1), Validators.max(100)]],
    cgpa: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getMyProfile().subscribe({
      next: (response: StudentResponse) => {
        console.log('Profile API Response:', response);

        this.student = response;

        this.profileForm.patchValue({
          name: response.name,
          department: response.department,
          age: response.age,
          cgpa: response.cgpa,
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Profile API Error:', error);

        this.errorMessage =
          error.error?.message || 'Unable to load your profile.';

        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formValue = this.profileForm.getRawValue();

    this.studentService.updateMyProfile({
      name: formValue.name ?? '',
      department: formValue.department ?? '',
      age: Number(formValue.age),
      cgpa: Number(formValue.cgpa),
    }).subscribe({
      next: (response: StudentResponse) => {
        this.student = response;

        this.profileForm.patchValue({
          name: response.name,
          department: response.department,
          age: response.age,
          cgpa: response.cgpa,
        });

        this.successMessage = 'Profile updated successfully.';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.error?.message || 'Unable to update your profile.';

        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  get statusText(): string {
    return this.student ? String(this.student.status) : '';
  }
}
