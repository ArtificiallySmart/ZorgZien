import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AddCareDemandList,
  CareDemandList,
} from '../../shared/interfaces/care-demand';
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
  @Output() newCareDemandList = new EventEmitter<
    Omit<AddCareDemandList, 'projectId'>
  >();
  @Input() careDemandLists: CareDemandList[] = [];

  selectedList: CareDemandList | undefined;
  zorgUren = '';
  title = '';

  addHours() {
    const data = this.parserService.parse(this.zorgUren);
    this.newCareDemandList.emit({
      title: this.title,
      careDemand: data,
    });
    this.title = this.zorgUren = '';
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careDemandLists.find((list) => list.id === target.value);
    this.selectedList = list;
    console.log(list?.careDemand[Symbol.iterator]());
  }
}
