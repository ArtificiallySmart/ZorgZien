import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CareSupplyEntry,
  CareSupplyList,
} from '../../../shared/interfaces/care-supply';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'zorgplanner-edit-care-supply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbCollapseModule],
  templateUrl: './edit-care-supply.component.html',
  styleUrl: './edit-care-supply.component.css',
})
export class EditCareSupplyComponent implements OnInit {
  @Input() careSupplyList!: CareSupplyList;
  careSupplyListForm!: FormGroup;
  isCollapsed: boolean[] = [];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.careSupplyListForm = this.createCareSupplyListForm(
      this.careSupplyList
    );
    this.isCollapsed = this.careSupplyList.careSupply.map(() => true);
    console.log(this.careSupplyListForm);
  }

  createCareSupplyListForm(supplyList: CareSupplyList): FormGroup {
    const FormGroup = this.fb.group({
      title: [supplyList.title],
      careSupply: this.fb.array([]),
    });

    supplyList.careSupply.forEach((supplyEntry) => {
      const supplyEntryForm = this.createCareSupplyEntryForm(supplyEntry);
      (FormGroup.get('careSupply') as FormArray).push(supplyEntryForm);
    });

    return FormGroup;
  }

  createCareSupplyEntryForm(supplyEntry: CareSupplyEntry): FormGroup {
    const entry = this.fb.group({
      name: [supplyEntry.name],
      amount: [supplyEntry.amount],
      color: [supplyEntry.color],
      areaPostalCodes: this.fb.array([]),
    });
    if (supplyEntry.areaPostalCodes) {
      supplyEntry.areaPostalCodes.forEach((postalCode) => {
        (entry.get('areaPostalCodes') as FormArray).push(
          this.fb.control(postalCode)
        );
      });
    }
    return entry;
  }

  onSubmit() {
    console.log(this.careSupplyListForm.value);
  }
}
