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
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { passwordValidator } from '../../shared/validators/password.directive';

@Component({
  selector: 'zorgplanner-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  hasAccount = true;
  passwordFieldFocused = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, passwordValidator()]),
  });
  get passwordFormField() {
    return this.registerForm.get('password');
  }
  onPasswordFocus() {
    this.passwordFieldFocused = true;
  }

  onSubmit(loginForm: FormGroup) {
    if (!loginForm.valid) {
      return;
    }
    this.authService
      .login(loginForm)
      .pipe(tap(() => this.router.navigate(['/project'])))
      .subscribe();
  }

  onSubmitRegister(registerForm: FormGroup) {
    if (!registerForm.valid) {
      return;
    }
    this.authService
      .register(registerForm)
      .pipe(tap(() => this.router.navigate(['/home'])))
      .subscribe();
  }
}
