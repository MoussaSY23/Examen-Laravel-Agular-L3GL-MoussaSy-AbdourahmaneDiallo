import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande } from '../../../models/commande';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-commande-panier',
  templateUrl: './commande-panier.component.html',
  styleUrls: ['./commande-panier.component.css']
})
export class CommandePanierComponent implements OnInit {
  panier: Commande | null = null; // panier peut être null
  isLoading: boolean = false;
  errorMessage: string = '';
  showSuccessModal: boolean = false;

  constructor(
    private commandeService: CommandeService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPanier();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  goToOrders(): void {
    this.closeSuccessModal();
    this.router.navigate(['/liste-commandes']);
  }

  continueShopping(): void {
    this.closeSuccessModal();
    this.router.navigate(['/produits']);
  }

loadPanier(): void {
  this.isLoading = true;

  // Récupérer le user depuis le localStorage
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    this.errorMessage = "Utilisateur non connecté";
    this.isLoading = false;
    this.showSuccessModal = false;
    return;
  }

  const user = JSON.parse(currentUser);
  const userId = user.id;

  this.commandeService.getCommandesUtilisateur(userId).subscribe({
    next: (commandes: Commande[]) => {
      // On récupère le panier actif (commande en préparation)
      this.panier = commandes.find(c => c.statut === 'en_preparation') || null;

      if (!this.panier) {
        this.errorMessage = "Votre panier est vide.";
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = "Impossible de charger le panier.";
      this.isLoading = false;
    }
  });
}


  getProduitImageUrl(produit: any): string {
    if (!produit || !produit.image_principale) return 'assets/images/no-image.jpg';
    return produit.image_principale.startsWith('http') 
      ? produit.image_principale 
      : `http://localhost:8000/storage/${produit.image_principale}`;
  }

  formatPrice(value: number | string): string {
    return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  calculerTotalGlobal(): number {
    return this.panier?.produits?.reduce((acc, p) => acc + Number(p.prix_total), 0) || 0;
  }

  supprimerProduit(produitId?: number): void {
    if (!produitId) return;
    this.commandeService.retirerProduitDuPanier(produitId).subscribe({
      next: () => {
        this.toastr.success('Produit retiré du panier');
        this.loadPanier();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Impossible de retirer le produit du panier");
      }
    });
  }

  validerCommande(): void {
    if (!this.panier) {
      this.toastr.warning('Votre panier est vide.');
      return;
    }
    if (this.isLoading) return;
    this.isLoading = true;

    const commandeId = this.panier.id; // cache l'id pour les appels suivants

    // 1) Valider la commande (passe en livraison)
    this.commandeService.updateStatutCommande(commandeId, 'en_livraison').subscribe({
      next: () => {
        this.toastr.success('Commande validée avec succès', 'Succès');
        // Vider immédiatement le panier côté UI et notifier la navbar
        this.panier = null;
        try { window.dispatchEvent(new CustomEvent('cart:changed')); } catch {}

        // 2) Générer et télécharger la facture
        this.toastr.info('Génération de la facture…', 'Veuillez patienter');
        this.commandeService.genererFacture(commandeId).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-commande-${commandeId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            this.toastr.success('Facture téléchargée', 'Succès');

            // 3) Envoyer la facture par email (après génération réussie)
            this.commandeService.envoyerFactureParEmail(commandeId).subscribe({
              next: () => this.toastr.success('Facture envoyée par email', 'Succès'),
              error: (err) => {
                console.error(err);
                this.toastr.warning('Envoi de la facture par email non abouti');
              }
            });

            // Afficher le modal de confirmation
            this.showSuccessModal = true;

          },
          error: (err) => {
            console.error(err);
            this.toastr.error('Impossible de générer/télécharger la facture');
          }
        });

        // Rafraîchir le panier après les actions (sécurité)
        this.loadPanier();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Impossible de valider la commande');
        this.isLoading = false;
      }
    });
  }
}
