import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { ProduitsService, Produit } from '../../../services/produit/test/produits.service';
import { Categorie } from '../../../models/categorie';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user';

@Component({
  selector: 'app-liste-categories',
  templateUrl: './liste-categories.component.html',
  styleUrls: ['./liste-categories.component.css']
})
export class ListeCategoriesComponent implements OnInit {
  user: User | null = null;
  categories: Categorie[] = [];
  produitsRecents: Produit[] = [];
  loading: boolean = false;

  constructor(
    private categorieService: CategorieService,
    private produitService: ProduitsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProduitsRecents();
    this.user = this.authService.currentUserValue;
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  isEmploye(): boolean {
    return this.user?.role === 'employee';
  }

  isClient(): boolean {
    return this.user?.role === 'client';
  }

  loadCategories() {
    this.loading = true;
    this.categorieService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement catégories', err);
        this.loading = false;
      }
    });
  }

  loadProduitsRecents() {
    this.produitService.getProduits().subscribe({
      next: (produits) => {
        // on prend les 10 derniers produits
        this.produitsRecents = produits.slice(-10).reverse();
      },
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  goToCategorieDetails(categorieId: number) {
    this.router.navigate(['/details-categorie', categorieId]);
  }

goToProduitDetails(id: number | undefined) {
  if (id === undefined) return;
  this.router.navigate(['/details-produit', id]);
}

goToContact(){

}

goToProduits(){
  this.router.navigate(['/produits']);
}

goToPromotions(){
  this.router.navigate(['/promotions']);
}

}
