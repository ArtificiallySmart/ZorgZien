import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AddCareNeedList } from '../shared/interfaces/care-need';
import { HourInputComponent } from './hour-input/hour-input.component';
import { CareNeedService } from './services/care-need.service';
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
  careNeedService = inject(CareNeedService);
  projectService = inject(ProjectService);

  route = inject(ActivatedRoute);

  careNeed = this.careNeedService.careNeed;
  selectedList: string | undefined;

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

  addCareNeedList(event: AddCareNeedList) {
    this.careNeedService.add$.next(event);
  }

  selectList(event: Event) {
    if (this.selectedList !== undefined) {
      this.choroplethService.removeHours();
    }
    const target = event.target as HTMLSelectElement;
    this.selectedList = target.value;
    const list = this.careNeed().find((list) => list.id === target.value);
    if (!list) return;
    this.choroplethService.addHours(list);
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
  }
}
