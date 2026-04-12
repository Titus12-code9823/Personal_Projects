import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isAuthPage(): boolean {
    const routePath = this.getCurrentPath();
    return routePath === '/login' || routePath === '/forgot-password' || routePath === '/reset-password';
  }

  get currentPageName(): string {
    const routePath = this.getCurrentPath();

    if (routePath === '/login') {
      return 'Login';
    }

    if (routePath === '/forgot-password') {
      return 'Forgot Password';
    }

    if (routePath === '/reset-password') {
      return 'Reset Password';
    }

    if (routePath === '/posts/new') {
      return 'Postare Nouă';
    }

    if (routePath.startsWith('/posts/')) {
      return 'Detalii Postare';
    }

    if (routePath === '/posts' || routePath === '/') {
      return 'Postări';
    }

    if (routePath === '/profile') {
      return 'Profil';
    }

    return 'Instagram Clone';
  }

  private getCurrentPath(): string {
    return this.router.url.split('?')[0];
  }
}
