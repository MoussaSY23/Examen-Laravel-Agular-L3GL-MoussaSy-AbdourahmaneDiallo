import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MessageItem {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  contenu: string;
  lu: boolean;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: token ? `Bearer ${token}` : '' });
  }

  // Récupérer la conversation entre deux utilisateurs
  getConversation(expediteurId: number, destinataireId: number): Observable<{ success: boolean, data: MessageItem[] } | MessageItem[] > {
    return this.http.get<any>(`${this.apiUrl}/conversations/${expediteurId}/${destinataireId}`, { headers: this.getAuthHeaders() });
  }

  // Récupérer la conversation complète pour un client (tous interlocuteurs)
  getConversationByClient(clientId: number): Observable<{ success: boolean, data: MessageItem[] } | MessageItem[] > {
    return this.http.get<any>(`${this.apiUrl}/conversations/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  // Récupérer la conversation liée à une commande
  getConversationByCommande(commandeId: number): Observable<{ success: boolean, data: MessageItem[] } | MessageItem[] > {
    return this.http.get<any>(`${this.apiUrl}/conversations/commande/${commandeId}`, { headers: this.getAuthHeaders() });
  }

  // Envoyer un message
  sendMessage(payload: { expediteur_id: number; destinataire_id: number; contenu: string; commande_id?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages`, payload, { headers: this.getAuthHeaders() });
  }

  // Marquer un message comme lu
  markAsRead(messageId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/messages/${messageId}/lu`, {}, { headers: this.getAuthHeaders() });
  }

  // Supprimer un message
  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/messages/${messageId}`, { headers: this.getAuthHeaders() });
  }

  // Compter les non-lus pour l'utilisateur courant
  getUnreadCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(`${this.apiUrl}/messages/unread-count`, { headers: this.getAuthHeaders() });
  }
}
