import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../services/comment/comment.service';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.css'
})
export class CommentFormComponent {
  @Input() postId!: number;
  @Output() commentCreated = new EventEmitter<void>();

  text = '';
  imageUrl = '';
  loading = false;
  error = '';

  constructor(private readonly commentService: CommentService) {}

  submit(): void {
    if (!this.text.trim()) {
      this.error = 'Textul comentariului este obligatoriu.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.commentService.createComment({
      postId: this.postId,
      text: this.text,
      imageUrl: this.imageUrl.trim() || null
    }).subscribe({
      next: () => {
        this.text = '';
        this.imageUrl = '';
        this.loading = false;
        this.commentCreated.emit();
      },
      error: () => {
        this.error = 'Nu am putut adăuga comentariul.';
        this.loading = false;
      }
    });
  }
}
