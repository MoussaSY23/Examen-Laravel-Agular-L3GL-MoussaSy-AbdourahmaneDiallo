// src/app/services/categorie/categorie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categorie } from '../../models/categorie';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = 'http://localhost:8000/api/categories';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  /** Récupérer toutes les catégories */
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  /** Récupérer une catégorie par son ID (via /get/{id}) */
  getCategorie(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/get/${id}`, { headers: this.getAuthHeaders() });
  }

  /** Créer une nouvelle catégorie */
  createCategorie(categorie: Partial<Categorie>): Observable<Categorie> {
    return this.http.post<Categorie>(
      this.apiUrl,
      categorie,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Mettre à jour une catégorie */
  updateCategorie(id: number, categorie: Partial<Categorie>): Observable<Categorie> {
    return this.http.put<Categorie>(
      `${this.apiUrl}/${id}`,
      categorie,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Supprimer une catégorie */
  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** Récupérer les produits d'une catégorie */
  getProduitsByCategorie(categorieId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${categorieId}/produits`, { headers: this.getAuthHeaders() });
  }
}
