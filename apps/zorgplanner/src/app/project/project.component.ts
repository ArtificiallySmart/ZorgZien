import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  NgbCollapseModule,
  NgbNavConfig,
  NgbNavModule,
  NgbPopover,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TablerIconsModule } from 'angular-tabler-icons';
import { HeaderComponent } from '../header/header.component';
import { MapComponent } from '../map/map.component';
import { CareDemandComponent } from './care-demand/care-demand.component';
import { CareDemandService } from './care-demand/services/care-demand.service';
import { CareSupplyComponent } from './care-supply/care-supply.component';
import { CareSupplyService } from './care-supply/services/care-supply.service';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectService } from './services/project.service';
import { DataViewComponent } from '../map/data-view/data-view.component';

const components = [
  CareDemandComponent,
  CareSupplyComponent,
  HeaderComponent,
  NewProjectComponent,
  MapComponent,
  DataViewComponent,
];

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    NgbPopoverModule,
    TablerIconsModule,
    NgbCollapseModule,
    RouterModule,
    ...components,
  ],
  providers: [NgbNavConfig],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnDestroy {
  @ViewChild('myPopover') myPopover!: NgbPopover;

  careDemandService = inject(CareDemandService);
  projectService = inject(ProjectService);
  careSupplyService = inject(CareSupplyService);
  router = inject(Router);

  route = inject(ActivatedRoute);

  careDemand = this.careDemandService.careDemandLists;
  careSupply = this.careSupplyService.careSupplyLists;

  projectList$ = this.projectService.projectList$;
  projectsExist = true;

  active = 'Postcode kaart';

  isCollapsed = true;

  constructor(config: NgbNavConfig) {
    config.destroyOnHide = false;
    this.route.params.subscribe((params) => {
      if (!params['id']) {
        this.projectsExist = false;
      }
      if (params['id']) {
        this.projectService.loadProject(params['id']);
      }
    });
  }

  openProject(projectId: number) {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
    this.careSupplyService.clear$.next();
    this.router.navigate(['/project', projectId]);
    this.active = 'Postcode kaart';
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
  }
}
