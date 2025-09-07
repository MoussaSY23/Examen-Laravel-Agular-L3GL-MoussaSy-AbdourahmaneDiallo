import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/user';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-mon-profil',
  templateUrl: './mon-profil.component.html',
  styleUrls: ['./mon-profil.component.css']
})
export class MonProfilComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  editMode = false; // 🔹 contrôle l'affichage du formulaire

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser(); // infos immédiates

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      adresse: [''],
      ville: [''],
      password: [''],
      password_confirmation: [''],
      avatar: ['']
    });

    this.loadProfile();
  }

  // Charger profil sans toucher au BehaviorSubject
  loadProfile() {
    this.isLoading = true;
    this.authService.getProfile()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          if (!user) return;
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            telephone: user.telephone,
            adresse: user.adresse,
            ville: user.ville,
            avatar: user.avatar
          });
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Impossible de récupérer le profil';
        }
      });
  }

  // 🔹 toggle pour afficher/cacher le formulaire
  toggleEdit() {
    this.editMode = !this.editMode;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const formData = new FormData();
    formData.append('name', this.profileForm.value.name);
    formData.append('email', this.profileForm.value.email);
    formData.append('telephone', this.profileForm.value.telephone || '');
    formData.append('adresse', this.profileForm.value.adresse || '');
    formData.append('ville', this.profileForm.value.ville || '');
    if (this.profileForm.value.password) {
      formData.append('password', this.profileForm.value.password);
      formData.append('password_confirmation', this.profileForm.value.password_confirmation);
    }
    if (this.selectedFile) formData.append('avatar', this.selectedFile);

    this.authService.updateProfile(formData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.authService.storeUserData(user); // met à jour le BehaviorSubject
            this.successMessage = 'Profil mis à jour avec succès !';
            this.errorMessage = '';
            this.editMode = false; // formulaire disparaît
          }
        },
        error: (err) => {
          this.errorMessage = err;
          this.successMessage = '';
        }
      });
  }

  getAvatarUrl(): string {
    return this.user?.avatar ? `http://localhost:8000/storage/${this.user.avatar}` : '../../../assets/images.jpeg';
  }
}
