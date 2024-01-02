import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, map } from 'rxjs';
import { CareDemandList } from '../../../shared/interfaces/care-demand';
import { ZipcodeRangePipe } from '../../../shared/pipes/zipcode-range.pipe';
import { CareDemandService } from '../services/care-demand.service';

@Component({
  selector: 'zorgplanner-edit-care-demand',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    ZipcodeRangePipe,
  ],
  templateUrl: './edit-care-demand.component.html',
  styleUrl: './edit-care-demand.component.scss',
})
export class EditCareDemandComponent implements OnInit, OnChanges {
  @Input() selectedCareDemandList!: CareDemandList;
  @Output() clearSelectedCareDemandList = new EventEmitter();

  private careDemandListBS: BehaviorSubject<CareDemandList> =
    new BehaviorSubject({} as CareDemandList);
  careDemandList$ = this.careDemandListBS.asObservable();

  careDemandService = inject(CareDemandService);

  editingEnabled = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.careDemandListBS.next(this.selectedCareDemandList);
  }

  ngOnChanges(): void {
    this.careDemandListBS.next(this.selectedCareDemandList);
  }

  resetValues(event: Event) {
    (event.target as HTMLElement).focus();
    this.careDemandListBS.next(this.selectedCareDemandList);
    this.toggleEditing();
  }

  toggleEditing() {
    this.editingEnabled = !this.editingEnabled;
  }

  groupedCareDemand$ = this.careDemandList$.pipe(
    map((careDemandList) => {
      const range = this.makeRangeValues(
        careDemandList.careDemand.map((careDemand) => careDemand[0])
      );
      return range.map((range) => {
        const group = careDemandList.careDemand.filter(
          (careDemand) => careDemand[0] >= range && careDemand[0] < range + 100
        );
        return group.sort();
      });
    })
  );

  zipcodeRange$ = this.careDemandList$.pipe(
    map((careDemandList) => {
      return this.makeRangeValues(
        careDemandList.careDemand.map((careDemand) => careDemand[0])
      );
    })
  );

  deleteDemand(zipcode: number) {
    if (!this.editingEnabled) return;
    const oldCareDemand = this.careDemandListBS.value;

    this.careDemandListBS.next({
      ...this.selectedCareDemandList,
      careDemand: [
        ...oldCareDemand.careDemand.filter(
          (careDemand) => careDemand[0] !== zipcode
        ),
      ],
    });
  }

  addDemand(zipcode: number, amount: number) {
    if (!this.editingEnabled) return;
    this.careDemandListBS.next({
      ...this.selectedCareDemandList,
      careDemand: [
        ...this.selectedCareDemandList.careDemand,
        [zipcode, amount],
      ],
    });
  }

  demandByIndex(index: number) {
    return index;
  }

  makeRangeValues(array: number[]) {
    const low = Math.floor(Math.min(...array) / 100) * 100;
    const high = Math.ceil(Math.max(...array) / 100) * 100;
    return Array.from({ length: (high - low) / 100 }, (_, i) => low + i * 100);
  }

  removeCareDemandList() {
    const id = this.careDemandListBS.value.id;
    this.careDemandService.removeCareDemandList(id);
    this.clearSelectedCareDemandList.emit();
  }

  onSubmit(): void {
    const id = this.careDemandListBS.value.id;
    const data = this.careDemandListBS.value;
    this.careDemandService.updateCareDemandList({ id, data });

    this.toggleEditing();
  }
}
