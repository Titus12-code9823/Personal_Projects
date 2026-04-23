import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Post } from '../../models/post.model';
import { PostRequest } from '../../models/post-request.model';
import { UserResponse } from '../../models/user.model';
import { PostService } from '../../services/post/post.service';
import { UserService } from '../../services/user/user';
import { AuthService } from '../../services/auth/auth';

interface ProfileUser {
  id: number;
  name: string;
  avatarUrl: string;
  description: string;
  score: number;
  role: 'Moderator' | 'User';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  isLoggedIn = false;
  user: ProfileUser | null = null;
  currentUser: UserResponse | null = null;
  userPosts: Post[] = [];
  loading = false;
  error = '';
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  contextTargetPost: Post | null = null;
  editingPostId: number | null = null;
  editTitle = '';
  editText = '';
  editImageUrl = '';
  editLoading = false;
  editError = '';
  showAvatarEditor = false;
  avatarDraftUrl = '';
  avatarSaving = false;
  avatarError = '';

  private readonly fallbackAvatarUrl = 'https://via.placeholder.com/200x200.png?text=Avatar';

  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) {
      this.resetProfileState();
      return;
    }

    this.loadProfileData();
  }

  trackByPostId(_: number, post: Post): number {
    return post.id;
  }

  openPostContextMenu(event: MouseEvent, post: Post): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextTargetPost = post;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuVisible = true;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContextMenu();
  }

  startEditFromContextMenu(): void {
    if (!this.contextTargetPost) {
      return;
    }

    this.editingPostId = this.contextTargetPost.id;
    this.editTitle = this.contextTargetPost.title;
    this.editText = this.contextTargetPost.text;
    this.editImageUrl = this.contextTargetPost.imageUrl;
    this.editError = '';
    this.closeContextMenu();
  }

  cancelInlineEdit(): void {
    this.editingPostId = null;
    this.editTitle = '';
    this.editText = '';
    this.editImageUrl = '';
    this.editError = '';
  }

  openAvatarEditor(): void {
    if (!this.currentUser) {
      return;
    }

    this.showAvatarEditor = true;
    this.avatarError = '';
    this.avatarDraftUrl = this.currentUser.avatarUrl?.trim() || '';
  }

  cancelAvatarEditor(): void {
    this.showAvatarEditor = false;
    this.avatarError = '';
    this.avatarDraftUrl = '';
    this.avatarSaving = false;
  }

  saveAvatar(): void {
    if (this.avatarSaving || !this.currentUser || !this.user) {
      return;
    }

    const nextAvatarUrl = this.avatarDraftUrl.trim();
    if (!nextAvatarUrl) {
      this.avatarError = 'Introdu un link de imagine pentru avatar.';
      return;
    }

    if (!nextAvatarUrl.startsWith('http://') && !nextAvatarUrl.startsWith('https://')) {
      this.avatarError = 'Avatar URL trebuie să înceapă cu http:// sau https://';
      return;
    }

    this.avatarSaving = true;
    this.avatarError = '';

    const previousAvatar = this.currentUser.avatarUrl ?? '';

    this.currentUser = {
      ...this.currentUser,
      avatarUrl: nextAvatarUrl
    };
    this.user = {
      ...this.user,
      avatarUrl: nextAvatarUrl
    };

    this.userService.updateUser(this.currentUser.id, {
      username: this.currentUser.username,
      email: this.currentUser.email,
      password: '',
      phoneNumber: this.currentUser.phoneNumber || '',
      avatarUrl: nextAvatarUrl,
      description: this.currentUser.description || ''
    }).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.user = this.buildProfileUser(updatedUser.id, updatedUser, this.userPosts);
        this.avatarSaving = false;
        this.cancelAvatarEditor();
      },
      error: () => {
        if (this.currentUser && this.user) {
          this.currentUser = {
            ...this.currentUser,
            avatarUrl: previousAvatar
          };
          this.user = {
            ...this.user,
            avatarUrl: previousAvatar || this.fallbackAvatarUrl
          };
        }
        this.avatarSaving = false;
        this.avatarError = 'Nu am putut actualiza avatarul. Încearcă din nou.';
      }
    });
  }

  saveEditedPost(post: Post): void {
    if (this.editLoading) {
      return;
    }

    const title = this.editTitle.trim();
    const text = this.editText.trim();
    const imageUrl = this.editImageUrl.trim();

    if (!title || !text || !imageUrl) {
      this.editError = 'Title, text și imageUrl sunt obligatorii.';
      return;
    }

    this.editLoading = true;
    this.editError = '';

    const previousPost = this.userPosts.find((existingPost) => existingPost.id === post.id);
    if (!previousPost) {
      this.editLoading = false;
      this.editError = 'Postarea selectată nu a fost găsită.';
      return;
    }

    const optimisticPost: Post = {
      ...previousPost,
      title,
      text,
      imageUrl,
      updatedAt: new Date().toISOString()
    };

    this.userPosts = this.userPosts.map((existingPost) =>
      existingPost.id === post.id ? optimisticPost : existingPost
    );
    this.cancelInlineEdit();

    const request: PostRequest = { title, text, imageUrl };
    this.postService.updatePost(post.id, request).subscribe({
      next: (updatedPost) => {
        this.userPosts = this.userPosts.map((existingPost) =>
          existingPost.id === updatedPost.id ? updatedPost : existingPost
        );
        this.editLoading = false;
      },
      error: () => {
        this.userPosts = this.userPosts.map((existingPost) =>
          existingPost.id === previousPost.id ? previousPost : existingPost
        );
        this.editLoading = false;
        this.error = 'Nu am putut salva modificările postării.';
      }
    });
  }

  deleteFromContextMenu(): void {
    if (!this.contextTargetPost) {
      return;
    }

    const targetPostId = this.contextTargetPost.id;
    const previousPosts = [...this.userPosts];
    this.closeContextMenu();

    const confirmed = confirm('Sigur vrei să ștergi această postare?');
    if (!confirmed) {
      return;
    }

    this.error = '';
    this.userPosts = this.userPosts.filter((post) => post.id !== targetPostId);
    if (this.editingPostId === targetPostId) {
      this.cancelInlineEdit();
    }

    this.postService.deletePost(targetPostId).subscribe({
      next: () => {},
      error: () => {
        this.userPosts = previousPosts;
        this.error = 'Nu am putut șterge postarea selectată.';
      }
    });
  }

  private closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  private loadProfileData(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    console.log('--- STARTING PROFILE LOAD ---');

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('1. User data fetched:', user);
        if (!user || user.id == null) {
          this.handleLoadError('Nu am primit datele utilizatorului.');
          return;
        }
        
        this.user = this.buildProfileUser(user.id, user, []);
        this.currentUser = user;
        this.cdr.detectChanges(); 
        
        console.log('2. Fetching posts for user:', user.id);
        this.postService.getMyPosts().subscribe({
          next: (posts) => {
            console.log('3. Posts fetched. Count:', posts ? posts.length : 0);
            const safePosts = Array.isArray(posts) ? posts : [];
            this.userPosts = safePosts;
            this.user = this.buildProfileUser(user.id, user, this.userPosts);
            
            this.loading = false;
            this.cdr.detectChanges(); // UI Update
            console.log('--- PROFILE LOAD SUCCESS ---');
          },
          error: (err) => {
            console.error('Eroare postari:', err);
            this.error = 'Nu am putut încărca postările tale. Fă logout și login din nou.';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Eroare utilizator:', err);
        this.handleLoadError('Eșec comunicație. Te rog reautentifică-te.');
      }
    });
  }

  private handleLoadError(msg: string): void {
    this.loading = false;
    this.error = msg;
    this.resetProfileState();
    localStorage.removeItem('profile-user-id');
    this.cdr.detectChanges();
  }

  private resetProfileState(): void {
    this.loading = false;
    this.error = '';
    this.user = null;
    this.userPosts = [];
    this.contextMenuVisible = false;
    this.contextTargetPost = null;
    this.currentUser = null;
    this.cancelAvatarEditor();
    this.cancelInlineEdit();
  }

  private buildProfileUser(userId: number, user: UserResponse | null, posts: Post[]): ProfileUser {
    const postCount = Array.isArray(posts) ? posts.filter((post) => post.userId === userId).length : 0;

    const safeUsername = user?.username || `User #${userId}`;
    const safeAvatarUrl = typeof user?.avatarUrl === 'string' && user.avatarUrl.trim() !== '' ? user.avatarUrl.trim() : this.fallbackAvatarUrl;
    const safeDescription = typeof user?.description === 'string' ? user.description.trim() : 'No description yet.';
    const safeScore = typeof user?.score === 'number' ? user.score : postCount * 10;
    const safeRole = user?.isModerator ? 'Moderator' : 'User';

    return {
      id: userId,
      name: safeUsername,
      avatarUrl: safeAvatarUrl,
      description: safeDescription,
      score: safeScore,
      role: safeRole
    };
  }
}

