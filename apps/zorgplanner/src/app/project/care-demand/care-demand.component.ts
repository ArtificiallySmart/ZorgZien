import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AddCareDemandList,
  CareDemandList,
  RemoveCareDemandList,
} from '../../shared/interfaces/care-demand';
import { ParserService } from '../services/parser.service';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'zorgplanner-care-demand',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbCollapseModule],
  templateUrl: './care-demand.component.html',
  styleUrl: './care-demand.component.css',
})
export class CareDemandComponent {
  private parserService = inject(ParserService);
  @Output() newCareDemandList = new EventEmitter<
    Omit<AddCareDemandList, 'projectId'>
  >();
  @Output() removeCareDemandList = new EventEmitter<RemoveCareDemandList>();
  @Input() careDemandLists: CareDemandList[] = [];

  selectedList: CareDemandList | undefined;
  isCollapsed = true;
  zorgUren = '';
  title = '';

  addList() {
    const data = this.parserService.parse(this.zorgUren);
    this.newCareDemandList.emit({
      title: this.title,
      careDemand: data,
    });
    this.title = this.zorgUren = '';
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careDemandLists.find((list) => list.id == target.value);
    this.selectedList = list;
  }

  removeList(listId: RemoveCareDemandList) {
    this.removeCareDemandList.emit(listId);
    this.selectedList = undefined;
  }
}
