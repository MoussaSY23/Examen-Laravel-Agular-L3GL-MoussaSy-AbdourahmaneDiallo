import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommandeService } from '../../services/commande/commande.service';
import { Commande } from '../../models/commande';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {
  loading = false;
  items: Array<{ id: number; title: string; subtitle: string; clientId: number; employeId: number }>=[];
  me: any;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('currentUser');
    this.me = raw ? JSON.parse(raw) : null;
    if (!this.me) {
      this.toastr.warning('Veuillez vous connecter');
      return;
    }
    this.load();
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
        // Côté client: exclure les commandes livrées des conversations
        if (this.me.role === 'client') {
          commandes = commandes.filter(c => c.statut !== 'livree');
        }

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

        // Dédupliquer par client uniquement (une conversation par client)
        const key = (x: any) => `${x.clientId}`;
        const unique = new Map<string, any>();
        for (const it of mapped) {
          unique.set(key(it), it);
        }
        this.items = Array.from(unique.values());
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Impossible de charger les conversations');
        this.loading = false;
      }
    });
  }

  open(it: { clientId: number; employeId: number }) {
    this.router.navigate(['/chat', it.clientId]);
  }
}
