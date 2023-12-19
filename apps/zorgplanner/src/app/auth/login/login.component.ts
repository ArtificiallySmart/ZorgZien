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

@Component({
  selector: 'zorgplanner-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  hasAccount = true;

  loginForm = new FormGroup({
    email: new FormControl('test@example.com', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('test', Validators.required),
  });

  onSubmit(loginForm: FormGroup) {
    if (!loginForm.valid) {
      return;
    }
    this.authService
      .login(loginForm)
      .pipe(tap(() => this.router.navigate(['/home'])))
      .subscribe();
  }
}