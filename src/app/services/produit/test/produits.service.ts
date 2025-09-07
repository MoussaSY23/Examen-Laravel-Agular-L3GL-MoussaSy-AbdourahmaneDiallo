import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Produit {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  stock: number;
  categorie_id: number;
  unite?: string;
  image_principale?: string;
  images?: string[];
  en_promotion?: boolean;
  prix_promotion?: number;
  date_debut_promotion?: string;
  date_fin_promotion?: string;
  actif?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private apiUrl = 'http://localhost:8000/api/produits';
  private categorieUrl = 'http://localhost:8000/api/categories';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token') || localStorage.getItem('auth_token') || null;
  }

  private getAuthOptions(): { headers: HttpHeaders } {
    let headers = new HttpHeaders({ 'Accept': 'application/json' });
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  // === Produits ===
  getProduits(): Observable<Produit[]> {
    return this.http.get<{ success: boolean, data: Produit[] }>(this.apiUrl, this.getAuthOptions())
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  getProduit(id?: number): Observable<Produit> {
    return this.http.get<{ success: boolean, data: Produit }>(`${this.apiUrl}/${id}`, this.getAuthOptions())
      .pipe(
        map((res: { success: boolean, data: Produit }) => res.data),
        catchError(this.handleError)
      );
  }

  addProduit(formData: FormData): Observable<Produit> {
    return this.http.post<{ success: boolean, data: Produit }>(this.apiUrl, formData, this.getAuthOptions())
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  updateProduit(id: number, formData: FormData): Observable<Produit> {
    formData.append('_method', 'PUT');
    return this.http.post<{ success: boolean, data: Produit }>(`${this.apiUrl}/${id}`, formData, this.getAuthOptions())
      .pipe(
        map(res => res.data),
        catchError(this.handleError)
      );
  }

  deleteProduit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getAuthOptions())
      .pipe(catchError(this.handleError));
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(this.categorieUrl, this.getAuthOptions()).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Erreur API', error);
    return throwError(() => error);
  }
}
