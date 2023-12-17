import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';

interface LoginResponse {
  access_token: string;
  // Include other properties if there are any
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpService = inject(HttpService);
  private jwtHelper = inject(JwtHelperService);
  constructor() {}

  login(loginForm: FormGroup) {
    return this.httpService
      .post<LoginResponse, object>('api/users/login', loginForm.value)
      .pipe(
        map((res) => {
          localStorage.setItem('access_token', res.access_token);
          return res;
        })
      );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    console.log(this.jwtHelper.getTokenExpirationDate(token!));
    return !this.jwtHelper.isTokenExpired(token);
  }
}
