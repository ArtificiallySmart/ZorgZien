import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddProject } from '../../shared/interfaces/project';
import { DataService } from '../services/data.service';
import { ProjectService } from '../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'zorgplanner-new-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectComponent {
  dataService = inject(DataService);
  projectService = inject(ProjectService);
  private router = inject(Router);
  projectTitle = '';
  projectDescription = '';
  projectProvinces = ['groningen'];

  constructor() {
    effect(() => {
      if (this.projectService.loaded()) {
        this.router.navigate(['project', this.projectService.project().id]);
      }
    });
  }

  initiateProject() {
    const project = {
      title: this.projectTitle,
      description: this.projectDescription,
      provinces: this.projectProvinces,
    } as AddProject;
    this.projectService.addProject(project);
    this.projectTitle = this.projectDescription = '';
  }
}
