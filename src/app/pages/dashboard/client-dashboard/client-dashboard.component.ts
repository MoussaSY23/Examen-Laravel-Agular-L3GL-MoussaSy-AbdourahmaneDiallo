import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProduitService } from '../../../services/produit/produit.service';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Produit } from '../../../models/produit';
import { Categorie } from '../../../models/categorie';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit, AfterViewInit {
  isLoading = true;
  produitsRecents: Produit[] = [];
  categories: Categorie[] = [];

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Récupération catégories
    this.categorieService.getCategories().subscribe({
      next: cats => this.categories = cats || [],
      error: () => this.toastr.error('Impossible de charger les catégories')
    });

    // Récupération produits
    this.produitService.getProduits().subscribe({
      next: list => {
        this.produitsRecents = (list || []).slice(0, 12); // afficher les 12 plus récents
        this.isLoading = false;
      },
      error: () => { 
        this.isLoading = false;
        this.toastr.error('Impossible de charger les produits');
      }
    });
  }

  ngAfterViewInit(): void {}

  getImageUrl(item: Produit | Categorie): string {
    if ('image' in item && item.image) return `http://localhost:8000/storage/${item.image}`;
    if ('image_principale' in item && item.image_principale) return `http://localhost:8000/storage/${item.image_principale}`;
    return 'assets/prod-default.jpg';
  }

  goProduits() { this.router.navigate(['/produits']); }
  goCategories() { this.router.navigate(['/categories']); }


  
}


