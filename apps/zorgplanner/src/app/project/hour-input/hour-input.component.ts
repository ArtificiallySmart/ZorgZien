import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zorgplanner-hour-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hour-input.component.html',
  styleUrl: './hour-input.component.css',
})
export class HourInputComponent {
  addHours() {}
}
