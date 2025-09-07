// src/app/components/categories-form/categories-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Categorie } from '../../../models/categorie';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.css']
})
export class CategoriesFormComponent implements OnInit {
  categorieForm!: FormGroup;
  isEditMode = false;
  categorieId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      position: [0],
      actif: [true]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.categorieId = +id;
        this.loadCategorie(this.categorieId);
      }
    });
  }

  /** Charger une catégorie existante */
  loadCategorie(id: number): void {
    this.loading = true;
    this.categorieService.getCategorie(id).subscribe({
      next: (cat: Categorie) => {
        this.categorieForm.patchValue({
          nom: cat.nom,
          description: cat.description,
          position: cat.position,
          actif: !!cat.actif // conversion 0/1 en boolean
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la catégorie ❌';
        this.loading = false;
      }
    });
  }

  /** Soumettre formulaire */
  onSubmit(): void {
    if (this.categorieForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.categorieForm.value;

    if (this.isEditMode && this.categorieId) {
      // Mode modification
      this.categorieService.updateCategorie(this.categorieId, formData).subscribe({
        next: () => {
          this.successMessage = 'Catégorie mise à jour avec succès ✅';
          setTimeout(() => this.router.navigate(['/categories']), 1200);
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la mise à jour de la catégorie ❌';
        }
      });
    } else {
      // Mode ajout
      this.categorieService.createCategorie(formData).subscribe({
        next: () => {
          this.successMessage = 'Catégorie créée avec succès ✅';
          setTimeout(() => this.router.navigate(['/categories']), 1200);
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la création de la catégorie ❌';
        }
      });
    }
  }
}
