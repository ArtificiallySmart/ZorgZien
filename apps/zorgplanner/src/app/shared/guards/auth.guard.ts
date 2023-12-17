import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  if (!inject(AuthService).isAuthenticated()) {
    inject(Router).navigate(['/login']);
    return false;
  }
  return true;
};
