import { Component, OnInit } from '@angular/core';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande, ProduitCommande } from '../../../models/commande';

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

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    this.commandeService.getCommandes().subscribe({
      next: (res: any) => {
        this.commandes = res.data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  applyFilters(): void {
    this.filteredCommandes = this.commandes.filter(cmd => {
      const matchesStatut = this.filterStatut === 'tous' || cmd.statut === this.filterStatut;
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
