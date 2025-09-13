import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

/**
 * RoleGuard
 * Usage in routes:
 * { path: 'commandes', component: ListeCommandesComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUserValue;
  if (!user) {
    router.navigate(['/auth/Connexion']);
    return false;
  }

  const expectedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (expectedRoles.length === 0) {
    // No role restriction declared
    return true;
  }

  if (expectedRoles.includes(user.role)) {
    return true;
  }

  // Unauthorized for this role
  router.navigate(['/']);
  return false;
};
