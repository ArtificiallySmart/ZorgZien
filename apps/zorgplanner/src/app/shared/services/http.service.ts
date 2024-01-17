import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.apiBaseUrl;

  private config = {
    withCredentials: true,
  };

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, this.config);
  }

  post<T, S>(endpoint: string, body: S) {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, this.config);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, this.config);
  }

  patch<T, S>(endpoint: string, body: S) {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, this.config);
  }
}
