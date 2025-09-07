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
  isLoading = true;

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    this.commandeService.getCommandes().subscribe({
      next: (res: any) => {
        this.commandes = res.data; // si paginate
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes', err);
        this.isLoading = false;
      }
    });
  }

  changerStatut(commande: Commande, statut: string): void {
    this.commandeService.updateStatutCommande(commande.id, statut).subscribe({
      next: (updated) => {
        commande.statut = updated.statut;
      },
      error: (err) => console.error('Erreur mise à jour statut', err)
    });
  }

  telechargerFacture(commande: Commande): void {
    this.commandeService.telechargerFacture(commande.id);
  }

  envoyerFacture(commande: Commande): void {
    this.commandeService.envoyerFactureParEmail(commande.id).subscribe({
      next: () => alert('Facture envoyée par email !'),
      error: (err) => console.error('Erreur envoi facture', err)
    });
  }
}
