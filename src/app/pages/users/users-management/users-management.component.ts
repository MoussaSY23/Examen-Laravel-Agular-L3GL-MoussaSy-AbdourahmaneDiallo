import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../services/user/users.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../models/user';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  filtered: User[] = [];
  isLoading = false;
  query = '';
  activeRole: 'all' | 'admin' | 'employee' | 'client' = 'all';

  // Stats
  totalCount = 0;
  adminCount = 0;
  employeeCount = 0;
  clientCount = 0;

  // Loading state for role updates
  private loadingRoleIds = new Set<number>();

  // Confirmation modal state
  pendingAction: { type: 'role' | 'delete'; user: User; newRole?: 'admin'|'employee'|'client' } | null = null;

  roles: Array<{ key: 'admin'|'employee'|'client'; label: string; }> = [
    { key: 'admin', label: 'Admin' },
    { key: 'employee', label: 'Employé' },
    { key: 'client', label: 'Client' },
  ];

  constructor(private usersService: UsersService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.usersService.getUsers().subscribe({
      next: (list) => {
        this.users = list || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error("Impossible de charger les utilisateurs");
      }
    });
  }

  applyFilters(): void {
    const q = this.query.trim().toLowerCase();
    // Update stats from full list
    this.totalCount = this.users.length;
    this.adminCount = this.users.filter(u => u.role === 'admin').length;
    this.employeeCount = this.users.filter(u => u.role === 'employee').length;
    this.clientCount = this.users.filter(u => u.role === 'client').length;

    this.filtered = this.users
      .filter(u => this.activeRole === 'all' ? true : u.role === this.activeRole)
      .filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }

  setRoleFilter(role: 'all'|'admin'|'employee'|'client') {
    this.activeRole = role;
    this.applyFilters();
  }

  onSearch(q: string) {
    this.query = q;
    this.applyFilters();
  }

  // Prompt before changing role
  promptChangeRole(user: User, newRole: 'admin'|'employee'|'client') {
    if (!user.id || user.role === newRole) return;
    this.pendingAction = { type: 'role', user, newRole };
  }

  // Execute role change (after confirmation)
  private executeChangeRole(user: User, newRole: 'admin'|'employee'|'client') {
    if (!user.id || user.role === newRole) return;
    this.loadingRoleIds.add(user.id);
    const prevRole = user.role;
    this.usersService.updateUserRole(user.id, newRole).subscribe({
      next: (updated) => {
        user.role = updated.role;
        this.toastr.success(`Rôle mis à jour: ${updated.role}`);
        this.applyFilters();
        if (user.id) this.loadingRoleIds.delete(user.id);
      },
      error: () => {
        user.role = prevRole;
        if (user.id) this.loadingRoleIds.delete(user.id);
        this.toastr.error('Impossible de changer le rôle');
      }
    });
  }

  // Prompt before delete
  promptDelete(user: User) {
    if (!user.id) return;
    this.pendingAction = { type: 'delete', user };
  }

  // Execute deletion (after confirmation)
  private executeDeleteUser(user: User) {
    if (!user.id) return;
    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilters();
        this.toastr.success('Utilisateur supprimé');
      },
      error: () => this.toastr.error("Suppression impossible")
    });
  }

  isRoleUpdating(user: User): boolean {
    return !!user.id && this.loadingRoleIds.has(user.id);
  }

  // Modal controls
  confirmPending() {
    if (!this.pendingAction) return;
    const a = this.pendingAction;
    this.pendingAction = null;
    if (a.type === 'role' && a.newRole) {
      this.executeChangeRole(a.user, a.newRole);
    } else if (a.type === 'delete') {
      this.executeDeleteUser(a.user);
    }
  }

  cancelPending() {
    this.pendingAction = null;
  }

  getRoleLabel(role: 'admin'|'employee'|'client'): string {
    const r = this.roles.find(x => x.key === role);
    return r ? r.label : role;
  }
}
