import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'zorgplanner-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  hasAccount = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

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
}
