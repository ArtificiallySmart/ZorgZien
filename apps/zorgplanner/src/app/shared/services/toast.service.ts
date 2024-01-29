import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface Toast {
  id: string;
  header?: string;
  content: string;
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show$ = new Subject<Toast>();
  remove$ = new Subject<string>();
  clear$ = new Subject<void>();

  constructor() {
    this.show$.subscribe({
      next: (toast) => this.toasts.update((toasts) => [...toasts, toast]),
    });

    this.remove$.subscribe({
      next: (id) =>
        this.toasts.update((toasts) => toasts.filter((t) => t.id !== id)),
    });

    this.clear$.subscribe({
      next: () => this.toasts.update(() => []),
    });
  }

  show(
    content: string,
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info',
    header?: string,
    delay?: number
  ) {
    this.show$.next({
      id: uuidv4(),
      content,
      type,
      header,
      delay,
    });
  }
}
