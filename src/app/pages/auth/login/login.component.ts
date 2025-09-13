import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../../../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      this.redirectUser(this.authService.getCurrentUser());
    }

    // Charger les données sauvegardées si "Se souvenir de moi" était coché
    this.loadSavedCredentials();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.isSubmitting = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    // Sauvegarder les credentials si demandé
    if (rememberMe) {
      this.saveCredentials(email);
    } else {
      this.clearSavedCredentials();
    }

    this.authService.login({ email, password }).pipe(
      catchError(error => {
        this.isLoading = false;
        this.isSubmitting = false;

        if (error?.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Erreur lors de la connexion';
        }
        return of(null);
      })
    ).subscribe(response => {
      this.isLoading = false;
      this.isSubmitting = false;

      if (response) {
        const user = this.authService.getCurrentUser();
        this.redirectUser(user);
      }
    });
  }

  // 🔹 Redirection selon le rôle
  private redirectUser(user: User | null): void {
    if (!user) return;

    if (user.role === 'admin' || user.role === 'employee') {
      this.router.navigate(['/admin-dashboard']);
    } else if (user.role === 'client') {
      this.router.navigate(['/client-dashboard']);
    } else {
      this.router.navigate(['/']); // fallback
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helpers pour validations
  get f() { return this.loginForm.controls; }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private saveCredentials(email: string): void {
    try { localStorage.setItem('rememberedEmail', email); } catch {}
  }

  private loadSavedCredentials(): void {
    try {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        this.loginForm.patchValue({
          email: rememberedEmail,
          rememberMe: true
        });
      }
    } catch {}
  }

  private clearSavedCredentials(): void {
    try { localStorage.removeItem('rememberedEmail'); } catch {}
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return fieldName === 'email' ? 'L\'email est requis' : 'Le mot de passe est requis';
      }
      if (field.errors['email']) return 'Veuillez entrer un email valide';
      if (field.errors['minlength']) return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return null;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  onFieldInput(fieldName: string): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      field.markAsUntouched();
      setTimeout(() => {
        if (field.invalid) field.markAsTouched();
      }, 1000);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }
}
