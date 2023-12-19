import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const isAuthenticated = inject(AuthService).authState().isAuthenticated;

  if (!isAuthenticated) {
    inject(AuthService)
      .refreshToken()
      .subscribe(() => ({
        next: () => {
          inject(AuthService).authenticate$.next(true);
          return true;
        },
        error: () => {
          inject(Router).navigate(['/login']);
          return false;
        },
      }));
  }
  return true;
};
