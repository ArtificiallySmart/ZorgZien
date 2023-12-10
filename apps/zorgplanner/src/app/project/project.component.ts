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

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbNavModule, HourInputComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnDestroy {
  choroplethService = inject(ChoroplethService);
  parserService = inject(ParserService);
  careDemandService = inject(CareDemandService);
  projectService = inject(ProjectService);

  route = inject(ActivatedRoute);

  careDemand = this.careDemandService.careDemandLists;
  selectedList: string | undefined;

  active = 2;
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

  addCareDemandList(event: Omit<AddCareDemandList, 'projectId'>) {
    this.careDemandService.addCareDemandList(event);
  }

  removeCareDemandList(event: string) {
    this.careDemandService.removeCareDemandList(event);
  }

  selectList(event: Event) {
    if (this.selectedList !== undefined) {
      this.choroplethService.removeHours();
    }
    const target = event.target as HTMLSelectElement;
    this.selectedList = target.value;
    const list = this.careDemand().find((list) => list.id == target.value);
    console.log(this.careDemand(), this.selectedList, list);
    if (!list) return;
    this.choroplethService.addHours(list);
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
  }
}
