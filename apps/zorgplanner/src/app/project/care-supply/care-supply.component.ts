import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import {
  CareSupplyEntry,
  CareSupplyList,
  RemoveCareSupplyList,
} from '../../shared/interfaces/care-supply';
import { EditCareSupplyComponent } from './edit-care-supply/edit-care-supply.component';
import { CareSupplyService } from './services/care-supply.service';

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
  @Input() careSupplyLists: CareSupplyList[] = [];
  @Input() editMode = false;

  private careSupplyService = inject(CareSupplyService);

  selectedList: CareSupplyList | undefined;

  title = '';
  careSupplyEntries: CareSupplyEntry[] = [];
  newTeamName = '';
  areaZipcodes = '';
  color = '';
  availableFTES = 0;

  //Blue, BlueViolet, DarkGreen, Gold, LawnGreen, Orange, Sienna
  //#0000FF, #8A2BE2, #006400, #FFD700, #7CFC00, #FFA500, #A0522D

  colorList = [
    'hsl(345,80%,50%)',
    'hsl(128,50%,47%)',
    'hsl(52,100%,55%)',
    'hsl(227,66%,56%)',
    'hsl(25,91%,58%)',
    'hsl(286,71%,41%)',
    'hsl(191,89%,61%)',
    'hsl(303,86%,57%)',
    'hsl(77,84%,60%)',
    'hsl(338,86%,86%)',
    'hsl(173,37%,44%)',
    'hsl(268,100%,87%)',
    'hsl(32,62%,37%)',
    'hsl(55,100%,89%)',
    'hsl(0,100%,25%)',
    'hsl(138,100%,83%)',
    'hsl(60,100%,25%)',
    'hsl(30,100%,85%)',
    'hsl(240,100%,23%)',
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
    const color = this.color || this.colorList[this.careSupplyEntries.length];
    //color = color.replace('hsl(', 'hsla(').replace(')', ',ALPHA)');
    this.careSupplyEntries.push({
      name: this.newTeamName,
      areaZipcodes: this.areaZipcodes.split(','),
      color: color,
      amount: this.availableFTES,
    });
    this.newTeamName = this.areaZipcodes = this.color = '';
  }

  submitList() {
    this.careSupplyService.addCareSupplyList({
      title: this.title,
      careSupply: this.careSupplyEntries,
    });
    this.title = '';
    this.careSupplyEntries = [];
  }

  removeList(listId: RemoveCareSupplyList) {
    this.careSupplyService.removeCareSupplyList(listId);
    this.selectedList = undefined;
  }

  convertColor(color: string) {
    return color.replace('hsla(', 'hsl(').replace(',ALPHA)', ')');
  }
}
