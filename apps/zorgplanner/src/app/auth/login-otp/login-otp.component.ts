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
import { OtpService } from '../services/otp.service';

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
  private otpService = inject(OtpService);
  private authService = inject(AuthService);
  private router = inject(Router);
  loadPage = false;
  // redirectToOtp = this.otpService.redirectToOtp;
  redirectToOtp = true;
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
    this.otpService.loginOtp(loginForm).subscribe({
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

    this.otpService.loginOtpVerify(otpForm).subscribe({
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
