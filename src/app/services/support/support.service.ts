import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface SupportConversation {
  id: number;
  user_id?: number | null;
  status: 'open'|'closed'|'escalated';
  subject?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SupportMessage {
  id: number;
  conversation_id: number;
  sender_type: 'user'|'ai'|'agent';
  content: string;
  meta?: any;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class SupportService {
  // TODO: déplacer dans environment
  private readonly API = 'http://localhost:8000/api/support';

  constructor(private http: HttpClient) {}

  createConversation(subject?: string): Observable<{success: boolean, data: SupportConversation}> {
    return this.http.post<{success: boolean, data: SupportConversation}>(`${this.API}/conversations`, { subject });
  }

  getConversation(id: number): Observable<{success: boolean, data: { conversation: SupportConversation, messages: SupportMessage[] }}> {
    return this.http.get<{success: boolean, data: { conversation: SupportConversation, messages: SupportMessage[] }}>(`${this.API}/conversations/${id}`);
  }

  sendMessage(conversation_id: number, content: string): Observable<{success: boolean, data: { user_message: SupportMessage, ai_message: SupportMessage }}> {
    return this.http.post<{success: boolean, data: { user_message: SupportMessage, ai_message: SupportMessage }}>(`${this.API}/messages`, { conversation_id, content });
  }
}
