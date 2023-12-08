import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../project/services/data.service';
import { ProjectService } from '../project/services/project.service';

@Component({
  selector: 'zorgplanner-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private dataService = inject(DataService);
  private router = inject(Router);
  projectService = inject(ProjectService);
  projectList$ = this.dataService.loadProjects();

  constructor() {}

  onChange(event: string) {
    this.router.navigate(['project', event]);
  }
}
