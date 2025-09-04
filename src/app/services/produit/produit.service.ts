// src/app/services/produit/produit.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Produit } from '../../models/produit';


@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Récupérer tous les produits
  getProduits(): Observable<Produit[]> {
    return this.http.get<{data: Produit[]}>(`${this.API_URL}/produits`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Récupérer un produit par son ID
  getProduit(id: number): Observable<Produit> {
    return this.http.get<{data: Produit}>(`${this.API_URL}/produits/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Créer un nouveau produit
  createProduit(produit: Partial<Produit>): Observable<Produit> {
    return this.http.post<{data: Produit}>(`${this.API_URL}/produits`, produit, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Mettre à jour un produit
  updateProduit(id: number, produit: Partial<Produit>): Observable<Produit> {
    return this.http.put<{data: Produit}>(`${this.API_URL}/produits/${id}`, produit, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Supprimer un produit
  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/produits/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Appliquer une promotion à un produit
  appliquerPromotion(id: number, promotion: {
    prix_promotion: number;
    date_debut_promotion: string;
    date_fin_promotion: string;
  }): Observable<Produit> {
    return this.http.post<{data: Produit}>(`${this.API_URL}/produits/${id}/promotion`, promotion, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Décrémenter le stock d'un produit
  decrementerStock(id: number, quantite: number): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/produits/${id}/decrementer-stock/${quantite}`, {}, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les produits par catégorie
  getProduitsParCategorie(categorieId: number): Observable<Produit[]> {
    return this.http.get<{data: Produit[]}>(`${this.API_URL}/produits/categorie/${categorieId}`).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Gestion des erreurs
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue lors de la requête.';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 401) {
        errorMessage = 'Vous devez être connecté pour effectuer cette action.';
      } else if (error.status === 403) {
        errorMessage = 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 422) {
        // Gestion des erreurs de validation
        const validationErrors = error.error.errors;
        errorMessage = 'Erreur de validation: ';
        for (const field in validationErrors) {
          if (validationErrors.hasOwnProperty(field)) {
            errorMessage += `\n- ${validationErrors[field].join(', ')}`;
          }
        }
      } else {
        errorMessage = `Erreur serveur (${error.status}): ${error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Récupérer les en-têtes d'authentification
  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}