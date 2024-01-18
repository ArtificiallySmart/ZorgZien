import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CareDemandList } from '../../shared/interfaces/care-demand';
import { ParserService } from '../../shared/services/parser.service';
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
  @Output() demandAdded = new EventEmitter();
  private parserService = inject(ParserService);
  private careDemandService = inject(CareDemandService);
  private modalService = inject(NgbModal);

  @Input() careDemandLists: CareDemandList[] = [];
  @Input() editMode = false;

  selectedList: CareDemandList | undefined;
  isCollapsed = true;
  zorgUren = '';
  title = '';

  addList() {
    const demandValues = this.parserService.parse(this.zorgUren);
    this.careDemandService.addCareDemandList({
      title: this.title,
      careDemand: demandValues,
    });
    this.title = this.zorgUren = '';
    this.demandAdded.emit();
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    const list = this.careDemandLists.find((list) => list.id == target.value);
    this.selectedList = list;
  }

  clearSelectedCareDemandList() {
    this.selectedList = undefined;
  }

  open(content: TemplateRef<string>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }
}
