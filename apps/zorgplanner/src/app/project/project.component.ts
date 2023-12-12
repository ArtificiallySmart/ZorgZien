import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AddCareDemandList } from '../shared/interfaces/care-demand';
import { HourInputComponent } from './hour-input/hour-input.component';
import { CareDemandService } from './services/care-demand.service';
import { ChoroplethService } from './services/choropleth.service';
import { ParserService } from './services/parser.service';
import { ProjectService } from './services/project.service';
import { CareSupplyComponent } from './care-supply/care-supply.component';
import { CareSupplyService } from './services/care-supply.service';
import { AddCareSupplyList } from '../shared/interfaces/care-supply';

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    HourInputComponent,
    CareSupplyComponent,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnDestroy {
  choroplethService = inject(ChoroplethService);
  parserService = inject(ParserService);
  careDemandService = inject(CareDemandService);
  projectService = inject(ProjectService);
  careSupplyService = inject(CareSupplyService);

  route = inject(ActivatedRoute);

  careDemand = this.careDemandService.careDemandLists;
  careSupply = this.careSupplyService.careSupplyLists;
  selectedSupplyList: string | undefined;

  active = 1;
  zorgUren = '';

  constructor() {
    this.choroplethService.init();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.projectService.loadProject(params['id']);
      }
    });
  }

  onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.choroplethService.togglePostcode(target.checked);
  }
  onCheckbox2Change(event: Event) {
    this.choroplethService.combineDemandSupply.update(
      () => (event.target as HTMLInputElement).checked
    );
  }

  addCareDemandList(event: Omit<AddCareDemandList, 'projectId'>) {
    this.careDemandService.addCareDemandList(event);
  }

  removeCareDemandList(event: string) {
    this.careDemandService.removeCareDemandList(event);
  }

  removeCareSupplyList(event: string) {
    this.careSupplyService.removeCareSupplyList(event);
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }

  addCareSupplyList(event: Omit<AddCareSupplyList, 'projectId'>) {
    this.careSupplyService.addCareSupplyList(event);
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
  }
}
