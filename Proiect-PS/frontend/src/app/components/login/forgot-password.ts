import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="forgot-password-page">
      <section class="forgot-password-card">
        <h1>Resetează Parola</h1>
        <p>Introduceți email-ul asociat contului dvs.</p>

        @if (error) {
          <div class="state-box error">{{ error }}</div>
        }

        @if (success) {
          <div class="state-box success">{{ success }}</div>
        }

        @if (!success) {
          <form (ngSubmit)="submit()" class="forgot-password-form">
            <label>
              Email
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                autocomplete="email"
                [disabled]="loading"
              />
            </label>

            <button type="submit" [disabled]="loading">
              {{ loading ? 'Se trimite...' : 'Trimite Link de Resetare' }}
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
    .forgot-password-page {
      min-height: calc(100dvh - 140px);
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .forgot-password-card {
      width: min(420px, 100%);
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    }

    .forgot-password-card h1 {
      margin: 0 0 8px;
    }

    .forgot-password-card > p {
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

    .forgot-password-form {
      display: grid;
      gap: 12px;
    }

    .forgot-password-form label {
      display: grid;
      gap: 6px;
    }

    .forgot-password-form input {
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
    }

    .forgot-password-form button {
      margin-top: 8px;
      border: 0;
      border-radius: 10px;
      padding: 10px 14px;
      background: #111827;
      color: #fff;
      cursor: pointer;
    }

    .forgot-password-form button:disabled {
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
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    const sanitizedEmail = this.email.trim();

    if (!sanitizedEmail) {
      this.error = 'Email-ul este obligatoriu.';
      return;
    }

    if (!this.isValidEmail(sanitizedEmail)) {
      this.error = 'Introduceți o adresă de email validă.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.requestPasswordReset(sanitizedEmail).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Cererea a fost procesată. Redirecționare către resetarea parolei...';
        this.email = '';
        const resetToken = response.resetToken?.trim();
        if (!resetToken) {
          this.success = '';
          this.error = 'Nu s-a putut genera token-ul de resetare. Încearcă din nou.';
          return;
        }

        setTimeout(() => {
          this.router.navigate(['/reset-password'], {
            queryParams: { token: resetToken }
          });
        }, 1000);
      },
      error: () => {
        this.loading = false;
        this.error = 'Nu s-a putut procesa cererea. Verifică email-ul și încearcă din nou.';
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
