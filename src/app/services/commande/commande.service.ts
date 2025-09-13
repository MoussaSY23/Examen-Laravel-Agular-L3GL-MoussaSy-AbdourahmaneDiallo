// src/app/services/commande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../../models/commande';
import { map } from 'rxjs/operators';
import { User } from '../../models/user';



@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private apiUrl = `http://localhost:8000/api/commandes`;

  constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      });
    }

  // Récupérer toutes les commandes (admin)
  getCommandes(): Observable<Commande[]> {
    return this.http.get<any>(this.apiUrl , { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  // Récupérer une commande par son ID
  getCommande(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}` , { headers: this.getAuthHeaders() });
  }

  // Créer une nouvelle commande
  createCommande(commandeData: any): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commandeData, { headers: this.getAuthHeaders() });
  }

  // Mettre à jour le statut d'une commande
  updateStatutCommande(id: number, statut: string): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}/statut`, { statut } , { headers: this.getAuthHeaders() });
  }

  // Attribution par un administrateur à un employé donné
  assignerCommande(id: number, employeId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/assign`, { employe_id: employeId }, { headers: this.getAuthHeaders() });
  }

  // Lister les employés (admin only)
  getEmployees(): Observable<User[]> {
    return this.http.get<any>(`http://localhost:8000/api/users/employees`, { headers: this.getAuthHeaders() })
      .pipe(map((res: any) => res?.data ?? res));
  }

  // Générer une facture PDF
genererFacture(id: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${id}/facture`, {
    headers: this.getAuthHeaders(),
    responseType: 'blob'
  });
}

envoyerFactureParEmail(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/${id}/facture/email`, {}, { headers: this.getAuthHeaders() });
}

getCommandesUtilisateur(userId: number): Observable<Commande[]> {
  return this.http.get<{ success: boolean, data: Commande[] }>(
    `http://localhost:8000/api/utilisateurs/${userId}/commandes`,
    { headers: this.getAuthHeaders() }
  ).pipe(
    map(res => res.data) // <-- on récupère juste le tableau de commandes
  );
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


addProduitAuPanier(produitId?: number, quantite: number = 1): Observable<{ success: boolean, message: string, panier?: any }> {
  return this.http.post<{ success: boolean, message: string, panier?: any }>(
    `http://localhost:8000/api/panier/ajouter`,
    { produit_id: produitId, quantite },
    { headers: this.getAuthHeaders() }
  );
}

retirerProduitDuPanier(produitId: number): Observable<{ success: boolean, message: string, panier?: any }> {
  return this.http.request<{ success: boolean, message: string, panier?: any }>(
    'DELETE',
    `http://localhost:8000/api/panier/retirer`,
    {
      headers: this.getAuthHeaders(),
      body: { produit_id: produitId }
    }
  );
}

}