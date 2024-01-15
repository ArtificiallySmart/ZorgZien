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
import {
  NgbAccordionModule,
  NgbCollapseModule,
} from '@ng-bootstrap/ng-bootstrap';
import { zipcodeValidator } from '../../../shared/validators/zipcode.directive';
import { areaZipcodeValidator } from '../../../shared/validators/area-zip-code.directive';
import { CareSupplyService } from '../services/care-supply.service';
import { ColorPickerModule } from 'ngx-color-picker';

@Component({
  selector: 'zorgplanner-edit-care-supply',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbCollapseModule,
    NgbAccordionModule,
    ColorPickerModule,
  ],
  templateUrl: './edit-care-supply.component.html',
  styleUrl: './edit-care-supply.component.scss',
})
export class EditCareSupplyComponent implements OnInit {
  @Input() careSupplyList!: CareSupplyList;

  careSupplyService = inject(CareSupplyService);
  careSupplyListForm!: FormGroup;

  colorArray = [
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.careSupplyListForm = this.fb.group({
      id: [this.careSupplyList.id],
      title: [this.careSupplyList.title, Validators.required],
      careSupply: this.fb.array([]),
    });
    this.careSupplyList.careSupply.forEach((supplyEntry) =>
      this.createCareSupplyEntryForm(supplyEntry)
    );
    this.careSupplyListForm.disable();
  }

  get careSupply() {
    return this.careSupplyListForm.get('careSupply') as FormArray;
  }

  cancelEdit() {
    this.careSupplyListForm.reset();
    this.careSupplyListForm.disable();
  }

  supplyById(index: number, supply: CareSupplyEntry) {
    return supply.id;
  }

  zipCodeById(index: number) {
    return index;
  }

  getInnerFormControl(outerIndex: number, innerIndex: number): FormControl {
    return (
      (this.careSupplyListForm.get('careSupply') as FormArray)
        .at(outerIndex)
        .get('areaZipcodes') as FormArray
    ).at(innerIndex) as FormControl;
  }

  createCareSupplyEntryForm(supplyEntry: CareSupplyEntry) {
    const entry = this.fb.group({
      name: [supplyEntry.name, Validators.required],
      amount: [supplyEntry.amount],
      color: [supplyEntry.color],
      areaZipcodes: this.fb.array(
        [
          ...(supplyEntry.areaZipcodes ?? []).map(
            (x) => new FormControl(x, [zipcodeValidator()])
          ),
        ],
        [areaZipcodeValidator()]
      ),
    });
    this.careSupply.push(entry);
  }

  deleteCareSupplyEntry(index: number) {
    this.careSupply.removeAt(index);
  }
  color(index: number) {
    return this.careSupply.at(index).get('color')?.value;
  }

  changeColor(color: string, index: number) {
    const careSupplyEntry = this.careSupply.at(index) as FormGroup;
    careSupplyEntry.patchValue({ color: color });
  }

  onSubmit() {
    if (this.careSupplyListForm.invalid) {
      console.log(this.careSupplyListForm);
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

  addZipcode(el: HTMLInputElement, index: number) {
    const value = el.value;
    const zipcode = new FormControl(value, [
      Validators.required,
      zipcodeValidator(),
    ]);
    const careSupplyEntry = this.careSupply.at(index) as FormGroup;
    const zipcodes = careSupplyEntry.get('areaZipcodes') as FormArray;
    zipcodes.push(zipcode);
    el.value = '';
  }

  deleteZipcode(index: number, zipcodeIndex: number) {
    const careSupplyEntry = this.careSupply.at(index) as FormGroup;
    const zipcodes = careSupplyEntry.get('areaZipcodes') as FormArray;
    zipcodes.removeAt(zipcodeIndex);
  }
}
