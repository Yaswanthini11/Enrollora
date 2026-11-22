
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../core/auth/auth.models';

type LoginRole = 'Student' | 'Administrator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  selectedRole: LoginRole = 'Student';

  loginRequest: LoginRequest = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';

  selectRole(role: LoginRole): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(
      this.loginRequest,
      this.selectedRole
    ).subscribe({

      next: (response) => {
        this.isLoading = false;

        if (response.role === 'Administrator') {
          this.router.navigate(['/admin/dashboard']);
        } 
        else if (response.role === 'Student') {
          this.router.navigate(['/student/dashboard']);
        }
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.errorMessage =
          error.error?.detail ||
          error.error?.message ||
          error.message ||
          'Something went wrong. Please try again.';

        this.isLoading = false;
      },

    });
  }
}
