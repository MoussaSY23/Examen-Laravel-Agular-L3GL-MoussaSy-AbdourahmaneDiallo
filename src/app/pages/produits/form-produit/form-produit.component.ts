import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitsService } from '../../../services/produit/test/produits.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-form-produit',
  templateUrl: './form-produit.component.html',
  styleUrls: ['./form-produit.component.css']
})
export class FormProduitComponent implements OnInit {
  produitForm!: FormGroup;
  categories: any[] = [];
  selectedMainFile: File | null = null;
  selectedFiles: File[] = [];
  imagesExisting: string[] = [];
  imagePrincipaleExisting: string | null = null;

  isEditMode = false;
  produitId?: number;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.produitForm = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      prix: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categorie_id: ['', Validators.required],
      unite: ['', Validators.required],
      actif: [true],
      en_promotion: [false],
      prix_promotion: [''],
      date_debut_promotion: [''],
      date_fin_promotion: ['']
    });

    this.loadCategories();

    // ✅ Écoute des changements d'ID dans l'URL
    this.route.paramMap.subscribe(paramMap => {
      const idParam = paramMap.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.produitId = Number(idParam);
        this.loadProduit(this.produitId);
      } else {
        this.isEditMode = false;
        this.produitId = undefined;
        this.resetForm();
      }
    });
  }

  loadCategories() {
    this.produitService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur catégories', err)
    });
  }

  loadProduit(id: number) {
    this.loading = true;
    this.produitService.getProduit(id).subscribe({
      next: (p) => {
        console.log('Produit chargé', p);
        this.produitForm.patchValue({
          nom: p.nom,
          description: p.description,
          prix: p.prix,
          stock: p.stock,
          categorie_id: p.categorie_id,
          unite: p.unite ?? '',
          actif: p.actif ?? true,
          en_promotion: p.en_promotion ?? false,
          prix_promotion: p.prix_promotion ?? '',
          date_debut_promotion: p.date_debut_promotion ?? '',
          date_fin_promotion: p.date_fin_promotion ?? ''
        });
        this.imagesExisting = Array.isArray(p.images) ? p.images : (p.images ? p.images : []);
        this.imagePrincipaleExisting = (p as any).image_principale ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produit', err);
        this.loading = false;
      }
    });
  }

  onMainFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) this.selectedMainFile = file;
  }

  onFilesChange(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length) this.selectedFiles = Array.from(files);
  }

  removeExistingImage(index: number) {
    this.imagesExisting.splice(index, 1);
  }

  onSubmit() {
    if (this.produitForm.invalid) {
      this.produitForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const values = this.produitForm.value;
    const fd = new FormData();

    fd.append('nom', values.nom);
    fd.append('description', values.description ?? '');
    fd.append('prix', String(values.prix));
    fd.append('stock', String(values.stock));
    fd.append('categorie_id', String(values.categorie_id));
    fd.append('unite', values.unite);
    fd.append('actif', values.actif ? '1' : '0');

    if (values.en_promotion) {
      fd.append('en_promotion', '1');
      if (values.prix_promotion) fd.append('prix_promotion', String(values.prix_promotion));
      if (values.date_debut_promotion) fd.append('date_debut_promotion', values.date_debut_promotion);
      if (values.date_fin_promotion) fd.append('date_fin_promotion', values.date_fin_promotion);
    }

    if (this.selectedMainFile) {
      fd.append('image_principale', this.selectedMainFile);
    } else if (this.isEditMode && this.imagePrincipaleExisting) {
      fd.append('image_principale_existing', this.imagePrincipaleExisting);
    }

    this.selectedFiles.forEach(file => fd.append('images[]', file));

    if (this.imagesExisting && this.imagesExisting.length) {
      fd.append('images_existing', JSON.stringify(this.imagesExisting));
    }

    if (this.isEditMode && this.produitId) {
      this.produitService.updateProduit(this.produitId, fd).subscribe({
        next: () => {
          alert('Produit mis à jour avec succès.');
          this.loading = false;
          this.router.navigate(['/produits']);
        },
        error: (err) => {
          console.error('Erreur update', err);
          alert('Erreur lors de la mise à jour. Vérifier la console.');
          this.loading = false;
        }
      });
    } else {
      this.produitService.addProduit(fd).subscribe({
        next: () => {
          alert('Produit ajouté avec succès.');
          this.resetForm();
          this.loading = false;
          this.router.navigate(['/produits']);
        },
        error: (err) => {
          console.error('Erreur create', err);
          alert('Erreur lors de la création. Vérifier la console.');
          this.loading = false;
        }
      });
    }
  }

  resetForm() {
    this.produitForm.reset({
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      categorie_id: '',
      unite: '',
      actif: true,
      en_promotion: false
    });
    this.selectedMainFile = null;
    this.selectedFiles = [];
    this.imagesExisting = [];
    this.imagePrincipaleExisting = null;
    this.isEditMode = false;
    this.produitId = undefined;
  }
}
