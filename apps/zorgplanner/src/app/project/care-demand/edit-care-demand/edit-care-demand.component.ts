import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
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
  styleUrl: './edit-care-demand.component.css',
})
export class EditCareDemandComponent implements OnInit {
  @Input() careDemandList!: CareDemandList;

  careDemandService = inject(CareDemandService);
  careDemandListForm!: FormGroup;
  rangeArr: number[] = [];

  rangeArr$ = new Subject<number[]>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const zipcodes = this.careDemandList.careDemand.map(
      (careDemand) => careDemand[0]
    );
    this.rangeArr$.next(this.makeRangeValues(zipcodes));
    this.initForm();
  }

  get careDemand() {
    return this.careDemandListForm.get('careDemand') as FormArray;
  }

  //groups the care demand by zipcode range
  get groupedCareDemand() {
    return this.rangeArr.map((range) => {
      const group = this.careDemand.controls.filter(
        (careDemand) =>
          careDemand.value.zipcode >= range &&
          careDemand.value.zipcode < range + 100
      );
      return group;
      // const group = this.careDemandList.careDemand.filter(
      //   (careDemand) => careDemand[0] >= range && careDemand[0] < range + 100
      // );
      // return group;
    });
  }

  deleteDemand(index: number) {
    this.careDemand.removeAt(index);
  }

  demandByIndex(index: number) {
    return index;
  }

  initForm(): void {
    this.careDemandListForm = this.fb.group({
      title: this.careDemandList.title,
      careDemand: this.fb.array(
        this.careDemandList.careDemand.map((careDemand) =>
          this.fb.group({
            zipcode: careDemand[0],
            amount: careDemand[1],
          })
        )
      ),
    });
  }

  makeRangeValues(array: number[]) {
    const low = Math.floor(Math.min(...array) / 100) * 100;
    const high = Math.ceil(Math.max(...array) / 100) * 100;
    return Array.from({ length: (high - low) / 100 }, (_, i) => low + i * 100);
  }

  onSubmit(): void {
    console.log(this.careDemandListForm.value);
  }
}
