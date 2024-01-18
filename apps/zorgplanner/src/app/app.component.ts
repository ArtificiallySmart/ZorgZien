import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './shared/services/toast.service';
import { ToastComponent } from './toast.component';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    HeaderComponent,
    NgbToastModule,
    ToastComponent,
  ],
  selector: 'zorgplanner-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  toastService = inject(ToastService);
}
