import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, MessageItem } from '../../services/message/message.service';
import { CommandeService } from '../../services/commande/commande.service';
import { Commande } from '../../models/commande';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  clientId!: number;
  employeId?: number; // optional with single conversation per client
  meId!: number; // current user id from localStorage
  commandeId?: number;
  commande?: Commande;

  messages: MessageItem[] = [];
  newMessage = '';
  loading = false;
  sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private commandeService: CommandeService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    const cmdParam = this.route.snapshot.paramMap.get('commandeId');
    this.commandeId = cmdParam ? Number(cmdParam) : undefined;

    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));
    const empParam = this.route.snapshot.paramMap.get('employeId');
    this.employeId = empParam ? Number(empParam) : undefined;

    const currentUser = localStorage.getItem('currentUser');
    this.meId = currentUser ? JSON.parse(currentUser).id : 0;

    if (this.commandeId) {
      // Charger la commande pour connaître l'interlocuteur
      this.commandeService.getCommande(this.commandeId).subscribe({
        next: (c: any) => { this.commande = c; },
        error: () => {}
      });
    }
    this.loadConversation();
    // Simple polling every 5s (can be replaced by websockets)
    this.sub = interval(5000).subscribe(() => this.loadConversation(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadConversation(showSpinner: boolean = true): void {
    if (showSpinner) this.loading = true;
    const onLoaded = (res: any) => {
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      this.messages = data;
      this.loading = false;
    };
    if (this.commandeId) {
      this.messageService.getConversationByCommande(this.commandeId).subscribe({ next: onLoaded, error: () => this.loading = false });
    } else if (this.employeId) {
      this.messageService.getConversation(this.clientId, this.employeId).subscribe({ next: onLoaded, error: () => this.loading = false });
    } else {
      this.messageService.getConversationByClient(this.clientId).subscribe({ next: onLoaded, error: () => this.loading = false });
    }
  }

  send(): void {
    const content = this.newMessage?.trim();
    if (!content) return;
    // Determine recipient
    let destinataireId: number | undefined;
    // Mode conversation par commande
    if (this.commandeId && this.commande) {
      const clientId = (this.commande as any)?.user_id || (this.commande as any)?.client?.id;
      const empId = (this.commande as any)?.employe_id || (this.commande as any)?.employe?.id;
      if (this.meId === clientId) destinataireId = empId;
      else if (this.meId === empId) destinataireId = clientId;
    }
    // Sinon, pair-à-pair ou unifié
    if (!destinataireId) {
      if (this.meId !== this.clientId) {
        destinataireId = this.clientId;
      } else {
        const last = [...this.messages].reverse().find(m => (m.expediteur_id !== this.meId) || (m.destinataire_id !== this.meId));
        if (last) destinataireId = last.expediteur_id !== this.meId ? last.expediteur_id : last.destinataire_id;
        else if (this.employeId) destinataireId = this.employeId;
      }
    }

    if (!destinataireId) {
      // Tentative de résolution côté client: trouver l'employé qui gère une de ses commandes
      this.commandeService.getCommandesUtilisateur(this.clientId).subscribe({
        next: (list: any[]) => {
          const withEmp = (list || []).find(c => c?.employe?.id);
          const empId = withEmp?.employe?.id;
          if (!empId) {
            this.toastr.warning("Aucun employé assigné trouvé pour vos commandes");
            return;
          }
          this.employeId = empId;
          this.messageService.sendMessage({
            expediteur_id: this.meId,
            destinataire_id: empId,
            contenu: content
          }).subscribe({
            next: () => {
              this.newMessage = '';
              this.loadConversation(false);
            },
            error: (err) => {
              console.error(err);
              this.toastr.error("Impossible d'envoyer le message");
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Impossible de déterminer l\'employé assigné');
        }
      });
      return;
    }

    this.messageService.sendMessage({
      expediteur_id: this.meId,
      destinataire_id: destinataireId!,
      contenu: content,
      commande_id: this.commandeId
    }).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadConversation(false);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Impossible d'envoyer le message");
      }
    });
  }

  trackByMsg = (_: number, m: MessageItem) => m.id;

  isMine(m: MessageItem): boolean {
    return m.expediteur_id === this.meId;
  }
}
