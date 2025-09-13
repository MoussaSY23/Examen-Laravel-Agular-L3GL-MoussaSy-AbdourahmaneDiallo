import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitsService } from '../../../services/produit/test/produits.service';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-produit',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.css']
})
export class AddProduitComponent implements OnInit {
  produitForm!: FormGroup;
  categories: any[] = [];
  loading = false;
  selectedMainFile: File | null = null;
  selectedMainPreview: string | null = null;
  selectedFiles: File[] = [];
  selectedFilesNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitsService,
    private categorieService: CategorieService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.produitForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      prix: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categorie_id: ['', Validators.required],
      unite: [''],
      actif: [true],
      en_promotion: [false],
      prix_promotion: [''],
      date_debut_promotion: [''],
      date_fin_promotion: ['']
    });

    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getCategories().subscribe({
      next: (cats) => (this.categories = cats || []),
      error: (err) => {
        console.error('Erreur chargement catégories', err);
        this.toastr.error('Impossible de charger les catégories');
      }
    });
  }

  // MAIN IMAGE
  onMainFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    if (file) {
      this.selectedMainFile = file;
      // preview
      if (this.selectedMainPreview) {
        URL.revokeObjectURL(this.selectedMainPreview);
      }
      this.selectedMainPreview = URL.createObjectURL(file);
    } else {
      this.selectedMainFile = null;
      if (this.selectedMainPreview) { URL.revokeObjectURL(this.selectedMainPreview); }
      this.selectedMainPreview = null;
    }
  }

  // MULTIPLE IMAGES
  onFilesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length) {
      this.selectedFiles = Array.from(files);
      this.selectedFilesNames = this.selectedFiles.map(f => f.name);
    } else {
      this.selectedFiles = [];
      this.selectedFilesNames = [];
    }
  }

  removeSelectedFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.selectedFilesNames.splice(index, 1);
  }

  // VALIDATION HELPERS
  get f() { return this.produitForm.controls; }

  submit() {
    if (this.produitForm.invalid) {
      this.produitForm.markAllAsTouched();
      this.toastr.warning('Veuillez corriger les champs requis.');
      return;
    }

    this.loading = true;

    const v = this.produitForm.value;
    const fd = new FormData();

    fd.append('nom', v.nom);
    fd.append('description', v.description || '');
    fd.append('prix', String(v.prix));
    fd.append('stock', String(v.stock));
    fd.append('categorie_id', String(v.categorie_id));
    fd.append('unite', v.unite || '');
    fd.append('actif', v.actif ? '1' : '0');

    if (v.en_promotion) {
      fd.append('en_promotion', '1');
      if (v.prix_promotion) fd.append('prix_promotion', String(v.prix_promotion));
      if (v.date_debut_promotion) fd.append('date_debut_promotion', v.date_debut_promotion);
      if (v.date_fin_promotion) fd.append('date_fin_promotion', v.date_fin_promotion);
    }

    if (this.selectedMainFile) {
      fd.append('image_principale', this.selectedMainFile);
    }

    this.selectedFiles.forEach(f => fd.append('images[]', f));

    this.produitService.addProduit(fd).subscribe({
      next: (res) => {
        this.toastr.success('Produit ajouté avec succès');
        this.loading = false;
        // cleanup previews
        if (this.selectedMainPreview) { URL.revokeObjectURL(this.selectedMainPreview); }
        this.router.navigate(['/produits']);
      },
      error: (err) => {
        console.error('Erreur création produit', err);
        this.toastr.error('Erreur lors de la création du produit');
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/produits']);
  }
}
