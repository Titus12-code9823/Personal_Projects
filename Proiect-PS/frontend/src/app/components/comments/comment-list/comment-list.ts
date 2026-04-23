import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../models/comment.model';
import { CommentService } from '../../../services/comment/comment.service';
import { CommentRequest } from '../../../models/comment-request.model';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.css'
})
export class CommentListComponent {
  @Input() comments: Comment[] = [];
  @Output() commentChanged = new EventEmitter<void>();
  @Output() commentLikeToggled = new EventEmitter<Comment>();

  editingCommentId: number | null = null;
  editText = '';
  editImageUrl = '';
  editLoading = false;
  editError = '';

  constructor(private readonly commentService: CommentService) {}

  trackByCommentId(_: number, comment: Comment): number {
    return comment.id;
  }

  startEdit(comment: Comment): void {
    this.editingCommentId = comment.id;
    this.editText = comment.text;
    this.editImageUrl = comment.imageUrl ?? '';
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editText = '';
    this.editImageUrl = '';
    this.editError = '';
  }

  saveEdit(comment: Comment): void {
    if (!this.editText.trim()) {
      this.editError = 'Textul comentariului este obligatoriu.';
      return;
    }

    const request: CommentRequest = {
      postId: comment.postId,
      text: this.editText.trim(),
      imageUrl: this.editImageUrl.trim() || null
    };

    this.editLoading = true;
    this.editError = '';

    this.commentService.updateComment(comment.id, request).subscribe({
      next: () => {
        this.editLoading = false;
        this.cancelEdit();
        this.commentChanged.emit();
      },
      error: () => {
        this.editError = 'Nu am putut salva comentariul.';
        this.editLoading = false;
      }
    });
  }

  deleteComment(comment: Comment): void {
    const confirmed = confirm('Sigur vrei să ștergi acest comentariu?');
    if (!confirmed) return;

    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.commentChanged.emit();
      },
      error: () => {
        this.editError = 'Nu am putut șterge comentariul.';
      }
    });
  }

  toggleLike(comment: Comment): void {
    const liked = !comment.liked;
    const updatedComment: Comment = {
      ...comment,
      liked,
      voteCount: liked ? comment.voteCount + 1 : Math.max(comment.voteCount - 1, 0)
    };
    this.commentLikeToggled.emit(updatedComment);
  }
}
