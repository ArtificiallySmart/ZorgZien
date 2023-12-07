import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddProject } from '../../shared/interfaces/project';

@Component({
  selector: 'zorgplanner-new-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.scss',
})
export class NewProjectComponent {
  projectTitle = '';
  projectDescription = '';
  projectStartDate = new Date();
  projectProvinces = ['groningen'];

  initiateProject() {
    const project = {
      title: this.projectTitle,
      description: this.projectDescription,
      startDate: this.projectStartDate,
      provinces: this.projectProvinces,
    } as AddProject;
    console.log(project);
  }
}
