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
import {
  CareDemandList,
  CareDemandEntry,
} from '../../../shared/interfaces/care-demand';
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
  }

  groupedCareDemand$ = this.careDemandList$.pipe(
    map((careDemandList) => {
      const range = this.makeRangeValues(
        careDemandList.careDemand.map((careDemand) => careDemand.zipcode)
      );
      return range.map((range) => {
        const group = careDemandList.careDemand.filter(
          (careDemand) =>
            careDemand.zipcode >= range && careDemand.zipcode < range + 100
        );
        return group.sort();
      });
    })
  );

  zipcodeRange$ = this.careDemandList$.pipe(
    map((careDemandList) => {
      return this.makeRangeValues(
        careDemandList.careDemand.map((careDemand) => careDemand.zipcode)
      );
    })
  );

  deleteDemand(zipcode: number) {
    const oldCareDemand = this.careDemandListBS.value;

    this.careDemandListBS.next({
      ...this.selectedCareDemandList,
      careDemand: [
        ...oldCareDemand.careDemand.filter(
          (careDemand) => careDemand.zipcode !== zipcode
        ),
      ],
    });
  }

  addDemand(zipcode: number, amountClient: number, amountHours: number) {
    const newEntry: CareDemandEntry = {
      zipcode,
      clients: amountClient,
      hours: amountHours,
      careDemandListId: this.selectedCareDemandList.id,
    };
    const oldCareDemand = this.careDemandListBS.value;
    this.careDemandListBS.next({
      ...oldCareDemand,
      careDemand: [...oldCareDemand.careDemand, newEntry],
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
  }
}
