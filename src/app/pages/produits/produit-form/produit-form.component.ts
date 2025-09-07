// src/app/components/produit/produit-form/produit-form.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProduitService } from '../../../services/produit/produit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Produit } from '../../../models/produit';
import { Categorie } from '../../../models/categorie';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-produit-form',
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.css']
})
export class ProduitFormComponent{}
// export class ProduitFormComponent implements OnInit {
  // produitForm!: FormGroup;
  // isLoading = false;
  // successMessage = '';
  // errorMessage = '';
  // selectedFile: File | null = null;
  // selectedImage: File | null = null;
  // additionalImages: File[] = [];
  // imagePreviews: string[] = [];
  // imagePreview: string | ArrayBuffer | null = null;
  // formData: FormData = new FormData();
  // editMode = false;
  // produitId: number | null = null;
  // categories: Categorie[] = [];
  // showPromotionForm = false;
  // promotionForm: FormGroup = this.fb.group({
  //   prix_promotion: ['', [Validators.required, Validators.min(0.01)]],
  //   date_debut: ['', Validators.required],
  //   date_fin: ['', Validators.required]
  // });

  // constructor(
  //   private fb: FormBuilder,
  //   private produitService: ProduitService,
  //   private route: ActivatedRoute,
  //   private router: Router,
  //   private toastr: ToastrService
  // ) {}

  // ngOnInit(): void {
  //   this.produitId = Number(this.route.snapshot.paramMap.get('id'));
  //   this.editMode = !!this.produitId;
    
  //   // Initialiser le formulaire de promotion
  //   this.initPromotionForm();
    
  //   // Charger les catégories
  //   this.loadCategories();

  //   this.produitForm = this.fb.group({
  //     nom: ['', Validators.required],
  //     description: ['', Validators.required],
  //     prix: [0, [Validators.required, Validators.min(0)]],
  //     stock: [0, [Validators.required, Validators.min(0)]],
  //     categorie_id: [null, Validators.required],
  //     unite: ['', Validators.required],
  //     actif: [true],
  //     image_principale: ['']
  //   });

  //   if (this.editMode && this.produitId) {
  //     this.loadProduit(this.produitId);
  //   }
  // }

  // // Initialiser le formulaire de promotion
  // private initPromotionForm(): void {
  //   // Le formulaire est déjà initialisé dans la déclaration de la propriété
  //   // Cette méthode est conservée pour une éventuelle réinitialisation
  //   this.promotionForm.reset({
  //     prix_promotion: '',
  //     date_debut: '',
  //     date_fin: ''
  //   });
  // }

  // // Basculer l'affichage du formulaire de promotion
  // togglePromotionForm(): void {
  //   this.showPromotionForm = !this.showPromotionForm;
  // }

  // // Gérer la sélection d'images supplémentaires
  // onAdditionalImagesSelected(event: any): void {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;

  //   Array.from(files).forEach((file: any) => {
  //     if (file.type.match('image.*')) {
  //       this.additionalImages.push(file);
        
  //       // Créer un aperçu de l'image
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         this.imagePreviews.push(e.target.result);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   });
  // }

  // // Supprimer une image supplémentaire
  // removeAdditionalImage(index: number): void {
  //   this.additionalImages.splice(index, 1);
  //   this.imagePreviews.splice(index, 1);
  // }

  // loadProduit(id: number) {
  //   this.isLoading = true;
  //   this.produitService.getProduit(id)
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: (produit: Produit) => {
  //         // Sauvegarder l'URL de l'image existante
  //         if (produit.image_principale) {
  //           this.imagePreview = this.getImageUrl(produit.image_principale);
  //         }
          
  //         // Charger les images supplémentaires si elles existent
  //         if (produit.images && Array.isArray(produit.images)) {
  //           this.imagePreviews = produit.images.map(img => this.getImageUrl(img));
  //         }
          
  //         this.produitForm.patchValue({
  //           nom: produit.nom,
  //           description: produit.description,
  //           prix: produit.prix,
  //           stock: produit.stock,
  //           categorie_id: produit.categorie_id,
  //           unite: produit.unite,
  //           actif: produit.actif,
  //           image_principale: produit.image_principale,
  //           en_promotion: produit.en_promotion,
  //           prix_promotion: produit.prix_promotion,
  //           date_debut_promotion: produit.date_debut_promotion,
  //           date_fin_promotion: produit.date_fin_promotion
  //         });
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.errorMessage = 'Impossible de charger le produit.';
  //       }
  //     });
  // }

  // onFileChange(event: any): void {
  //   const file = event.target.files[0];
  //   if (!file) return;
    
  //   // Vérification du type de fichier
  //   const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  //   if (!validTypes.includes(file.type)) {
  //     this.toastr.error('Format de fichier non supporté. Veuillez utiliser une image au format JPG ou PNG.');
  //     return;
  //   }
    
  //   // Vérification de la taille du fichier (max 5MB)
  //   const maxSize = 5 * 1024 * 1024; // 5MB
  //   if (file.size > maxSize) {
  //     this.toastr.error('La taille du fichier ne doit pas dépasser 5 Mo');
  //     return;
  //   }
    
  //   this.selectedFile = file;
  //   this.selectedImage = file;
    
  //   // Mise à jour du formulaire
  //   this.produitForm.patchValue({
  //     image_principale: file.name
  //   });
    
  //   // Aperçu de l'image
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     this.imagePreview = e.target.result;
  //   };
  //   reader.onerror = (error) => {
  //     console.error('Erreur lors de la lecture du fichier:', error);
  //     this.toastr.error('Erreur lors de la lecture du fichier image');
  //   };
  //   reader.readAsDataURL(file);
  // }

  // saveProduit(): void {
  //   // Marquage de tous les champs comme touchés pour afficher les erreurs
  //   this.produitForm.markAllAsTouched();
    
  //   if (this.produitForm.invalid) {
  //     this.scrollToFirstInvalidControl();
  //     this.toastr.error('Veuillez corriger les erreurs dans le formulaire');
  //     return;
  //   }

  //   const formValues = this.produitForm.value;
    
  //   // Créer un nouvel objet FormData
  //   const formData = new FormData();
    
  //   // Ajouter uniquement les champs qui ont une valeur et qui ont été modifiés
  //   Object.keys(formValues).forEach(key => {
  //     // Ne pas ajouter l'image directement, on la gère séparément
  //     if (key === 'image_principale' || key === 'images') return;
      
  //     const value = formValues[key];
  //     if (value !== null && value !== undefined && value !== '') {
  //       // Pour les booléens, s'assurer qu'ils sont correctement convertis
  //       if (typeof value === 'boolean') {
  //         formData.append(key, value ? '1' : '0');
  //       } else if (key === 'categorie_id') {
  //         // S'assurer que l'ID de catégorie est un nombre
  //         formData.append(key, value.toString());
  //       } else {
  //         formData.append(key, value);
  //       }
  //     }
  //   });
    
  //   // Gestion de l'image principale
  //   if (this.selectedImage) {
  //     formData.delete('image_principale'); // Supprimer si déjà présent
  //     formData.append('image_principale', this.selectedImage, this.selectedImage.name);
  //   } else if (this.editMode && this.produitForm.value.image_principale) {
  //     // Si en mode édition et qu'aucune nouvelle image n'a été sélectionnée
  //     formData.append('image_principale_existing', this.produitForm.value.image_principale);
  //   }
    
  //   // Activer l'indicateur de chargement
  //   this.isLoading = true;
    
  //   // Désactiver le formulaire pendant la soumission
  //   if (this.editMode && this.produitId) {
  //     // Mettre à jour le produit existant
  //     this.updateProduit(formData);
  //   } else {
  //     // Créer un nouveau produit
  //     this.createProduit(formData);
  //   }
  // }
  
  // // Méthode pour mettre à jour un produit existant
  // private updateProduit(formData: FormData): void {
  //   if (!this.produitId) return;
    
  //   this.produitService.updateProduit(this.produitId, formData).subscribe({
  //     next: (produit) => {
  //       this.toastr.success('Produit mis à jour avec succès');
  //       this.isLoading = false;
  //       this.router.navigate(['/produits']);
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la mise à jour du produit:', error);
        
  //       // Gestion des erreurs spécifiques
  //       if (error.status === 422 && error.error?.errors) {
  //         // Afficher les erreurs de validation
  //         Object.values(error.error.errors).forEach((messages: any) => {
  //           if (Array.isArray(messages)) {
  //             messages.forEach((message: string) => this.toastr.error(message));
  //           } else {
  //             this.toastr.error(String(messages));
  //           }
  //         });
  //       } else if (error.status === 401) {
  //         this.toastr.error('Session expirée. Veuillez vous reconnecter.');
  //         // this.authService.logout();
  //         // this.router.navigate(['/login']);
  //       } else {
  //         this.toastr.error(error.message || 'Une erreur est survenue lors de la mise à jour du produit');
  //       }
        
  //       this.isLoading = false;
  //     },
  //     complete: () => {
  //       this.isLoading = false;
  //     }
  //   });
  // }
  
  // // Méthode pour créer un nouveau produit
  // private createProduit(formData: FormData): void {
  //   this.produitService.createProduit(formData).subscribe({
  //     next: (produit) => {
  //       this.toastr.success('Produit créé avec succès');
  //       this.isLoading = false;
  //       this.router.navigate(['/produits']);
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la création du produit:', error);
        
  //       // Gestion des erreurs spécifiques
  //       if (error.status === 422 && error.error?.errors) {
  //         // Afficher les erreurs de validation
  //         Object.values(error.error.errors).forEach((messages: any) => {
  //           if (Array.isArray(messages)) {
  //             messages.forEach((message: string) => this.toastr.error(message));
  //           } else {
  //             this.toastr.error(String(messages));
  //           }
  //         });
  //       } else if (error.status === 401) {
  //         this.toastr.error('Session expirée. Veuillez vous reconnecter.');
  //         // this.authService.logout();
  //         // this.router.navigate(['/login']);
  //       } else {
  //         this.toastr.error(error.message || 'Une erreur est survenue lors de la création du produit');
  //       }
        
  //       this.isLoading = false;
  //     },
  //     complete: () => {
  //       this.isLoading = false;
  //     }
  //   });
  // }
  
  // // Faire défiler jusqu'au premier champ invalide
  // private scrollToFirstInvalidControl(): void {
  //   const firstInvalidControl = document.querySelector('.ng-invalid');
  //   if (firstInvalidControl) {
  //     firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   }
  // }

  // // Obtenir l'URL complète de l'image
  // getImageUrl(imageName: string): string {
  //   if (!imageName) return '';
  //   // Si c'est déjà une URL complète, on la retourne telle quelle
  //   if (imageName.startsWith('http')) {
  //     return imageName;
  //   }
  //   // Si c'est un chemin relatif, on construit l'URL complète
  //   if (imageName.startsWith('storage/')) {
  //     return `http://localhost:8000/${imageName}`;
  //   }
  //   // Sinon, on suppose que c'est juste le nom du fichier
  //   return `http://localhost:8000/storage/${imageName}`;
  // }

  // // Appliquer une promotion
  // applyPromotion(): void {
  //   if (this.promotionForm.invalid || !this.produitId) return;

  //   this.isLoading = true;
  //   this.produitService.applyPromotion(this.produitId, this.promotionForm.value)
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: (produit) => {
  //         this.toastr.success('Promotion appliquée avec succès');
  //         this.showPromotionForm = false;
  //         // Mettre à jour le formulaire avec les nouvelles valeurs
  //         this.produitForm.patchValue({
  //           en_promotion: true,
  //           prix_promotion: produit.prix_promotion,
  //           date_debut_promotion: produit.date_debut_promotion,
  //           date_fin_promotion: produit.date_fin_promotion
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Erreur lors de l\'application de la promotion:', error);
  //         this.toastr.error('Erreur lors de l\'application de la promotion');
  //       }
  //     });
  // }

  // // Annuler la promotion
  // cancelPromotion(): void {
  //   if (!this.produitId) return;

  //   this.isLoading = true;
  //   this.produitService.applyPromotion(this.produitId, { cancel: true })
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: () => {
  //         this.toastr.success('Promotion annulée avec succès');
  //         this.showPromotionForm = false;
  //         // Réinitialiser les champs de promotion
  //         this.produitForm.patchValue({
  //           en_promotion: false,
  //           prix_promotion: null,
  //           date_debut_promotion: null,
  //           date_fin_promotion: null
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Erreur lors de l\'annulation de la promotion:', error);
  //         this.toastr.error('Erreur lors de l\'annulation de la promotion');
  //       }
  //     });
  // }

  // // Charger la liste des catégories
  // private loadCategories(): void {
  //   this.isLoading = true;
  //   this.produitService.getCategories().subscribe({
  //     next: (categories) => {
  //       this.categories = categories;
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors du chargement des catégories:', error);
  //       this.toastr.error('Impossible de charger les catégories');
  //     },
  //     complete: () => {
  //       this.isLoading = false;
  //     }
  //   });
  // }
  
  // onCancel(): void {
  //   this.router.navigate(['/produits']);
  // }
// }
