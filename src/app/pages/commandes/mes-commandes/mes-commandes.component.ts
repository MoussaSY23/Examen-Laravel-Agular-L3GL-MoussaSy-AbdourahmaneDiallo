import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Commande } from '../../../models/commande';

@Component({
  selector: 'app-mes-commandes',
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  isLoading = false;
  commandes: Commande[] = [];
  private allCommandes: Commande[] = [];

  constructor(
    private commandeService: CommandeService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Recharger/apply filtre quand le query param change
    this.route.queryParamMap.subscribe(() => this.load());
  }

  load(): void {
    const me = this.authService.currentUserValue;
    if (!me?.id) return;
    this.isLoading = true;
    this.commandeService.getCommandesUtilisateur(me.id).subscribe({
      next: (list: Commande[]) => {
        // Retirer le panier en préparation de toute façon
        this.allCommandes = (list || []).filter(c => c.statut !== 'en_preparation');
        // Appliquer filtre d'URL: statut=livree => n'afficher que livrées; sinon exclure livrées
        const statut = this.route.snapshot.queryParamMap.get('statut');
        if (statut === 'livree') {
          this.commandes = this.allCommandes.filter(c => c.statut === 'livree');
        } else {
          this.commandes = this.allCommandes.filter(c => c.statut !== 'livree');
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStatutLabel(statut: string): string {
    const labels: { [k: string]: string } = {
      en_preparation: 'En préparation',
      en_livraison: 'En livraison',
      livree: 'Livrée',
      annulee: 'Annulée'
    };
    return labels[statut] || statut;
  }

  formatPrice(value: number | string): string {
    if (!value) return '0 F CFA';
    return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }
}
