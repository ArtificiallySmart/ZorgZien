import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { confirmPasswordValidator } from '../../shared/validators/confirm-password.directive';
import { passwordValidator } from '../../shared/validators/password.directive';
import { TablerIconsModule } from 'angular-tabler-icons';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'zorgplanner-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablerIconsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  passwordFieldFocused = false;
  passwordConfirmFieldFocused = false;
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
        this.router.navigate(['/login']);
      },
    });
  }
}
