import { Injectable, computed, effect, inject, signal } from '@angular/core';
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

interface OTPState {
  email: string;
  otpExpires: number;
  attempts: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpService = inject(HttpService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  public authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    tokenExpiration: null,
  });

  public otpState = signal<OTPState>({
    email: '',
    otpExpires: 0,
    attempts: 0,
  });

  public redirectToOtp = computed(() => {
    return (
      this.otpState().email !== '' &&
      this.otpState().otpExpires > Date.now() &&
      this.otpState().attempts < 5
    );
  });

  constructor() {
    this.checkForToken();
    this.getOtpStateFromLocalStorage();

    effect(() => {
      if (this.otpState()) {
        localStorage.setItem('otp_sent', JSON.stringify(this.otpState()));
      }
    });
  }

  public user = computed(() => this.authState().user);
  public isAuthenticated = computed(() => this.authState().isAuthenticated);

  loginOtp(loginForm: FormGroup) {
    return this.httpService
      .post<{ message: string }, object>(
        '/api/users/login-otp',
        loginForm.value
      )
      .pipe(
        tap(() => {
          this.otpSent(loginForm.value.email);
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
    const { email } = this.otpState();
    const { otp } = otpForm.value;
    return this.httpService
      .post<LoginResponse, object>('/api/users/login-otp-verify', {
        otp,
        email,
      })
      .pipe(
        map((res) => {
          this.setAccessToken(res.access_token);
          const { exp } = jwtDecode<{ exp: number }>(res.access_token);
          this.authState.update(() => ({
            isAuthenticated: true,
            user: res.user,
            tokenExpiration: exp * 1000,
          }));
          this.otpReset();
          return res;
        }),
        catchError((err) => {
          if (err.status === 401) {
            this.otpAddAttempt();
            if (this.otpState().attempts >= 5) {
              this.otpReset();
              this.toastService.error(
                'Te veel pogingen. \n Vraag een nieuwe inlogcode aan'
              );
              throw err;
            }
            this.toastService.error(err.error.message);
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
            `Gebruiker aangemaakt. \n U kunt nu inloggen`
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

  getOtpStateFromLocalStorage() {
    const otpData = localStorage.getItem('otp_sent');
    if (otpData) {
      const { email, otpExpires, attempts } = JSON.parse(otpData);
      if (Date.now() > otpExpires) {
        this.otpReset();
        return;
      }

      this.otpState.update(() => ({
        email,
        otpExpires,
        attempts,
      }));
    }
  }

  otpSent(email: string) {
    this.otpState.update(() => ({
      email,
      otpExpires: Date.now() + 1000 * 60 * 15,
      attempts: 0,
    }));
  }

  otpReset() {
    this.otpState.update(() => ({
      email: '',
      otpExpires: 0,
      attempts: 0,
    }));
  }

  otpAddAttempt() {
    this.otpState.update((state) => ({
      ...state,
      attempts: state.attempts + 1,
    }));
  }
}
