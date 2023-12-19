import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const test = inject(AuthService)
    .refreshToken()
    .pipe(
      map(() => true),
      catchError(() => {
        inject(Router).navigate(['/login']);
        return of(false);
      })
    );
  return test;
};
