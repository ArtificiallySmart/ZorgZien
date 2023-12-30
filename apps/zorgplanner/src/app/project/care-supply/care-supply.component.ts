import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import {
  AddCareSupplyList,
  CareSupplyEntry,
  CareSupplyList,
  RemoveCareSupplyList,
} from '../../shared/interfaces/care-supply';
import { EditCareSupplyComponent } from './edit-care-supply/edit-care-supply.component';

@Component({
  selector: 'zorgplanner-care-supply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ColorPickerModule,
    EditCareSupplyComponent,
  ],
  templateUrl: './care-supply.component.html',
  styleUrl: './care-supply.component.scss',
})
export class CareSupplyComponent {
  @Output() newCareSupplyList = new EventEmitter<
    Omit<AddCareSupplyList, 'projectId'>
  >();
  @Output() removeCareSupplyList = new EventEmitter<RemoveCareSupplyList>();
  @Input() careSupplyLists: CareSupplyList[] = [];

  selectedList: CareSupplyList | undefined;

  title = '';
  careSupplyEntries: CareSupplyEntry[] = [];
  newTeamName = '';
  areaZipcodes = '';
  color = '';

  //Blue, BlueViolet, DarkGreen, Gold, LawnGreen, Orange, Sienna
  //#0000FF, #8A2BE2, #006400, #FFD700, #7CFC00, #FFA500, #A0522D

  colorList = [
    'hsl(240, 100%, 50%)',
    'hsl(271, 76%, 53%)',
    'hsl(120, 100%, 20%)',
    'hsl(51, 100%, 50%)',
    'hsl(90, 100%, 49%)',
    'hsl(39, 100%, 50%)',
    'hsl(19, 56%, 40%)',
  ];

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careSupplyLists.find((list) => list.id == target.value);
    this.selectedList = list;
  }

  changeColor(color: string) {
    this.color = color;
  }

  submitEntry() {
    let color = this.color || this.colorList[this.careSupplyEntries.length];
    color = color.replace('hsl(', 'hsla(').replace(')', ',ALPHA)');
    this.careSupplyEntries.push({
      name: this.newTeamName,
      areaZipcodes: this.areaZipcodes.split(','),
      color: color,
    });
    this.newTeamName = this.areaZipcodes = this.color = '';
  }

  submitList() {
    this.newCareSupplyList.emit({
      title: this.title,
      careSupply: this.careSupplyEntries,
    });
    this.title = '';
    this.careSupplyEntries = [];
  }

  removeList(listId: RemoveCareSupplyList) {
    this.removeCareSupplyList.emit(listId);
    this.selectedList = undefined;
  }

  convertColor(color: string) {
    return color.replace('hsla(', 'hsl(').replace(',ALPHA)', ')');
  }
}
