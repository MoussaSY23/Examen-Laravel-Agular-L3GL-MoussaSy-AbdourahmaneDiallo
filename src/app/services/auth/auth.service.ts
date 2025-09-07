// src/app/services/auth/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api';
  public currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = this.getStorageItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Récupérer l'utilisateur courant
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Vérifie si un utilisateur est connecté
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  // Vérifie si l'utilisateur a un rôle donné
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return !!user && user.role === role;
  }

  // Connexion
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response: any) => {
        const token = response.access_token || response.token;
        const user = response.user || response.data?.user;

        if (token) this.setStorageItem('token', token);
        if (user) this.storeUserData(user);
      }),
      catchError(this.handleError)
    );
  }

  // Inscription
  register(userData: User): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  // Récupérer le profil
// Récupérer le profil
getProfile(): Observable<User> {
  return this.http.get<User>(`${this.API_URL}/auth/me`, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(this.handleError) // 🔥 Ne met pas à jour le BehaviorSubject ici
  );
}



updateProfile(userData: FormData): Observable<User> {
  return this.http.post<User>(`${this.API_URL}/auth/profile`, userData, {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    })
  }).pipe(
    tap(user => this.storeUserData(user)),
    catchError(this.handleError)
  );
}





  // Changement de mot de passe
  changePassword(passwords: { current_password: string; new_password: string; new_password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/change-password`, passwords)
      .pipe(catchError(this.handleError));
  }

  // Déconnexion
  logout(): void {
    this.http.post(`${this.API_URL}/auth/logout`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => console.log('Déconnexion backend OK'),
        error: () => console.log('Déconnexion backend échouée (mais local ok)')
      });

    this.clearLocalStorage();
    this.router.navigate(['/auth/login']);
  }

  // --------------------
  // Gestion sécurisée du localStorage
  // --------------------
  private getStorageItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }


  private clearLocalStorage(): void {
    this.removeStorageItem('token');
    this.removeStorageItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Récupération du token
  getToken(): string | null {
    return this.getStorageItem('token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  getTokenData(): any {
    const token = this.getToken();
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  // En-têtes d'authentification
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // --------------------
  // Gestion des erreurs
  // --------------------
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;

      if (error.status === 401) errorMessage = 'Email ou mot de passe incorrect';
      else if (error.status === 422 && error.error.errors) {
        const validationErrors = error.error.errors;
        errorMessage = 'Erreur de validation: ';
        for (const field in validationErrors) {
          if (validationErrors.hasOwnProperty(field)) {
            errorMessage += `\n- ${validationErrors[field].join(', ')}`;
          }
        }
      }
    }
    return throwError(() => new Error(errorMessage));
  }


  // Récupérer l'utilisateur courant de façon synchrone




public storeUserData(user: User | null): void {
  if (!user) return; // ⚠️ ne rien faire si user invalide
  this.setStorageItem('currentUser', JSON.stringify(user));
  this.currentUserSubject.next(user);
}

public getCurrentUser(): User | null {
  return this.currentUserSubject.value;
}
}
