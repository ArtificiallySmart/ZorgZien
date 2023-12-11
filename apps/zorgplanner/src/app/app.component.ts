import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CareDemandService } from './project/services/care-demand.service';
import { ProjectService } from './project/services/project.service';
import { CareSupplyService } from './project/services/care-supply.service';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule],
  selector: 'zorgplanner-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  offcanvasService = inject(NgbOffcanvas);
  projectService = inject(ProjectService);
  careDemandService = inject(CareDemandService);
  careSupplyService = inject(CareSupplyService);

  open(content: TemplateRef<string>) {
    this.offcanvasService.open(content, {
      ariaLabelledBy: 'offcanvas-basic-title',
    });
  }
}
