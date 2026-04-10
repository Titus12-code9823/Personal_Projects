import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Comment } from '../../models/comment.model';
import { CommentRequest } from '../../models/comment-request.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = 'http://localhost:8080/comments';
  private readonly requestTimeoutMs = 10000;

  constructor(private readonly http: HttpClient) {}

  getAllComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.baseUrl).pipe(timeout(this.requestTimeoutMs));
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    const params = new HttpParams().set('postId', String(postId));
    return this.http.get<Comment[]>(this.baseUrl, { params }).pipe(timeout(this.requestTimeoutMs));
  }

  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.baseUrl}/${id}`).pipe(timeout(this.requestTimeoutMs));
  }

  createComment(request: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, request).pipe(timeout(this.requestTimeoutMs));
  }

  updateComment(id: number, request: CommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${id}`, request).pipe(timeout(this.requestTimeoutMs));
  }

  deleteComment(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(timeout(this.requestTimeoutMs));
  }
}
