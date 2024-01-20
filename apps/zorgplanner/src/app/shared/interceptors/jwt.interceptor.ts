import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, share, switchMap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (req.url.includes('/login')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 400) {
        router.navigate(['/login']);
        throw err;
      }
      if (err.status === 401) {
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(newReq);
          }),
          catchError((err) => {
            router.navigate(['/login']);
            throw err;
          }),
          share()
        );
      }

      throw err;
    })
  );
};
