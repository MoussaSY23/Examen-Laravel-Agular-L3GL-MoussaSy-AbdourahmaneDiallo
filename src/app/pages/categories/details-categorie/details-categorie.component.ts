import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { ProduitService } from '../../../services/produit/produit.service';
import { Categorie } from '../../../models/categorie';
import { Produit } from '../../../models/produit';

@Component({
  selector: 'app-details-categorie',
  templateUrl: './details-categorie.component.html',
  styleUrls: ['./details-categorie.component.scss']
})
export class DetailsCategorieComponent implements OnInit {
  categorie: Categorie | null = null;
  produits: Produit[] = [];
  loading: boolean = false;
  error: string = '';
  currentYear: number = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categorieService: CategorieService,
    private produitService: ProduitService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getCategorieDetails(+id);
  }

  getCategorieDetails(id: number) {
    this.loading = true;
    this.categorieService.getCategorie(id).subscribe({
      next: (cat) => {
        this.categorie = cat;
        this.getProduitsCategorie(id);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement de la catégorie.';
        this.loading = false;
      }
    });
  }

  getProduitsCategorie(catId: number) {
    this.produitService.getProduitsParCategorie2(catId).subscribe({
      next: (data) => {
        this.produits = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors du chargement des produits.';
        this.loading = false;
      }
    });
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

  goToProduitDetails(id?: number) {
    if (id) this.router.navigate(['/details-produit', id]);
  }
}
