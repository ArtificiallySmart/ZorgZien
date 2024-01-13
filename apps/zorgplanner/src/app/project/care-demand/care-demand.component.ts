import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { CareDemandList } from '../../shared/interfaces/care-demand';
import { ParserService } from '../services/parser.service';
import { EditCareDemandComponent } from './edit-care-demand/edit-care-demand.component';
import { CareDemandService } from './services/care-demand.service';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'zorgplanner-care-demand',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    EditCareDemandComponent,
    TablerIconsModule,
  ],
  templateUrl: './care-demand.component.html',
  styleUrl: './care-demand.component.scss',
})
export class CareDemandComponent {
  private parserService = inject(ParserService);
  private careDemandService = inject(CareDemandService);

  @Input() careDemandLists: CareDemandList[] = [];
  @Input() editMode = false;

  selectedList: CareDemandList | undefined;
  isCollapsed = true;
  zorgUren = '';
  title = '';

  addList() {
    const demandValues = this.parserService.parse(this.zorgUren);
    console.log(demandValues);
    this.careDemandService.addCareDemandList({
      title: this.title,
      careDemand: demandValues,
    });
    this.title = this.zorgUren = '';
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careDemandLists.find((list) => list.id == target.value);
    this.selectedList = list;
  }

  clearSelectedCareDemandList() {
    this.selectedList = undefined;
  }
}
