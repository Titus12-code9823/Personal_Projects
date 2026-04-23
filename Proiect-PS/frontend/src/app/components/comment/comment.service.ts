import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { CommentRequest } from '../../models/comment-request.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = 'http://localhost:8080/comments';

  constructor(private readonly http: HttpClient) {}

  getAllComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.baseUrl);
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    const params = new HttpParams().set('postId', postId);
    return this.http.get<Comment[]>(this.baseUrl, { params });
  }

  getCommentById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.baseUrl}/${id}`);
  }

  createComment(request: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, request);
  }

  updateComment(id: number, request: CommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${id}`, request);
  }

  deleteComment(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
