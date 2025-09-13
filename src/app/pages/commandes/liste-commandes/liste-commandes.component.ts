import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande, ProduitCommande } from '../../../models/commande';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-liste-commandes',
  templateUrl: './liste-commandes.component.html',
  styleUrls: ['./liste-commandes.component.css']
})
export class ListeCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];
  isLoading = true;
  searchText = '';
  filterStatut = 'tous';
  private fromQueryStatut: string | null = null;

  constructor(
    private commandeService: CommandeService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.fromQueryStatut = params.get('statut');
      if (this.fromQueryStatut) {
        this.filterStatut = this.fromQueryStatut;
      }
      this.loadCommandes();
    });
  }

  isClient(): boolean {
    return this.authService.currentUserValue?.role === 'client';
  }

  isEmployee(): boolean {
    return this.authService.currentUserValue?.role === 'employee';
  }

  loadCommandes(): void {
    this.isLoading = true;
    const me = this.authService.currentUserValue;
    const obs = (me?.role === 'client')
      ? this.commandeService.getCommandesUtilisateur((me!.id as number))
      : this.commandeService.getCommandes();

    obs.subscribe({
      next: (commandes: Commande[]) => {
        // Afficher uniquement les commandes validées (exclure le panier en préparation)
        let list = (commandes || []).filter((c: Commande) => c.statut !== 'en_preparation');

        if (me?.role === 'employee') {
          list = list.filter((c: any) => c?.employe?.id === me.id);
        }
        // Si client: on a déjà filtré par l'utilisateur via l'endpoint getCommandesUtilisateur

        this.commandes = list;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    const me = this.authService.currentUserValue;
    this.filteredCommandes = this.commandes
      // sécurité: s'assurer qu'on n'affiche jamais 'en_preparation'
      .filter(c => c.statut !== 'en_preparation')
      .filter(cmd => {
      // Exclure 'livree' par défaut pour admin/employé si aucun filtre explicite
      let matchesStatut = true;
      if (this.filterStatut === 'tous') {
        if (me && me.role !== 'client') {
          matchesStatut = cmd.statut !== 'livree';
        }
      } else {
        matchesStatut = cmd.statut === this.filterStatut;
      }
      const matchesSearch = !this.searchText || cmd.client?.name.toLowerCase().includes(this.searchText.toLowerCase()) || cmd.id.toString().includes(this.searchText);
      return matchesStatut && matchesSearch;
    });
  }

  onStatutChange(statut: string): void {
    this.filterStatut = statut;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  changerStatut(commande: Commande, statut: string): void {
    this.commandeService.updateStatutCommande(commande.id, statut).subscribe({
      next: (updated) => commande.statut = updated.statut
    });
  }

  telechargerFacture(commande: Commande): void {
    this.commandeService.telechargerFacture(commande.id);
  }

  envoyerFacture(commande: Commande): void {
    this.commandeService.envoyerFactureParEmail(commande.id).subscribe(() => alert('Facture envoyée !'));
  }

  countByStatut(statut: string): number {
    return this.commandes.filter(c => c.statut === statut).length;
  }

    getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_preparation': 'En préparation',
      'en_livraison': 'En livraison',
      'livree': 'Livrée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }
}
