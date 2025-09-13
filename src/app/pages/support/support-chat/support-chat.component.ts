import { Component, OnInit } from '@angular/core';
import { SupportMessage, SupportService } from '../../../services/support/support.service';

@Component({
  selector: 'app-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.css']
})
export class SupportChatComponent implements OnInit {
  conversationId?: number;
  loading = false;
  input = '';
  messages: SupportMessage[] = [];
  error?: string;

  constructor(private support: SupportService) {}

  ngOnInit(): void {
    this.startConversation();
  }

  private startConversation() {
    this.loading = true;
    this.support.createConversation('Support client').subscribe({
      next: (res) => {
        this.conversationId = res.data.id;
        // Optionnel: charger historique (vide au départ)
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Impossible de démarrer la conversation';
        this.loading = false;
      }
    });
  }

  send() {
    if (!this.input.trim() || !this.conversationId) return;
    const content = this.input.trim();
    this.input = '';
    this.loading = true;

    this.support.sendMessage(this.conversationId, content).subscribe({
      next: (res) => {
        const { user_message, ai_message } = res.data;
        this.messages.push(user_message);
        this.messages.push(ai_message);
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors de l\'envoi';
        this.loading = false;
      }
    });
  }

  private scrollToBottom() {
    const box = document.getElementById('support-chat-box');
    if (box) box.scrollTop = box.scrollHeight;
  }
}
