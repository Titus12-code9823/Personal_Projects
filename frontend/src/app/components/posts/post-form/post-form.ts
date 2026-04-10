import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post/post.service';
import { PostRequest } from '../../../models/post-request.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css'
})
export class PostFormComponent {
  title = '';
  text = '';
  imageUrl = '';
  loading = false;
  error = '';

  constructor(
    private readonly postService: PostService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (!this.title.trim() || !this.text.trim() || !this.imageUrl.trim()) {
      this.error = 'Title, text și imageUrl sunt obligatorii.';
      return;
    }

    const request: PostRequest = {
      title: this.title.trim(),
      text: this.text.trim(),
      imageUrl: this.imageUrl.trim()
    };

    this.loading = true;
    this.error = '';

    this.postService.createPost(request).subscribe({
      next: (createdPost) => {
        this.loading = false;
        this.router.navigate(['/posts', createdPost.id]);
      },
      error: () => {
        this.error = 'Nu am putut crea postarea.';
        this.loading = false;
      }
    });
  }
}
