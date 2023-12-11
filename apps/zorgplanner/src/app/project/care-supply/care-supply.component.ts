import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AddCareSupplyList,
  CareSupplyEntry,
  CareSupplyList,
  RemoveCareSupplyList,
} from '../../shared/interfaces/care-supply';

@Component({
  selector: 'zorgplanner-care-supply',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  areaPostalCodes = '';

  submitEntry() {
    this.careSupplyEntries.push({
      name: this.newTeamName,
      areaPostalCodes: this.areaPostalCodes.split(','),
    });
    this.newTeamName = this.areaPostalCodes = '';
  }

  submitList() {
    this.newCareSupplyList.emit({
      title: this.title,
      careSupply: this.careSupplyEntries,
    });
    this.title = '';
    this.careSupplyEntries = [];
  }
}
