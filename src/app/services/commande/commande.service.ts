// src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../../models/commande';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = `http://localhost:8000/api/commandes`;

  constructor(private http: HttpClient) { }

  // Récupérer toutes les commandes (admin)
  getCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  // Récupérer une commande par son ID
  getCommande(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // Créer une nouvelle commande
  createCommande(commandeData: any): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commandeData);
  }

  // Mettre à jour le statut d'une commande
  updateStatutCommande(id: number, statut: string): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  // Générer une facture PDF
  genererFacture(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/facture`, { responseType: 'blob' });
  }

  // Envoyer la facture par email
  envoyerFactureParEmail(id: number, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/facture/email`, { email });
  }

  // Récupérer les commandes d'un utilisateur
  getCommandesUtilisateur(userId: number): Observable<Commande[]> {
    return this.http.get<Commande[]>(`http://localhost:8000/api/utilisateurs/${userId}/commandes`);
  }

  // Télécharger la facture
  telechargerFacture(id: number): void {
    this.genererFacture(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-commande-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}