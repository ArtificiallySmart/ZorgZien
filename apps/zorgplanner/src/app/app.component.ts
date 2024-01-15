import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './header/header.component';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  selector: 'zorgplanner-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
