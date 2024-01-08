import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'https://zorgplanner-production.up.railway.app';

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T, S>(endpoint: string, body: S) {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  patch<T, S>(endpoint: string, body: S) {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }
}
