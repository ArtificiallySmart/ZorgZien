import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  header?: string;
  content: string;
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show$ = new Subject<Toast>();
  remove$ = new Subject<Toast>();
  clear$ = new Subject<void>();

  constructor() {
    this.show$.subscribe({
      next: (toast) => this.toasts.update((toasts) => [...toasts, toast]),
    });

    this.remove$.subscribe({
      next: (toast) =>
        this.toasts.update((toasts) => toasts.filter((t) => t !== toast)),
    });

    this.clear$.subscribe({
      next: () => this.toasts.update(() => []),
    });
  }

  success(content: string) {
    this.show$.next({
      content,
      type: 'success',
    });
  }

  error(content: string) {
    this.show$.next({
      content,
      type: 'danger',
    });
  }

  warning(content: string) {
    this.show$.next({
      content,
      type: 'warning',
    });
  }

  show(
    content: string,
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info',
    header?: string,
    delay?: number
  ) {
    this.show$.next({
      content,
      type,
      header,
      delay,
    });
  }
}
