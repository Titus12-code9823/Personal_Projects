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
}
