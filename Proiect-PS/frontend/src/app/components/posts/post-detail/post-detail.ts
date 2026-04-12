import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PostService } from '../../../services/post/post.service';
import { CommentService } from '../../../services/comment/comment.service';
import { Post } from '../../../models/post.model';
import { Comment } from '../../../models/comment.model';
import { CommentFormComponent } from '../../../components/comments/comment-form/comment-form';
import { CommentListComponent } from '../../../components/comments/comment-list/comment-list';
import { PostRequest } from '../../../models/post-request.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CommentFormComponent, CommentListComponent],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css'
})
export class PostDetailComponent implements OnInit {
  postId: number | null = null;
  post: Post | null = null;
  comments: Comment[] = [];
  loading = false;
  commentsLoading = false;
  error = '';
  postLiked = false;

  isEditing = false;
  editTitle = '';
  editText = '';
  editImageUrl = '';
  editLoading = false;
  editError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly postService: PostService,
    private readonly commentService: CommentService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(id)) {
      this.postId = id;
      this.loadPost(id);
      this.loadComments(id);
    } else {
      this.error = 'Postarea nu a fost găsită.';
    }
  }

  loadPost(id: number): void {
    this.loading = true;
    this.postService.getPostById(id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (post) => {
        this.post = post;
        this.postLiked = this.readPostLike(post.id);
        this.editTitle = post.title;
        this.editText = post.text;
        this.editImageUrl = post.imageUrl;
      },
      error: () => {
        this.error = 'Nu am putut încărca postarea.';
      }
    });
  }

  loadComments(postId: number): void {
    this.commentsLoading = true;
    this.commentService.getCommentsByPostId(postId).pipe(
      finalize(() => {
        this.commentsLoading = false;
      })
    ).subscribe({
      next: (comments) => {
        this.comments = comments.map((comment) => ({
          ...comment,
          liked: this.readCommentLike(comment.id)
        }));
      },
      error: () => {
        this.error = 'Nu am putut încărca comentariile.';
      }
    });
  }

  onCommentCreated(): void {
    if (this.postId !== null) {
      this.loadComments(this.postId);
    }
  }

  onCommentChanged(): void {
    if (this.postId !== null) {
      this.loadComments(this.postId);
    }
  }

  togglePostLike(): void {
    if (!this.post) return;
    this.postLiked = !this.postLiked;
    this.writePostLike(this.post.id, this.postLiked);
  }

  onCommentLikeToggled(comment: Comment): void {
    this.comments = this.comments.map((existingComment) =>
      existingComment.id === comment.id ? comment : existingComment
    );
    this.writeCommentLike(comment.id, !!comment.liked);
  }

  startEdit(): void {
    if (!this.post) return;
    this.isEditing = true;
    this.editError = '';
    this.editTitle = this.post.title;
    this.editText = this.post.text;
    this.editImageUrl = this.post.imageUrl;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editError = '';
    if (this.post) {
      this.editTitle = this.post.title;
      this.editText = this.post.text;
      this.editImageUrl = this.post.imageUrl;
    }
  }

  saveEdit(): void {
    if (!this.post) return;

    if (!this.editTitle.trim() || !this.editText.trim() || !this.editImageUrl.trim()) {
      this.editError = 'Title, text și imageUrl sunt obligatorii.';
      return;
    }

    const request: PostRequest = {
      title: this.editTitle.trim(),
      text: this.editText.trim(),
      imageUrl: this.editImageUrl.trim()
    };

    this.editLoading = true;
    this.editError = '';

    this.postService.updatePost(this.post.id, request).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
        this.isEditing = false;
        this.editLoading = false;
      },
      error: () => {
        this.editError = 'Nu am putut salva modificările.';
        this.editLoading = false;
      }
    });
  }

  deletePost(): void {
    if (!this.post) return;

    const confirmed = confirm('Sigur vrei să ștergi această postare?');
    if (!confirmed) return;

    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.router.navigate(['/posts']);
      },
      error: () => {
        this.error = 'Nu am putut șterge postarea.';
      }
    });
  }

  private readPostLike(postId: number): boolean {
    return localStorage.getItem(`post-like-${postId}`) === '1';
  }

  private writePostLike(postId: number, liked: boolean): void {
    localStorage.setItem(`post-like-${postId}`, liked ? '1' : '0');
  }

  private readCommentLike(commentId: number): boolean {
    return localStorage.getItem(`comment-like-${commentId}`) === '1';
  }

  private writeCommentLike(commentId: number, liked: boolean): void {
    localStorage.setItem(`comment-like-${commentId}`, liked ? '1' : '0');
  }
}
