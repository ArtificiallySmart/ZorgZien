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
}
