import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from './project.service';

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnInit {
  test: any;
  constructor(private projectService: ProjectService) {}

  ngOnInit() {}

  onCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.checked;
    this.projectService.togglePostcode(value);
  }
}
