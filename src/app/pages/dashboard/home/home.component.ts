import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ProduitService } from '../../../services/produit/produit.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Produit } from '../../../models/produit';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  produits: Produit[] = [];
  isLoading = true;
  error: string | null = null;
  
  @ViewChild('slider') slider!: ElementRef;

  constructor(
    private authService: AuthService,
    private produitService: ProduitService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
  }

  chargerProduits(): void {
    this.isLoading = true;
    this.error = null;
    
    this.produitService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits:', err);
        this.error = 'Impossible de charger les produits. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/Connexion']);
  }

  getPrixAffichage(produit: Produit): number {
    return produit.en_promotion && produit.prix_promotion 
      ? produit.prix_promotion 
      : produit.prix;
  }

  estEnPromotion(produit: Produit): boolean {
    return produit.en_promotion && produit.prix_promotion !== undefined;
  }

  scrollSlider(direction: number): void {
    const sliderElement = this.slider.nativeElement;
    const scrollAmount = 300; // Ajustez cette valeur selon la largeur de vos cartes
    
    if (direction === 1) {
      sliderElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      sliderElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }
}