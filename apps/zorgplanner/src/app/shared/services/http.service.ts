import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string) {
    return this.http.get<T>(endpoint);
  }

  post<T, S>(endpoint: string, body: S) {
    return this.http.post<T>(endpoint, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(endpoint);
  }

  patch<T, S>(endpoint: string, body: S) {
    return this.http.patch<T>(endpoint, body);
  }
}
