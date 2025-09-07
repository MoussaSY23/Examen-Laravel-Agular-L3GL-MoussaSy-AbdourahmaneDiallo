import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande, ProduitCommande } from '../../../models/commande';
import { ProduitsService, Produit } from "../../../services/produit/test/produits.service";

@Component({
  selector: 'app-detail-commande',
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.css']
})
export class DetailCommandeComponent implements OnInit {
  commande!: Commande;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private commandeService: CommandeService,
    private produitService: ProduitsService
  ) {}

  ngOnInit(): void {
    this.loadCommande();
  }

  loadCommande(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = "ID de commande invalide";
      return;
    }

    this.isLoading = true;
    this.commandeService.getCommande(+id).subscribe({
      next: (res) => {
        this.commande = res;
        console.log("Commande :", this.commande);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur API commande :", err);
        this.errorMessage = "Impossible de récupérer la commande.";
        this.isLoading = false;
      }
    });
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_preparation': return 'En préparation';
      case 'en_livraison': return 'En livraison';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }

  changerStatutCommande(commande: Commande): void {
    const nextStatut = commande.statut === 'en_preparation' ? 'en_livraison' : 'livree';
    this.commandeService.updateStatutCommande(commande.id, nextStatut).subscribe({
      next: () => { commande.statut = nextStatut; },
      error: (err) => { 
        console.error("Erreur update statut :", err);
        alert("Impossible de changer le statut."); 
      }
    });
  }

  // ✅ retourne une URL directe (pas de subscribe ici !)
  getProduitImageUrl(prod?: Produit): string {
    if (!prod) return 'assets/images/no-image.jpg';
    return prod.image_principale
      ? `http://localhost:8000/storage/${prod.image_principale}`
      : 'assets/images/no-image.jpg';
  }

  formatPrice(value: number | string): string {
    if (!value) return "0 F CFA";
    return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  onImageError(event: any) {
    event.target.src = '../../../../assets/images.jpeg';
  }
}
