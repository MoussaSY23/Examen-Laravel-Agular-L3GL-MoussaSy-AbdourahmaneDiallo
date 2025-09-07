// src/app/services/categorie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categorie } from '../../models/categorie';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = `http://localhost:8000/api/categories`;

  constructor(private http: HttpClient) { }

  // Récupérer toutes les catégories
  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  // Récupérer une catégorie par son ID
  getCategorie(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle catégorie
  createCategorie(categorie: Partial<Categorie>): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }

  // Mettre à jour une catégorie
  updateCategorie(id: number, categorie: Partial<Categorie>): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, categorie);
  }

  // Supprimer une catégorie
  deleteCategorie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les produits d'une catégorie
  getProduitsByCategorie(categorieId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${categorieId}/produits`);
  }
}