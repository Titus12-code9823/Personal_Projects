import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Post } from '../../models/post.model';
import { PostRequest } from '../../models/post-request.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly baseUrl = 'http://localhost:8080/posts';
  private readonly requestTimeoutMs = 10000;

  constructor(private readonly http: HttpClient) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl).pipe(timeout(this.requestTimeoutMs));
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${id}`).pipe(timeout(this.requestTimeoutMs));
  }

  createPost(request: PostRequest): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, request).pipe(timeout(this.requestTimeoutMs));
  }

  updatePost(id: number, request: PostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.baseUrl}/${id}`, request).pipe(timeout(this.requestTimeoutMs));
  }

  deletePost(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).pipe(timeout(this.requestTimeoutMs));
  }
}
