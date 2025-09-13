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
  previewUrl: string | null = null; // aperçu de l'avatar

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser(); // infos immédiates
    // Garder l'en-tête synchronisé avec l'état global utilisateur
    this.authService.currentUser.subscribe(u => { if (u) this.user = u; });

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
          // Normaliser la réponse éventuelle { user: {...} } ou avec clés différentes
          const normalized = this.normalizeUserResponse(user as any);
          this.user = normalized; // source de vérité locale
          this.profileForm.patchValue({
            name: normalized.name || '',
            email: normalized.email || '',
            telephone: normalized.telephone || '',
            adresse: normalized.adresse || '',
            ville: normalized.ville || '',
            avatar: normalized.avatar || ''
          });
          this.previewUrl = null; // reset l'aperçu si on recharge
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
        const dataUrl = reader.result as string;
        this.profileForm.patchValue({ avatar: dataUrl });
        this.previewUrl = dataUrl;
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
            const normalized = this.normalizeUserResponse(user as any);
            this.user = normalized;
            this.authService.storeUserData(user); // met à jour le BehaviorSubject
            this.successMessage = 'Profil mis à jour avec succès !';
            this.errorMessage = '';
            this.editMode = false; // formulaire disparaît
            this.selectedFile = null;
            this.previewUrl = null;
          }
        },
        error: (err) => {
          this.errorMessage = err;
          this.successMessage = '';
        }
      });
  }

  getAvatarUrl(): string {
    // Priorité à l'aperçu local si disponible
    if (this.previewUrl) return this.previewUrl;
    const formAvatar = this.profileForm?.value?.avatar;
    if (typeof formAvatar === 'string' && formAvatar.startsWith('data:')) return formAvatar;
    const u = this.user?.avatar;
    if (typeof u === 'string' && /^(https?:\/\/|data:)/i.test(u)) return u;
    return u ? `http://localhost:8000/storage/${u}` : '../../../assets/dfault-avatar.png';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.successMessage = '';
    this.errorMessage = '';
    // recharger les infos depuis l'API ou remettre les valeurs actuelles utilisateur
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        telephone: this.user.telephone,
        adresse: this.user.adresse,
        ville: this.user.ville,
        avatar: this.user.avatar
      });
    }
  }

  // Normalise différentes formes de réponses backend vers notre interface User
  private normalizeUserResponse(payload: any): User {
    const raw = payload?.user ? payload.user : payload;
    const telephone = raw?.telephone ?? raw?.phone ?? raw?.tel ?? '';
    const adresse = raw?.adresse ?? raw?.address ?? '';
    const ville = raw?.ville ?? raw?.city ?? '';
    // avatar peut être une URL complète, une path storage, ou null
    let avatar: string | undefined = raw?.avatar ?? raw?.photo ?? raw?.image;
    if (avatar && typeof avatar === 'string') {
      // Si c'est déjà une data URL ou une URL http/https, garder tel quel
      if (/^(data:|https?:\/\/)/i.test(avatar)) {
        // ok
      } else {
        // sinon, construire l'URL storage présumée
        avatar = `http://localhost:8000/storage/${avatar}`;
      }
    }
    return {
      id: raw?.id,
      name: raw?.name ?? '',
      email: raw?.email ?? '',
      role: raw?.role ?? 'client',
      telephone,
      adresse,
      ville,
      avatar
    } as User;
  }
}
