// src/app/services/produit/produit.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Produit } from '../../models/produit';

// Interface pour le modèle Categorie
export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface pour la réponse de l'API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  errors?: { [key: string]: string[] };
}

export interface UploadResponse {
  path: string;
  url: string;
}

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
    return this.http.get<{ data: Produit[] }>(`${this.API_URL}/produits`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Récupérer un produit par son ID
  getProduit(id: number): Observable<Produit> {
    return this.http.get<{ data: Produit }>(`${this.API_URL}/produits/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Créer un nouveau produit avec upload d'image
  createProduit(produit: FormData): Observable<Produit> {
    const headers = this.getAuthHeaders(true); // FormData ne nécessite pas Content-Type
    return this.http.post<{ data: Produit }>(`${this.API_URL}/produits`, produit, { headers }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Mettre à jour un produit avec upload d'image
  updateProduit(id: number, formData: FormData): Observable<Produit> {
    console.log('Début de la mise à jour du produit', { id });
    
    // Afficher le contenu du FormData pour le débogage
    formData.forEach((value, key) => {
      console.log(`FormData - ${key}:`, value);
    });

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Aucun token d\'authentification trouvé');
      return throwError(() => new Error('Non authentifié'));
    }

    // Créer les en-têtes sans Content-Type pour permettre au navigateur de le définir automatiquement
    // avec la bonne boundary pour FormData
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');
    
    console.log('Envoi de la requête de mise à jour...');
    
    return this.http.put<ApiResponse<Produit>>(
      `${this.API_URL}/produits/${id}`, 
      formData, 
      { 
        headers,
        withCredentials: true,
        reportProgress: true
      }
    ).pipe(
      tap((response: ApiResponse<Produit>) => {
        console.log('Réponse reçue du serveur:', response);
      }),
      map((response: ApiResponse<Produit>) => {
        if (!response || !response.data) {
          throw new Error('Réponse invalide du serveur');
        }
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour du produit:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la mise à jour du produit';
        
        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
          } else if (error.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            // Déconnexion de l'utilisateur
            this.authService.logout();
          } else if (error.status === 422) {
            // Erreur de validation
            const validationErrors = error.error?.errors || {};
            errorMessage = 'Erreur de validation';
            return throwError(() => ({
              message: errorMessage,
              errors: validationErrors,
              status: error.status
            }));
          } else {
            errorMessage = error.error?.message || error.message || error.statusText || 'Erreur inconnue';
          }
        }
        
        return throwError(() => ({
          message: errorMessage,
          status: error.status || 0,
          error: error.error
        }));
      })
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
    return this.http.post<{ data: Produit }>(`${this.API_URL}/produits/${id}/promotion`, promotion, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Décrémenter le stock d'un produit
  decrementerStock(id: number, quantite: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/produits/${id}/decrementer-stock/${quantite}`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Récupérer les produits par catégorie
  getProduitsParCategorie(categorieId: number): Observable<Produit[]> {
    return this.http.get<{ data: Produit[] }>(`${this.API_URL}/produits/categorie/${categorieId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  // Téléverser une image
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ data: UploadResponse }>(`${this.API_URL}/upload`, formData, {
      headers: this.getAuthHeaders(true),
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          return event.body.data;
        }
        return null;
      }),
      catchError(this.handleError)
    ) as Observable<UploadResponse>;
  }

  // Récupérer la liste des catégories
  getCategories(): Observable<Categorie[]> {
    return this.http.get<{ data: Categorie[] }>(`${this.API_URL}/categories`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('Catégories reçues:', response);
        return response.data || [];
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des catégories:', error);
        return throwError(() => error);
      })
    );
  }

  // Appliquer une promotion à un produit
  applyPromotion(produitId: number, promotionData: any): Observable<Produit> {
    return this.http.post<{ data: Produit }>(
      `${this.API_URL}/produits/${produitId}/promotion`,
      promotionData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Téléverser des images supplémentaires
  uploadImages(produitId: number, images: File[]): Observable<string[]> {
    const formData = new FormData();
    images.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });

    const headers = this.getAuthHeaders(true);
    return this.http.post<{ data: string[] }>(
      `${this.API_URL}/produits/${produitId}/images`,
      formData,
      { headers }
    ).pipe(
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
  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = this.authService.getToken();
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return new HttpHeaders(headers);
  }
}
