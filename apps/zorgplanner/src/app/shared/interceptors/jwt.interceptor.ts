import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('access_token');

  if (!token) return next(req);

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        // Handle 401 errors
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(newReq);
          })
        );
      }

      throw err;
    })
  );
};

// // token.interceptor.ts
// intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//   // Attach access token to request headers
//   const authorizedReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + this.authService.getAccessToken()) });

//   return next.handle(authorizedReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         // Access token is expired, try refreshing
//         return this.authService.refreshToken().pipe(
//           switchMap((newToken: string) => {
//             // Set the new token in authService for in-memory storage
//             this.authService.setAccessToken(newToken);

//             // Use the new token for the retry
//             const retriedReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + newToken) });
//             return next.handle(retriedReq);
//           })
//         );
//       }
//       return throwError(error);
//     })
//   );
// }
