import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
  this.user = this.authService.getCurrentUser();

  this.authService.currentUser.subscribe(u => {
    if (u) this.user = u; // Ne jamais écraser avec null
  });
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
}
