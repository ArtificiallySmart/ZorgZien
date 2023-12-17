import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpService } from '../../shared/services/http.service';

@Component({
  selector: 'zorgplanner-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private httpService = inject(HttpService);
  hasAccount = true;

  loginForm = new FormGroup({
    email: new FormControl('test@example.com', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('test2', Validators.required),
  });

  onSubmit(loginForm: FormGroup) {
    console.log(loginForm.valid);
    if (!loginForm.valid) {
      return;
    }
    console.log(loginForm.value);
    this.httpService.post('api/users/login', loginForm.value).subscribe();
  }
}
