import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CareSupplyEntry,
  CareSupplyList,
  EditCareSupplyList,
} from '../../../shared/interfaces/care-supply';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { zipcodeValidator } from '../../../shared/validators/zipcode.directive';
import { areaZipcodeValidator } from '../../../shared/validators/area-zip-code.directive';
import { CareSupplyService } from '../../services/care-supply.service';

@Component({
  selector: 'zorgplanner-edit-care-supply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbCollapseModule],
  templateUrl: './edit-care-supply.component.html',
  styleUrl: './edit-care-supply.component.scss',
})
export class EditCareSupplyComponent implements OnInit {
  @Input() careSupplyList!: CareSupplyList;
  careSupplyService = inject(CareSupplyService);
  careSupplyListForm!: FormGroup;
  isCollapsed: boolean[] = [];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.careSupplyListForm = this.createCareSupplyListForm(
      this.careSupplyList
    );
    this.isCollapsed = this.careSupplyList.careSupply.map(() => true);
  }

  createCareSupplyListForm(supplyList: CareSupplyList): FormGroup {
    const FormGroup = this.fb.group({
      title: [supplyList.title, Validators.required],
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
      name: [supplyEntry.name, Validators.required],
      amount: [supplyEntry.amount],
      color: [supplyEntry.color],
      areaPostalCodes: this.fb.array([], [areaZipcodeValidator()]),
    });
    if (supplyEntry.areaPostalCodes) {
      supplyEntry.areaPostalCodes.forEach((postalCode) => {
        (entry.get('areaPostalCodes') as FormArray).push(
          this.fb.control(postalCode, [Validators.required, zipcodeValidator()])
        );
      });
    }
    return entry;
  }

  deleteCareSupplyEntry(index: number) {
    const careSupplyArray = this.careSupplyListForm.get(
      'careSupply'
    ) as FormArray;
    careSupplyArray.removeAt(index);
  }

  onSubmit() {
    if (this.careSupplyListForm.invalid) {
      console.log(this.careSupplyListForm.errors);
      return;
    }
    const projectId = this.careSupplyList.projectId;
    const careSupplyListId = this.careSupplyList.id;
    const careSupplyList = this.careSupplyListForm.getRawValue();
    const editCareSupplyList: EditCareSupplyList = {
      id: careSupplyListId,
      data: {
        ...careSupplyList,
        projectId: projectId,
      },
    };
    this.careSupplyService.editCareSupplyList(editCareSupplyList);
  }

  addPostalCode(value: string, index: number) {
    const postalCode = new FormControl(value, [
      Validators.required,
      zipcodeValidator(),
    ]);
    const careSupplyArray = this.careSupplyListForm.get(
      'careSupply'
    ) as FormArray;
    const careSupplyEntry = careSupplyArray.at(index) as FormGroup;
    const postalCodes = careSupplyEntry.get('areaPostalCodes') as FormArray;
    postalCodes.push(postalCode);
  }

  deletePostalCode(index: number, postalCodeIndex: number) {
    const careSupplyArray = this.careSupplyListForm.get(
      'careSupply'
    ) as FormArray;
    const careSupplyEntry = careSupplyArray.at(index) as FormGroup;
    const postalCodes = careSupplyEntry.get('areaPostalCodes') as FormArray;
    postalCodes.removeAt(postalCodeIndex);
  }
}
