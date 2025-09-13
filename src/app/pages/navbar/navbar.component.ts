import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { CommandeService } from '../../services/commande/commande.service';
import { MessageService } from '../../services/message/message.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;
  cartCount: number = 0;
  unreadCount: number = 0;
  sub?: Subscription;
  private onCartChanged = () => this.refreshBadges();

  constructor(
    private authService: AuthService,
    private router: Router,
    private commandeService: CommandeService,
    private messageService: MessageService
  ) {}

ngOnInit(): void {
  this.user = this.authService.getCurrentUser();

  this.authService.currentUser.subscribe(u => {
    if (u) this.user = u; // Ne jamais écraser avec null
  });

  this.refreshBadges();
  this.sub = interval(10000).subscribe(() => this.refreshBadges());
  // Refresh badges immediately when cart changes
  window.addEventListener('cart:changed', this.onCartChanged as EventListener);
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/Connexion']);
  }

  getAvatarUrl(): string {
    return this.user?.avatar ? `http://localhost:8000/storage/${this.user.avatar}` : '../../../assets/dfault-avatar.png';
  }

  private refreshBadges(): void {
    const u = this.authService.getCurrentUser();
    if (!u) { this.cartCount = 0; this.unreadCount = 0; return; }

    // Panier actif pour client: somme des quantités
    if (this.isClient()) {
      const uid = Number((u as any).id || 0);
      this.commandeService.getCommandesUtilisateur(uid).subscribe({
        next: (list: any[]) => {
          const panier = (list || []).find(c => c.statut === 'en_preparation');
          if (!panier || !Array.isArray(panier.produits)) { this.cartCount = 0; return; }
          this.cartCount = panier.produits.reduce((sum: number, p: any) => sum + (p.quantite || 0), 0);
        },
        error: () => { this.cartCount = 0; }
      });
    }

    // Non lus pour tout utilisateur authentifié
    this.messageService.getUnreadCount().subscribe({
      next: (res: any) => this.unreadCount = (res?.count ?? 0),
      error: () => this.unreadCount = 0
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    window.removeEventListener('cart:changed', this.onCartChanged as EventListener);
  }
}
