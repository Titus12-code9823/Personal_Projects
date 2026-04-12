import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, timeout } from 'rxjs/operators';
import { UserResponse } from '../../models/user.model';
import { ForgotPasswordResponse } from '../../models/forgot-password-response.model';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  userId: number;
  username: string;
}

interface CreateAccountRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  avatarUrl?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080';
  private readonly requestTimeoutMs = 10000;
  private readonly authTokenStorageKey = 'auth-token';
  private readonly authUsernameStorageKey = 'auth-username';
  private readonly sessionExpiryStorageKey = 'auth-session-expiry';
  private readonly sessionDurationMs = 24 * 60 * 60 * 1000;

  constructor(private readonly http: HttpClient) {}

  startSession(token: string, username: string, userId: number, expiresAt?: string): void {
    this.persistSession(token, username.trim(), userId, expiresAt);
  }

  login(username: string, password: string): Observable<void> {
    const sanitizedUsername = username.trim();

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, {
        username: sanitizedUsername,
        password
      })
      .pipe(
        timeout(15000),
        tap((loginResponse) => {
          if (!loginResponse?.accessToken || !loginResponse.userId) {
            throw new Error('Raspuns invalid primit de la server.');
          }

          this.persistSession(
            loginResponse.accessToken,
            loginResponse.username || sanitizedUsername,
            loginResponse.userId,
            loginResponse.expiresAt
          );
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    localStorage.removeItem(this.authTokenStorageKey);
    localStorage.removeItem(this.authUsernameStorageKey);
    localStorage.removeItem(this.sessionExpiryStorageKey);
    localStorage.removeItem('profile-user-id');
  }

  getAuthorizationHeader(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const authToken = localStorage.getItem(this.authTokenStorageKey);
    return authToken ? `Bearer ${authToken}` : null;
  }

  isLoggedIn(): boolean {
    const authToken = localStorage.getItem(this.authTokenStorageKey);
    const expiryRaw = localStorage.getItem(this.sessionExpiryStorageKey);

    if (!authToken || !expiryRaw) {
      this.logout();
      return false;
    }

    const expiry = Number(expiryRaw);
    if (!Number.isFinite(expiry) || Date.now() >= expiry) {
      this.logout();
      return false;
    }

    return true;
  }

  requestPasswordReset(email: string): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ForgotPasswordResponse>(`${this.baseUrl}/auth/forgot-password`, { email })
      .pipe(timeout(this.requestTimeoutMs));
  }

  register(request: CreateAccountRequest): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.baseUrl}/users`, request)
      .pipe(timeout(this.requestTimeoutMs));
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/auth/reset-password`, { token, newPassword })
      .pipe(timeout(this.requestTimeoutMs));
  }

  private persistSession(authToken: string, username: string, userId: number, expiresAt?: string): void {
    const resolvedExpiry = this.resolveSessionExpiry(expiresAt);

    localStorage.setItem(this.authTokenStorageKey, authToken);
    localStorage.setItem(this.authUsernameStorageKey, username);
    localStorage.setItem(this.sessionExpiryStorageKey, String(resolvedExpiry));
    localStorage.setItem('profile-user-id', String(userId));
  }

  private resolveSessionExpiry(expiresAt?: string): number {
    if (expiresAt) {
      const parsed = Date.parse(expiresAt);
      if (Number.isFinite(parsed) && parsed > Date.now()) {
        return parsed;
      }
    }

    return Date.now() + this.sessionDurationMs;
  }
}

