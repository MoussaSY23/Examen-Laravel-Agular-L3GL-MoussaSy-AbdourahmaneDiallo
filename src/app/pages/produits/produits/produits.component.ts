import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../../services/produit/produit.service';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Produit } from '../../../models/produit';
import { Categorie } from '../../../models/categorie';
import { Router } from '@angular/router';

@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.scss']
})
export class ProduitsComponent implements OnInit {

  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  categories: Categorie[] = [];

  searchTerm: string = '';
  selectedCategory: number | 'all' = 'all';

  page: number = 1;
  pageSize: number = 8;

  loading: boolean = false;
  error: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getProduits();
  }

  getCategories(): void {
    this.categorieService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Erreur catégories:', err)
    });
  }

  getProduits(): void {
    this.loading = true;
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des produits.';
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.produitsFiltres = this.produits.filter((p) => {
      const matchCategory =
        this.selectedCategory === 'all' || p.categorie_id === this.selectedCategory;
      const matchSearch = p.nom.toLowerCase().includes(term);
      return matchCategory && matchSearch;
    });
    this.page = 1;
  }

  resetFiltres(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.appliquerFiltres();
  }

  get totalPages(): number {
    return Math.ceil(this.produitsFiltres.length / this.pageSize) || 1;
  }

  get pagedProduits(): Produit[] {
    const start = (this.page - 1) * this.pageSize;
    return this.produitsFiltres.slice(start, start + this.pageSize);
  }

  changerPage(delta: number): void {
    const next = this.page + delta;
    this.page = Math.min(Math.max(1, next), this.totalPages);
  }

  getImageUrl(produit: Produit): string {
    return produit.image_principale
      ? `http://localhost:8000/storage/${produit.image_principale}`
      : '../../../../assets/default-avatar.png';
  }

  getStatut(produit: Produit): 'En stock' | 'Stock faible' | 'Rupture' {
    if (produit.stock === 0) return 'Rupture';
    if (produit.stock <= 10) return 'Stock faible';
    return 'En stock';
  }

  getProduitsByCategorie(catId: number): Produit[] {
    return this.produits.filter((p) => p.categorie_id === catId);
  }

  get totalProduits(): number {
    return this.produits.length;
  }

  get produitsPromo(): number {
    return this.produits.filter((p) => p.en_promotion).length;
  }

  get produitsStockFaible(): number {
    return this.produits.filter((p) => p.stock <= 10 && p.stock > 0).length;
  }

  voirDetails(produit: Produit): void {
    console.log('/details-produit', produit.id);
  }

  modifierProduit(produit: Produit): void {
    this.router.navigate(['/produit-form', produit.id]);
  }

  supprimerProduit(produit: Produit): void {
    if (!produit.id) return;
    if (confirm(`Supprimer le produit « ${produit.nom} » ?`)) {
      this.produitService.deleteProduit(produit.id).subscribe({
        next: () => this.getProduits(),
        error: (err) => alert(err.message || 'Suppression impossible.')
      });
    }
  }

  trackByProduit = (_: number, p: Produit) => p.id;
  trackByCategorie = (_: number, c: Categorie) => c.id;
}
