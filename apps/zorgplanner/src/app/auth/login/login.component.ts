import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { passwordValidator } from '../../shared/validators/password.directive';
import { TablerIconsModule } from 'angular-tabler-icons';
import { confirmPasswordValidator } from '../../shared/validators/confirm-password.directive';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'zorgplanner-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TablerIconsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  hasAccount = true;
  passwordFieldFocused = false;
  passwordConfirmFieldFocused = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  registerForm = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, passwordValidator()]),
      passwordConfirm: new FormControl('', [Validators.required]),
    },
    { validators: confirmPasswordValidator() }
  );

  get passwordFormField() {
    return this.registerForm.get('password');
  }
  get passwordConfirmFormField() {
    return this.registerForm.get('passwordConfirm');
  }
  onPasswordFocus() {
    this.passwordFieldFocused = true;
  }
  onPasswordConfirmFocus() {
    this.passwordConfirmFieldFocused = true;
  }

  onSubmit(loginForm: FormGroup) {
    if (!loginForm.valid) {
      return;
    }
    this.authService.login(loginForm).subscribe({
      error: () => {
        return this.loginForm.reset();
      },
      next: () => {
        this.router.navigate(['/project']);
      },
    });
  }

  onSubmitRegister(registerForm: FormGroup) {
    if (!registerForm.valid) {
      return;
    }
    this.authService.register(registerForm).subscribe({
      error: () => {
        this.passwordFieldFocused = this.passwordConfirmFieldFocused = false;
        return this.registerForm.reset();
      },
      next: () => {
        this.hasAccount = true;
      },
    });
  }
}
