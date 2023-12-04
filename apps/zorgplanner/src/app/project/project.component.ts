import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from './services/project.service';
import { FormsModule } from '@angular/forms';
import { ParserService } from './services/parser.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HourInputComponent } from './hour-input/hour-input.component';
import { CareNeedService } from './services/care-need.service';
import { AddCareNeedList } from '../shared/interfaces/care-need';

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbNavModule, HourInputComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnInit {
  projectService = inject(ProjectService);
  parserService = inject(ParserService);
  careNeedService = inject(CareNeedService);

  active = 1;
  zorgUren = '';

  ngOnInit() {}

  onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.projectService.togglePostcode(target.checked);
  }

  addHours() {
    const data = this.parserService.parse(this.zorgUren);
    this.projectService.addHours(data);
  }
  addCareNeedList(event: AddCareNeedList) {
    this.careNeedService.add$.next(event);
  }
}
