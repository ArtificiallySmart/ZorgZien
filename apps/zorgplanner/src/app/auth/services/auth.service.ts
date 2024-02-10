import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, catchError, map, tap } from 'rxjs';
import { User } from '../../shared/interfaces/user';
import { HttpService } from '../../shared/services/http.service';

interface AuthenticatedState {
  isAuthenticated: true;
  user: User;
  tokenExpiration: number;
}
interface UnauthenticatedState {
  isAuthenticated: false;
  user: null;
  tokenExpiration: null;
}

type AuthState = AuthenticatedState | UnauthenticatedState;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpService = inject(HttpService);
  private router = inject(Router);

  public authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    tokenExpiration: null,
  });

  constructor() {
    this.checkForAccessToken();
  }

  public user = computed(() => this.authState().user);
  public isAuthenticated = computed(() => this.authState().isAuthenticated);

  checkForAccessToken() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.refreshToken().subscribe();
      return;
    }
    const { exp, user } = jwtDecode<{ exp: number; user: User }>(token);
    if (Date.now() >= exp * 1000) {
      this.refreshToken().subscribe();
      return;
    }
    this.authState.update(() => ({
      isAuthenticated: true,
      user,
      tokenExpiration: exp * 1000,
    }));
  }

  refreshToken(): Observable<string> {
    return this.httpService
      .post<{ access_token: string; user: User }, object>(
        '/api/auth/refresh',
        {}
      )
      .pipe(
        tap((res) => {
          this.setAccessToken(res.access_token);
          const { exp } = jwtDecode<{ exp: number }>(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
            tokenExpiration: exp * 1000,
          }));
        }),
        map((res) => res.access_token),
        catchError(() => {
          this.authState.update(() => ({
            isAuthenticated: false,
            user: null,
            tokenExpiration: null,
          }));
          return '';
          // throw new Error('No refresh token provided');
        })
      );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.authState.update(() => ({
      isAuthenticated: false,
      user: null,
      tokenExpiration: null,
    }));
    this.router.navigate(['/login']);
    this.httpService.post('/api/auth/logout', {}).subscribe();
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }
}
