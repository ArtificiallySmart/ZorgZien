import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddProject } from '../../shared/interfaces/project';
import { DataService } from '../services/data.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'zorgplanner-new-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectComponent {
  @Output() projectAdded = new EventEmitter();
  dataService = inject(DataService);
  projectService = inject(ProjectService);
  projectTitle = '';
  projectDescription = '';
  projectProvinces = ['groningen'];

  constructor() {}

  initiateProject() {
    const project = {
      title: this.projectTitle,
      description: this.projectDescription,
      provinces: this.projectProvinces,
    } as AddProject;
    this.projectService.addProject(project);
    this.projectTitle = this.projectDescription = '';
    this.projectAdded.emit();
  }
}
