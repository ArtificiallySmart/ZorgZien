import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AddCareNeedList,
  CareNeedList,
} from '../../shared/interfaces/care-need';
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
  @Output() newCareNeedList = new EventEmitter<
    Omit<AddCareNeedList, 'projectId'>
  >();
  @Input() careNeedLists: CareNeedList[] = [];

  selectedList: CareNeedList | undefined;
  zorgUren = '';
  title = '';

  addHours() {
    const data = this.parserService.parse(this.zorgUren);
    this.newCareNeedList.emit({
      title: this.title,
      careNeed: data,
    });
    this.title = this.zorgUren = '';
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careNeedLists.find((list) => list.id === target.value);
    this.selectedList = list;
    console.log(list?.careNeed[Symbol.iterator]());
  }
}
