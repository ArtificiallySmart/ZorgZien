import { Injectable, signal } from '@angular/core';

export interface AlertState {
  message: string;
  type: string;
  dismissed?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  public state = signal<AlertState>({
    message: '',
    type: '',
    dismissed: false,
  });

  constructor() {}
}
