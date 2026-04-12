import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { UserResponse } from '../../models/user.model';

interface UpdateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  avatarUrl: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = 'http://localhost:8080/users';
  private readonly requestTimeoutMs = 10000;

  constructor(private readonly http: HttpClient) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl).pipe(timeout(this.requestTimeoutMs));
  }

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(timeout(this.requestTimeoutMs));
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`).pipe(timeout(this.requestTimeoutMs));
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}`, request).pipe(timeout(this.requestTimeoutMs));
  }
}
