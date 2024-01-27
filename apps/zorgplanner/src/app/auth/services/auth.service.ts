import { Injectable, computed, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { Router } from '@angular/router';
import { User } from '../../shared/interfaces/user';
import { ToastService } from '../../shared/services/toast.service';
import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  access_token: string;
  user: User;
}

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
  private toastService = inject(ToastService);

  constructor() {
    this.checkForToken();
  }

  public authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    tokenExpiration: null,
  });

  public user = computed(() => this.authState().user);
  public isAuthenticated = computed(() => this.authState().isAuthenticated);
  // authenticate$ = new Subject<boolean>();

  login(loginForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('/api/users/login', loginForm.value)
      .pipe(
        map((res) => {
          this.setAccessToken(res.access_token);
          const { exp } = jwtDecode<{ exp: number }>(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
            tokenExpiration: exp * 1000,
          }));
          return res;
        }),
        catchError((err) => {
          if (err.status === 401) {
            this.authState.update(() => ({
              isAuthenticated: false,
              user: null,
              tokenExpiration: null,
            }));
            this.toastService.error('onjuiste gegevens');
            throw err;
          }
          return of(null);
        })
      );
  }

  loginOtp(loginForm: FormGroup) {
    return this.httpService
      .post<{ message: string }, object>(
        '/api/users/login-otp',
        loginForm.value
      )
      .pipe(
        tap(() => {
          this.setOtpSent(loginForm.value.email);
          this.toastService.success(`Een email is verzonden met een OTP code`);
        }),
        catchError((err) => {
          if (err.status === 401) {
            this.toastService.error('onjuiste gegevens');
            throw err;
          }
          return of(null);
        })
      );
  }

  loginOtpVerify(otpForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('/api/users/login-otp-verify', otpForm.value)
      .pipe(
        map((res) => {
          this.setAccessToken(res.access_token);
          const { exp } = jwtDecode<{ exp: number }>(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
            tokenExpiration: exp * 1000,
          }));
          return res;
        }),
        catchError((err) => {
          if (err.status === 401) {
            this.authState.update(() => ({
              isAuthenticated: false,
              user: null,
              tokenExpiration: null,
            }));
            this.toastService.error('onjuiste gegevens');
            throw err;
          }
          return of(null);
        })
      );
  }

  register(registerForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('/api/users/register', registerForm.value)
      .pipe(
        tap(() => {
          this.toastService.success(
            `Gebruiker aangemaakt \n U kunt nu inloggen`
          );
        }),
        catchError((err) => {
          if (err.status === 403) {
            this.toastService.error('Gebruiker niet toegestaan');
            throw err;
          }
          return of(null);
        })
      );
  }

  checkForToken() {
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
        '/api/users/refresh',
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
    this.httpService.post('/api/users/logout', {}).subscribe();
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('access_token', accessToken);
  }

  setOtpSent(email: string) {
    const otpExpires = Date.now() + 1000 * 60 * 5;
    const otpSent = { email, otpExpires };
    localStorage.setItem('otp_sent', JSON.stringify(otpSent));
  }
}
