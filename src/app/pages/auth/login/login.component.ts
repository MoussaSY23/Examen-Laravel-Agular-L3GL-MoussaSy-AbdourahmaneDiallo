import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
      this.router.navigate(['/dashboard']);
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
        
        // Gestion des différents types d'erreurs
        if (error?.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error?.status === 429) {
          this.errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
        } else if (error?.status === 0) {
          this.errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else {
          this.errorMessage = error?.error?.message || error?.message || 'Erreur lors de la connexion';
        }
        
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this.isLoading = false;
        this.isSubmitting = false;
        
        // Redirection vers le dashboard ou la page demandée
    
        this.router.navigate(['/home']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper pour accéder facilement aux champs du formulaire
  get f() { 
    return this.loginForm.controls; 
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Sauvegarder les credentials dans le localStorage
  private saveCredentials(email: string): void {
    try {
      localStorage.setItem('rememberedEmail', email);
    } catch (error) {
      console.warn('Impossible de sauvegarder les credentials:', error);
    }
  }

  // Charger les credentials sauvegardées
  private loadSavedCredentials(): void {
    try {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        this.loginForm.patchValue({
          email: rememberedEmail,
          rememberMe: true
        });
      }
    } catch (error) {
      console.warn('Impossible de charger les credentials sauvegardées:', error);
    }
  }

  // Supprimer les credentials sauvegardées
  private clearSavedCredentials(): void {
    try {
      localStorage.removeItem('rememberedEmail');
    } catch (error) {
      console.warn('Impossible de supprimer les credentials sauvegardées:', error);
    }
  }

  // Méthode pour gérer les erreurs de validation personnalisées
  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return fieldName === 'email' ? 'L\'email est requis' : 'Le mot de passe est requis';
      }
      if (field.errors['email']) {
        return 'Veuillez entrer un email valide';
      }
      if (field.errors['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    return null;
  }

  // Vérifier si un champ a une erreur
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.touched && field.errors);
  }

  // Méthode pour nettoyer les erreurs lors de la saisie
  onFieldInput(fieldName: string): void {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
    
    // Marquer le champ comme non-touché temporairement pour masquer l'erreur pendant la saisie
    const field = this.loginForm.get(fieldName);
    if (field && field.errors) {
      field.markAsUntouched();
      
      // Re-marquer comme touché après un délai pour réafficher l'erreur si nécessaire
      setTimeout(() => {
        if (field.invalid) {
          field.markAsTouched();
        }
      }, 1000);
    }
  }

  // Gestion des événements clavier
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }
}