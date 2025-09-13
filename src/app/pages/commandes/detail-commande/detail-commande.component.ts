import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Commande, ProduitCommande, StatutCommande } from '../../../models/commande';
import { User } from '../../../models/user';
import { ProduitsService, Produit } from "../../../services/produit/test/produits.service";
import { ToastrService } from 'ngx-toastr';

// Définition des statuts de commande
const STATUS_ORDER: StatutCommande[] = ['en_preparation', 'en_livraison', 'livree'];

@Component({
  selector: 'app-detail-commande',
  templateUrl: './detail-commande.component.html',
  styleUrls: ['./detail-commande.component.css']
})
export class DetailCommandeComponent implements OnInit {
  commande!: Commande;
  isLoading: boolean = false;
  errorMessage: string = '';
  employees: User[] = [];
  selectedEmployeId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private authService: AuthService,
    @Inject(ProduitsService) private produitService: ProduitsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCommande();
  }

  // --- Admin helpers for assignment ---
  private loadEmployees(): void {
    this.commandeService.getEmployees().subscribe({
      next: (users) => { this.employees = users || []; },
      error: (err) => { console.error(err); }
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserValue;
    return !!user && user.role === 'admin';
  }

  onAssignEmployeeChange(): void {
    if (!this.commande || !this.selectedEmployeId) return;
    this.commandeService.assignerCommande(this.commande.id, this.selectedEmployeId).subscribe({
      next: (res: any) => {
        this.toastr.success('Commande attribuée à l\'employé', 'Succès');
        if (res?.commande) {
          this.commande = { ...this.commande, ...res.commande } as any;
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Impossible d\'attribuer la commande');
      }
    });
  }

  loadCommande(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = "ID de commande invalide";
      return;
    }

    this.isLoading = true;
    this.commandeService.getCommande(+id).subscribe({
      next: (res: any) => {
        this.commande = res;
        // Normaliser les produits quelle que soit la forme retournée par l'API
        this.normalizeProduits();
        // Pré-sélectionner l'employé si déjà assigné
        this.selectedEmployeId = (this.commande as any)?.employe?.id;
        // Charger la liste des employés si admin
        if (this.isAdmin()) {
          this.loadEmployees();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erreur API commande :", err);
        this.errorMessage = "Impossible de récupérer la commande.";
        this.isLoading = false;
      }
    });
  }

  /**
   * Normalise this.commande.produits pour supporter:
   * - Laravel: produits = [Produit { pivot: { quantite, prix_unitaire, prix_total } }]
   * - API custom: produits = [{ quantite, prix_unitaire, prix_total, nom, prod? }]
   */
  private normalizeProduits(): void {
    const produits = (this.commande as any)?.produits || [];
    if (!Array.isArray(produits)) return;

    this.commande.produits = produits.map((item: any) => {
      // Cas Laravel: item est un produit, infos du pivot dans item.pivot
      if (item && item.pivot) {
        return {
          prod: item,
          quantite: item.pivot.quantite,
          prix_unitaire: item.pivot.prix_unitaire ?? item.prix ?? 0,
          prix_total: item.pivot.prix_total ?? (item.pivot.quantite * (item.pivot.prix_unitaire ?? item.prix ?? 0)),
          nom: item.nom
        } as any;
      }
      // Cas déjà normalisé ou API custom
      const prod = item.prod || {
        id: item.produit_id ?? item.id,
        nom: item.nom,
        description: item.description ?? '',
        prix: item.prix_unitaire ?? item.prix ?? 0,
        image_principale: item.image_principale ?? null,
        categorie_id: item.categorie_id ?? null,
        en_promotion: item.en_promotion ?? false,
        prix_promotion: item.prix_promotion ?? null,
        stock: item.stock ?? 0,
        unite: item.unite ?? 'unité',
        actif: true,
        images: item.images ?? []
      };
      return {
        prod,
        quantite: item.quantite ?? 1,
        prix_unitaire: item.prix_unitaire ?? prod.prix ?? 0,
        prix_total: item.prix_total ?? ((item.quantite ?? 1) * (item.prix_unitaire ?? prod.prix ?? 0)),
        nom: item.nom ?? prod.nom
      } as any;
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

  // Retourne l'URL de l'image du produit ou une image par défaut
  getProduitImageUrl(prod?: any): string {
    if (!prod) return 'assets/images/no-image.jpg';
    
    // Si c'est un objet Produit Angular
    if (prod.image_principale) {
      // Si l'image commence par http, c'est déjà une URL complète
      if (typeof prod.image_principale === 'string' && 
          (prod.image_principale.startsWith('http') || prod.image_principale.startsWith('assets/'))) {
        return prod.image_principale;
      }
      // Sinon, on construit l'URL complète
      return `http://localhost:8000/storage/${prod.image_principale}`;
    }
    
    // Si pas d'image, retourner l'image par défaut
    return 'assets/images/no-image.jpg';
  }

  formatPrice(value: number | string): string {
    if (!value) return "0 F CFA";
    return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.jpg';
  }

  /**
   * Retourne l'icône correspondant au statut
   */
  getStatutIcon(statut: string): string {
    switch (statut) {
      case 'en_preparation': return 'fas fa-clipboard-list';
      case 'en_livraison': return 'fas fa-truck';
      case 'livree': return 'fas fa-check-circle';
      case 'annulee': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  }

  /**
   * Vérifie si un statut est complété
   */
  isStatusCompleted(status: string): boolean {
    const currentStatusIndex = STATUS_ORDER.indexOf(this.commande?.statut as StatutCommande);
    const statusIndex = STATUS_ORDER.indexOf(status as StatutCommande);
    return statusIndex < currentStatusIndex;
  }

  /**
   * Vérifie si l'utilisateur peut mettre à jour le statut
   */
  canUpdateStatus(): boolean {
    if (!this.commande) return false;
    return this.commande.statut !== 'livree' && this.commande.statut !== 'annulee';
  }

  /**
   * Retourne le prochain statut possible
   */
  getNextStatus(): StatutCommande | null {
    if (!this.commande) return null;
    const currentIndex = STATUS_ORDER.indexOf(this.commande.statut as StatutCommande);
    return currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;
  }

  /**
   * Retourne le libellé du prochain statut
   */
  getNextStatusLabel(): string {
    const nextStatus = this.getNextStatus();
    return nextStatus ? this.getStatutLabel(nextStatus) : '';
  }

  /**
   * Met à jour le statut de la commande
   */
  updateOrderStatus(): void {
    if (!this.commande) return;
    
    const nextStatus = this.getNextStatus();
    if (!nextStatus) return;

    if (confirm(`Voulez-vous vraiment passer cette commande en statut "${this.getStatutLabel(nextStatus)}" ?`)) {
      this.commandeService.updateStatutCommande(this.commande.id, nextStatus).subscribe({
        next: (updatedCommande) => {
          this.commande = { ...this.commande, ...updatedCommande };
          this.toastr.success(`Statut de la commande mis à jour`, 'Succès');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du statut :', err);
          this.toastr.error('Une erreur est survenue lors de la mise à jour du statut', 'Erreur');
        }
      });
    }
  }

  /**
   * Mise à jour du statut via un select explicite
   */
  setOrderStatus(statut: string): void {
    const s = (statut as StatutCommande);
    if (!this.commande || !s || this.commande.statut === s) return;
    this.commandeService.updateStatutCommande(this.commande.id, s).subscribe({
      next: (updated) => {
        this.commande = { ...this.commande, ...updated };
        this.toastr.success('Statut mis à jour', 'Succès');
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Impossible de mettre à jour le statut');
      }
    });
  }

  refresh(): void {
    this.loadCommande();
  }

  goBack(): void {
    this.router.navigate(['/liste-commandes']);
  }

  assignToMe(): void {
    if (!this.commande) return;
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.toastr.error("Utilisateur non authentifié", "Erreur");
      return;
    }
    this.commandeService.assignerCommande(this.commande.id, userId).subscribe({
      next: (res: any) => {
        this.toastr.success('Commande assignée à vous', 'Succès');
        // Mettre à jour employé localement si renvoyé
        if (res?.commande) {
          this.commande = { ...this.commande, ...res.commande } as any;
        } else {
          this.refresh();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Impossible d'assigner la commande");
      }
    });
  }

  /**
   * Marque la commande comme livrée
   */
  markAsDelivered(): void {
    if (!this.commande) return;
    
    if (confirm('Confirmez-vous que cette commande a été livrée ?')) {
      this.commandeService.updateStatutCommande(this.commande.id, 'livree').subscribe({
        next: (updatedCommande) => {
          this.commande = { ...this.commande, ...updatedCommande };
          this.toastr.success('Commande marquée comme livrée', 'Succès');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du statut :', err);
          this.toastr.error('Une erreur est survenue', 'Erreur');
        }
      });
    }
  }

  /**
   * Annule la commande
   */
  cancelOrder(): void {
    if (!this.commande) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.')) {
      this.commandeService.updateStatutCommande(this.commande.id, 'annulee').subscribe({
        next: (updatedCommande) => {
          this.commande = { ...this.commande, ...updatedCommande };
          this.toastr.success('Commande annulée avec succès', 'Succès');
        },
        error: (err) => {
          console.error('Erreur lors de l\'annulation de la commande :', err);
          this.toastr.error('Une erreur est survenue lors de l\'annulation', 'Erreur');
        }
      });
    }
  }

  /**
   * Génère la facture au format PDF
   */
  printInvoice(): void {
    if (!this.commande) return;
    this.commandeService.genererFacture(this.commande.id).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err) => {
        console.error('Erreur lors de la génération de la facture :', err);
        this.toastr.error('Impossible de générer la facture', 'Erreur');
      }
    });
  }

  /**
   * Envoie la facture par email
   */
  sendInvoiceByEmail(): void {
    if (!this.commande) return;
    
    this.toastr.info('Envoi de la facture par email en cours...', 'Traitement');
    this.commandeService.envoyerFactureParEmail(this.commande.id).subscribe({
      next: () => {
        this.toastr.success('Facture envoyée avec succès', 'Succès');
      },
      error: (err) => {
        console.error('Erreur lors de l\'envoi de la facture :', err);
        this.toastr.error('Une erreur est survenue lors de l\'envoi de la facture', 'Erreur');
      }
    });
  }
}
