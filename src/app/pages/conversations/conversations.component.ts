import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommandeService } from '../../services/commande/commande.service';
import { Commande } from '../../models/commande';
import { ThreadService } from '../../services/thread/thread.service';
import { MessageItem } from '../../services/message/message.service';
import { Subscription } from 'rxjs';
import { RealtimeService } from '../../services/realtime/realtime.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') chatBody?: ElementRef<HTMLDivElement>;
  loading = false;
  items: Array<{ id: number; title: string; subtitle: string; clientId: number; employeId: number }>=[];
  me: any;
  meId!: number;
  // Chat pane state
  selectedCommandeId?: number;
  messages: MessageItem[] = [];
  newMessage = '';
  loadingMessages = false;
  sub?: Subscription; // subscription to realtime messages

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private commandeService: CommandeService,
    private threadService: ThreadService,
    private realtime: RealtimeService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('currentUser');
    this.me = raw ? JSON.parse(raw) : null;
    if (!this.me) {
      this.toastr.warning('Veuillez vous connecter');
      return;
    }
    this.meId = Number(this.me.id || 0);
    this.load();
    // Subscribe to realtime message stream
    this.sub = this.realtime.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.loadingMessages = false;
      this.scrollToBottom();
    });
  }

  private load(): void {
    this.loading = true;
    const userId = this.me.id;
    const isEmployee = this.me.role === 'employee';
    const obs = isEmployee
      ? this.commandeService.getCommandes()
      : this.commandeService.getCommandesUtilisateur(userId);

    obs.subscribe({
      next: (list: Commande[]) => {
        // Si employé, ne garder que les commandes qui me sont assignées
        let commandes = list || [];
        if (isEmployee) {
          commandes = commandes.filter((c: any) => c?.employe?.id === userId);
        }
        // Ne jamais inclure les paniers en préparation
        commandes = commandes.filter(c => c.statut !== 'en_preparation');
        // Exclure les livrées pour tout le monde (threads inactifs)
        commandes = commandes.filter(c => c.statut !== 'livree');

        const mapped = commandes
          .map(c => {
            const client = (c as any).client;
            return {
              id: c.id!,
              title: (this.me.role === 'client') ? 'Support' : (client?.name || 'Client'),
              subtitle: `Commande #${c.id} · ${c.statut}`,
              clientId: client?.id || this.me.id,
              employeId: (c as any).employe?.id || 0
            };
          })
          .filter(x => x.clientId);

        // Garder un thread par commande (plus clair)
        this.items = mapped;
        this.loading = false;
        // Auto-select first conversation if none selected
        if (!this.selectedCommandeId && this.items.length > 0) {
          this.open(this.items[0]);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Impossible de charger les conversations');
        this.loading = false;
      }
    });
  }

  open(it: { id: number; clientId: number; employeId: number }) {
    // Select the chat thread in-place
    this.selectedCommandeId = it.id;
    this.loadingMessages = true;
    this.realtime.selectThread({ type: 'commande', id: this.selectedCommandeId }, this.meId);
    // allow DOM to render, then scroll
    setTimeout(() => this.scrollToBottom(), 50);
  }

  private loadThread(showSpinner: boolean = true): void {
    if (!this.selectedCommandeId) return;
    if (showSpinner) this.loadingMessages = true;
    this.threadService.getThreadMessages({ type: 'commande', id: this.selectedCommandeId })
      .subscribe({
        next: () => { this.loadingMessages = false; },
        error: () => { this.loadingMessages = false; }
      });
  }

  send(): void {
    const content = this.newMessage?.trim();
    if (!content || !this.selectedCommandeId) return;
    this.realtime.send(content)
      .subscribe({
        next: () => { this.newMessage = ''; },
        error: () => { this.toastr.error("Impossible d'envoyer le message"); }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.realtime.stop();
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatBody?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
