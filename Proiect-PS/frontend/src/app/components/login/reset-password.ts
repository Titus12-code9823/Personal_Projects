import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="reset-password-page">
      <section class="reset-password-card">
        <h1>Resetează Parola</h1>
        <p>Introduceți noua parola dorită.</p>

        @if (error) {
          <div class="state-box error">{{ error }}</div>
        }

        @if (success) {
          <div class="state-box success">{{ success }}</div>
        }

        @if (!success) {
          <form (ngSubmit)="submit()" class="reset-password-form">
            <label>
              Parola Nouă
              <input
                type="password"
                name="newPassword"
                [(ngModel)]="newPassword"
                autocomplete="new-password"
                [disabled]="loading"
              />
            </label>

            <label>
              Confirmă Parola
              <input
                type="password"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                autocomplete="new-password"
                [disabled]="loading"
              />
            </label>

            <button type="submit" [disabled]="loading">
              {{ loading ? 'Se resetează...' : 'Resetează Parola' }}
            </button>
          </form>
        }

        <div class="links-container">
          <a routerLink="/login" class="back-link">Înapoi la Login</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .reset-password-page {
      min-height: calc(100dvh - 140px);
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .reset-password-card {
      width: min(420px, 100%);
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    }

    .reset-password-card h1 {
      margin: 0 0 8px;
    }

    .reset-password-card > p {
      margin: 0 0 16px;
      color: #4b5563;
    }

    .state-box {
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 14px;
    }

    .state-box.error {
      background: #ffe7e7;
      color: #9b1c1c;
    }

    .state-box.success {
      background: #e7ffe7;
      color: #1c9b1c;
    }

    .reset-password-form {
      display: grid;
      gap: 12px;
    }

    .reset-password-form label {
      display: grid;
      gap: 6px;
    }

    .reset-password-form input {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
    }

    .reset-password-form button {
      margin-top: 8px;
      border: 0;
      border-radius: 10px;
      padding: 10px 14px;
      background: #111827;
      color: #fff;
      cursor: pointer;
    }

    .reset-password-form button:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }

    .links-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .back-link {
      display: inline-block;
      text-decoration: none;
      color: #2563eb;
      font-size: 0.9rem;
    }

    .back-link:hover {
      text-decoration: underline;
    }
  `]
})
export class ResetPasswordComponent {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';
  token: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  submit(): void {
    if (!this.token) {
      this.error = 'Token de resetare invalid sau expirat.';
      return;
    }

    const sanitizedPassword = this.newPassword.trim();
    const sanitizedConfirmPassword = this.confirmPassword.trim();

    if (!sanitizedPassword || !sanitizedConfirmPassword) {
      this.error = 'Ambele câmpuri sunt obligatorii.';
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      this.error = 'Parolele nu se potrivesc.';
      return;
    }

    if (sanitizedPassword.length < 6) {
      this.error = 'Parola trebuie să aibă cel puțin 6 caractere.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.resetPassword(this.token, sanitizedPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Parola a fost resetată cu succes. Redirecționare către login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: () => {
        this.loading = false;
        this.error = 'Nu s-a putut reseta parola. Încearcă din nou sau cere o nouă resetare.';
      }
    });
  }
}
