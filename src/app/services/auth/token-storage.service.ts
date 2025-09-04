// src/app/services/auth/token-storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';

  constructor() { }

  // Effacer la session
  clear(): void {
    window.sessionStorage.clear();
  }

  // Sauvegarder le token
  public saveToken(token: string): void {
    window.sessionStorage.removeItem(this.TOKEN_KEY);
    window.sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Récupérer le token
  public getToken(): string | null {
    return window.sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Sauvegarder les données utilisateur
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(this.USER_KEY);
    window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Récupérer les données utilisateur
  public getUser(): any {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  // Vérifier si l'utilisateur est connecté
  public isLoggedIn(): boolean {
    return !!this.getToken();
  }
}