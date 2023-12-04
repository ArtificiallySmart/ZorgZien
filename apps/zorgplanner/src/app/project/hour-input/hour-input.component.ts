import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCareNeedList } from '../../shared/interfaces/care-need';
import { ParserService } from '../services/parser.service';

@Component({
  selector: 'zorgplanner-hour-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hour-input.component.html',
  styleUrl: './hour-input.component.css',
})
export class HourInputComponent {
  private parserService = inject(ParserService);
  @Output() newCareNeedList = new EventEmitter<AddCareNeedList>();
  zorgUren = '';
  titel = '';
  addHours() {
    const data = this.parserService.parse(this.zorgUren);
    console.log(data);
    this.newCareNeedList.emit({ title: this.titel, careNeed: data });
  }
}
