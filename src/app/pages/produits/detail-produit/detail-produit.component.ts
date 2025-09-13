import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitsService, Produit } from '../../../services/produit/test/produits.service';
import { CommandeService } from '../../../services/commande/commande.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail-produit',
  templateUrl: './detail-produit.component.html',
  styleUrls: ['./detail-produit.component.css']
})
export class DetailProduitComponent implements OnInit {
  produit?: Produit;
  relatedProducts: Produit[] = [];
  loading: boolean = false;
  quantity: number = 1;
  activeTab: 'description' | 'specifications' | 'reviews' = 'description';
  mainImage?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitsService,
    private commandeService: CommandeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadProduit(Number(idParam));
    }
  }

  loadProduit(id: number) {
    this.loading = true;
    this.produitService.getProduit(id).subscribe({
      next: (res) => {
        this.produit = res;
        this.mainImage = this.produit.image_principale
          ? `http://localhost:8000/storage/${this.produit.image_principale}`
          : 'assets/images/no-image.jpg';
        this.loadRelatedProducts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produit', err);
        this.loading = false;
      }
    });
  }

  loadRelatedProducts() {
    // Placeholder pour produits similaires
    this.relatedProducts = [];
  }

  changeMainImage(image: string) {
    this.mainImage = image;
  }

  incrementQuantity() {
    if (this.produit && this.quantity < this.produit.stock) this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  isOutOfStock(stock?: number) {
    return !stock || stock <= 0;
  }

  addToCart() {
    if (!this.produit?.id) return;
    if (this.isOutOfStock(this.produit.stock)) {
      this.toastr.error("Produit en rupture de stock", "Impossible d'ajouter");
      return;
    }
    const qty = Math.max(1, Math.min(this.quantity, this.produit.stock));
    this.commandeService.addProduitAuPanier(this.produit.id, qty).subscribe({
      next: () => {
        const image = this.mainImage || 'assets/images/no-image.jpg';
        this.toastr.success(
          `<div class="toast-cart">
            <img src="${image}" alt="${this.produit?.nom || ''}"/>
            <div class="info">
              <div class="title">Ajouté au panier</div>
              <div class="name">${this.produit?.nom}</div>
            </div>
          </div>`,
          '',
          { enableHtml: true, closeButton: true, progressBar: true, timeOut: 2500, positionClass: 'toast-top-right' }
        );
      },
      error: (err) => {
        console.error(err);
        this.toastr.error("Impossible d'ajouter le produit au panier");
      }
    });
  }

  buyNow() {
    if (!this.produit?.id) return;
    const qty = Math.max(1, Math.min(this.quantity, this.produit.stock || 1));
    this.commandeService.addProduitAuPanier(this.produit.id, qty).subscribe({
      next: () => {
        const image = this.mainImage || 'assets/images/no-image.jpg';
        this.toastr.success(
          `<div class=\"toast-cart\">
            <img src=\"${image}\" alt=\"${this.produit?.nom || ''}\"/>
            <div class=\"info\">
              <div class=\"title\">Ajouté au panier</div>
              <div class=\"name\">${this.produit?.nom}</div>
            </div>
          </div>`,
          '',
          { enableHtml: true, closeButton: true, progressBar: true, timeOut: 1500, positionClass: 'toast-top-right' }
        );
        this.router.navigate(['/commande/panier']);
      },
      error: () => this.router.navigate(['/commande/panier'])
    });
  }

  setActiveTab(tab: 'description' | 'specifications' | 'reviews') {
    this.activeTab = tab;
  }

  formatPrice(value: number | string) {
    return Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.jpg';
  }

  goToProductDetail(id: number) {
    this.router.navigate(['/details-produit', id]);
  }
}
