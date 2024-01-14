import { Injectable, computed, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, map, of, tap } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { Router } from '@angular/router';
import { User } from '../../shared/interfaces/user';

interface LoginResponse {
  access_token: string;
  user: User;
  // Include other properties if there are any
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpService = inject(HttpService);
  private router = inject(Router);

  constructor() {
    this.authenticate$.subscribe((isAuthenticated) => {
      this.authState.update((state) => ({
        ...state,
        isAuthenticated,
      }));
    });
  }

  public authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  public user = computed(() => this.authState().user);

  authenticate$ = new Subject<boolean>();

  login(loginForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('api/users/login', loginForm.value)
      .pipe(
        map((res) => {
          this.setAccessToken(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
          }));
          return res;
        }),
        catchError((err) => {
          throw err;
        })
      );
  }

  register(registerForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('api/users/register', registerForm.value)
      .pipe(
        tap((res) => {
          this.setAccessToken(res.access_token);
          this.authenticate$.next(true);
        }),
        catchError((err) => {
          throw err;
        })
      );
  }

  refreshToken(): Observable<string> {
    return this.httpService
      .post<{ access_token: string; user: User }, object>(
        'api/users/refresh',
        {}
      )
      .pipe(
        tap((res) => {
          this.setAccessToken(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
          }));
        }),
        map((res) => res.access_token),
        catchError(() => {
          this.authState.update(() => ({
            isAuthenticated: false,
            user: null,
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
    }));
    this.router.navigate(['/login']);
    this.httpService.post('api/users/logout', {}).subscribe();
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
