import { Component, Input, inject } from '@angular/core';
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
  notifications: number = 0;

  user = {
    name: 'John Doe',
  };

  logout() {
    this.authService.logout();
  }
}
