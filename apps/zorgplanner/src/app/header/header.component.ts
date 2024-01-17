import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'zorgplanner-header',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  authService = inject(AuthService);

  @Input() headerTitle!: string;
  @Output() toggleSidebar = new EventEmitter<void>();
  notifications: number = 0;

  user = this.authService.user();

  logout() {
    this.authService.logout();
  }
}
