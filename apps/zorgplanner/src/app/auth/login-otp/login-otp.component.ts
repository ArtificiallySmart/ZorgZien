import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'zorgplanner-login-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    RouterModule,
  ],
  templateUrl: './login-otp.component.html',
  styleUrl: './login-otp.component.scss',
})
export class LoginOtpComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  loadPage = false;
  redirectToOtp = this.authService.redirectToOtp;

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/project']);
      return;
    }
    this.loadPage = true;
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  otpForm = new FormGroup({
    otp: new FormControl('', Validators.required),
  });

  onEmailSubmit(loginForm: FormGroup) {
    if (!loginForm.valid) {
      return;
    }
    this.authService.loginOtp(loginForm).subscribe({
      error: () => {
        return this.loginForm.reset();
      },
      next: () => {
        this.loginForm.reset();
      },
    });
  }

  onOtpSubmit(otpForm: FormGroup) {
    if (!otpForm.valid) {
      return;
    }

    this.authService.loginOtpVerify(otpForm).subscribe({
      error: () => {
        return this.otpForm.reset();
      },
      next: () => {
        this.otpForm.reset();
        this.router.navigate(['/project']);
      },
    });
  }
}