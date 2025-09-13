import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageItem } from '../../services/message/message.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';
import { ThreadService } from '../../services/thread/thread.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  meId!: number; // current user id from localStorage
  commandeId?: number;

  messages: MessageItem[] = [];
  newMessage = '';
  loading = false;
  sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private threadService: ThreadService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const cmdParam = this.route.snapshot.paramMap.get('commandeId');
    this.commandeId = cmdParam ? Number(cmdParam) : undefined;

    const currentUser = localStorage.getItem('currentUser');
    this.meId = currentUser ? JSON.parse(currentUser).id : 0;

    this.loadConversation();
    // Simple polling every 5s (can be replaced by websockets)
    this.sub = interval(5000).subscribe(() => this.loadConversation(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadConversation(showSpinner: boolean = true): void {
    if (showSpinner) this.loading = true;
    if (!this.commandeId) { this.loading = false; return; }
    this.threadService.getThreadMessages({ type: 'commande', id: this.commandeId })
      .subscribe({
        next: (data) => { this.messages = data; this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  send(): void {
    const content = this.newMessage?.trim();
    if (!content || !this.commandeId) return;
    this.threadService.sendToThread({ type: 'commande', id: this.commandeId }, this.meId, content)
      .subscribe({
        next: () => { this.newMessage = ''; this.loadConversation(false); },
        error: (err) => { console.error(err); this.toastr.error("Impossible d'envoyer le message"); }
      });
  }

  trackByMsg = (_: number, m: MessageItem) => m.id;

  isMine(m: MessageItem): boolean {
    return m.expediteur_id === this.meId;
  }
}
