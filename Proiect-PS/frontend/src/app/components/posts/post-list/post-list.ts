import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../services/post/post.service';
import { Post } from '../../../models/post.model';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css'
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error = '';
  likedPosts: Record<number, boolean> = {};

  constructor(private readonly postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = '';

    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.likedPosts = posts.reduce<Record<number, boolean>>((acc, post) => {
          acc[post.id] = localStorage.getItem(`post-like-${post.id}`) === '1';
          return acc;
        }, {});
        this.loading = false;
      },
      error: () => {
        this.error = 'Nu am putut încărca postările.';
        this.loading = false;
      }
    });
  }

  trackByPostId(_: number, post: Post): number {
    return post.id;
  }

  toggleLike(postId: number): void {
    const nextValue = !this.likedPosts[postId];
    this.likedPosts[postId] = nextValue;
    localStorage.setItem(`post-like-${postId}`, nextValue ? '1' : '0');
  }
}
