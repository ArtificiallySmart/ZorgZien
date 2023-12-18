import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { Router } from '@angular/router';

interface LoginResponse {
  access_token: string;
  // Include other properties if there are any
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpService = inject(HttpService);
  private jwtHelper = inject(JwtHelperService);
  private router = inject(Router);
  constructor() {}

  login(loginForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('api/users/login', loginForm.value)
      .pipe(
        map((res) => {
          this.setAccessToken(res.access_token);
          return res;
        })
      );
  }

  // isAuthenticated(): boolean {
  //   const token = localStorage.getItem('access_token');
  //   return !this.jwtHelper.isTokenExpired(token);
  // }
  isAuthenticated(): boolean {
    let isAuthenticated = false;
    const token = localStorage.getItem('access_token');
    if (!this.jwtHelper.isTokenExpired(token)) return true;
    this.refreshToken().subscribe((res) => {
      console.log('refreshToken response', res);
      this.setAccessToken(res);
      isAuthenticated = true;
    });

    return isAuthenticated;
  }

  refreshToken(): Observable<string> {
    return this.httpService
      .post<{ access_token: string }, object>('api/users/refresh', {})
      .pipe(
        tap((response) => {
          console.log('refreshToken response', response);
          this.setAccessToken(response.access_token);
        }),
        map((response) => response.access_token)
      );
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }

  canActivate(): Observable<boolean> {
    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
