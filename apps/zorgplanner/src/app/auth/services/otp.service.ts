import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { tap, catchError, of, map } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../shared/interfaces/user';
import { AuthService } from './auth.service';

interface OTPState {
  email: string;
  otpExpires: number;
  attempts: number;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private httpService = inject(HttpService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  constructor() {
    this.getOtpStateFromLocalStorage();

    effect(() => {
      if (this.otpState()) {
        localStorage.setItem('otp_sent', JSON.stringify(this.otpState()));
      }
    });
  }

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

  loginOtp(loginForm: FormGroup) {
    return this.httpService
      .post<{ message: string }, object>('/api/auth/login-otp', loginForm.value)
      .pipe(
        tap(() => {
          this.otpSent(loginForm.value.email);
          this.toastService.show(
            `Een email is verzonden met een OTP code`,
            'success'
          );
        }),
        catchError((err) => {
          if (err.status === 401) {
            this.toastService.show('onjuiste gegevens', 'danger');
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
      .post<LoginResponse, object>('/api/auth/login-otp-verify', {
        otp,
        email,
      })
      .pipe(
        map((res) => {
          this.authService.setAccessToken(res.access_token);
          const { exp } = jwtDecode<{ exp: number }>(res.access_token);
          this.authService.authState.update(() => ({
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
              this.toastService.show(
                'Te veel pogingen. \n Vraag een nieuwe inlogcode aan',
                'danger'
              );
              throw err;
            }
            this.toastService.show(err.error.message, 'danger');
            throw err;
          }
          return of(null);
        })
      );
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
