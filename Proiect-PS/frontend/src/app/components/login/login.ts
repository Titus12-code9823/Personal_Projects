import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  isRegisterMode = false;

  username = '';
  password = '';
  registerUsername = '';
  registerEmail = '';
  registerPhoneNumber = '';
  registerPassword = '';
  registerConfirmPassword = '';

  loading = false;
  error = '';
  success = '';
  private readonly uiSafetyTimeoutMs = 10000;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    }
  }

  submit(): void {
    if (this.loading) {
      return;
    }

    const sanitizedUsername = this.username.trim();
    const sanitizedPassword = this.password.trim();

    if (!sanitizedUsername || !sanitizedPassword) {
      this.error = 'Username și parola sunt obligatorii.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    const uiWatchdog = window.setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        if (!this.error) {
          this.error = 'Autentificarea durează prea mult. Încearcă din nou.';
        }
        this.cdr.detectChanges();
      }
    }, this.uiSafetyTimeoutMs);

    this.authService.login(sanitizedUsername, sanitizedPassword)
      .pipe(finalize(() => {
        clearTimeout(uiWatchdog);
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.error = 'Autentificare eșuată. Verifică datele introduse.';
        this.cdr.detectChanges();
      }
    });
  }

  switchToRegister(): void {
    this.isRegisterMode = true;
    this.error = '';
    this.success = '';
  }

  switchToLogin(): void {
    this.isRegisterMode = false;
    this.error = '';
    this.success = '';
  }

  submitRegister(): void {
    if (this.loading) {
      return;
    }

    const username = this.registerUsername.trim();
    const email = this.registerEmail.trim();
    const phoneNumber = this.registerPhoneNumber.trim();
    const password = this.registerPassword.trim();
    const confirmPassword = this.registerConfirmPassword.trim();

    if (!username || !email || !password || !confirmPassword) {
      this.error = 'Completează toate câmpurile pentru crearea contului.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.error = 'Adresa de email nu este validă.';
      return;
    }

    if (password.length < 6) {
      this.error = 'Parola trebuie să conțină cel puțin 6 caractere.';
      return;
    }

    if (password !== confirmPassword) {
      this.error = 'Parolele nu coincid.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    const uiWatchdog = window.setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        if (!this.error) {
          this.error = 'Crearea contului durează prea mult. Încearcă din nou.';
        }
        this.cdr.detectChanges();
      }
    }, this.uiSafetyTimeoutMs);

    this.authService.register({
      username,
      email,
      password,
      phoneNumber,
      avatarUrl: '',
      description: ''
    })
      .pipe(
        switchMap((createdUser) => {
          if (!createdUser || !createdUser.id) {
            throw new Error('Cont creat fara date de utilizator.');
          }

          return this.authService.login(username, password);
        }),
        finalize(() => {
          clearTimeout(uiWatchdog);
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
      next: () => {
        this.success = '';
        this.registerPhoneNumber = '';
        this.registerPassword = '';
        this.registerConfirmPassword = '';
        this.isRegisterMode = false;
        this.router.navigate(['/profile']).then((navigated) => {
          if (!navigated) {
            window.location.assign('/profile');
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        const serverMessage = typeof error.error?.message === 'string' ? error.error.message : '';
        if (error.status === 409) {
          this.error = serverMessage || 'Username-ul sau email-ul există deja.';
          this.cdr.detectChanges();
          return;
        }
        this.error = serverMessage || 'Nu am putut crea contul. Încearcă din nou.';
        this.cdr.detectChanges();
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
