
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LoginRequest,
  LoginResponse,
  RegisterStudentRequest,
  ApiMessage
} from './auth.models';

import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  private apiUrl = `${environment.apiUrl}/auth`;

  login(
    request: LoginRequest,
    expectedRole: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      request
    ).pipe(
      map((response) => {
        if (response.role !== expectedRole) {
          throw new Error(
            'Please select the correct login type for this account.'
          );
        }

        return response;
      }),

      tap((response) => {
        this.tokenService.setToken(response.token);
        this.tokenService.setRole(response.role);
      }),
    );
  }

  register(request: RegisterStudentRequest): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    this.tokenService.removeToken();
  }
}
