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
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
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
        console.log('Réponse login:', response);

        const token = response.access_token || response.token;
        const user = response.user || response.data?.user;

        if (token) {
          localStorage.setItem('token', token);
        }

        if (user) {
          this.storeUserData(user);
        }
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
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/me`).pipe(
      tap(user => this.storeUserData(user)),
      catchError(this.handleError)
    );
  }

  // Mise à jour du profil
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/auth/profile`, userData).pipe(
      tap(user => this.storeUserData(user)),
      catchError(this.handleError)
    );
  }

  // Changement de mot de passe
  changePassword(passwords: { 
    current_password: string; 
    new_password: string; 
    new_password_confirmation: string 
  }): Observable<any> {
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
  // Utils internes
  // --------------------
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;

      if (error.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.status === 422) {
        const validationErrors = error.error.errors;
        errorMessage = 'Erreur de validation: ';
        for (const field in validationErrors) {
          if (validationErrors.hasOwnProperty(field)) {
            errorMessage += `\n- ${validationErrors[field].join(', ')}`;
          }
        }
      }
    }
    return throwError(() => errorMessage);
  }

  private storeUserData(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  getTokenData(): any {
    const token = this.getToken();
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
