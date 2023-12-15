import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  NgbNavModule,
  NgbPopover,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { AddCareDemandList } from '../shared/interfaces/care-demand';
import { HourInputComponent } from './hour-input/hour-input.component';
import { CareDemandService } from './services/care-demand.service';
import { ChoroplethService } from './services/choropleth.service';
import { ParserService } from './services/parser.service';
import { ProjectService } from './services/project.service';
import { CareSupplyComponent } from './care-supply/care-supply.component';
import { CareSupplyService } from './services/care-supply.service';
import { AddCareSupplyList } from '../shared/interfaces/care-supply';
import { Options } from '@popperjs/core';

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    HourInputComponent,
    CareSupplyComponent,
    NgbPopoverModule,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnDestroy {
  @ViewChild('myPopover') myPopover!: NgbPopover;
  choroplethService = inject(ChoroplethService);
  parserService = inject(ParserService);
  careDemandService = inject(CareDemandService);
  projectService = inject(ProjectService);
  careSupplyService = inject(CareSupplyService);

  route = inject(ActivatedRoute);

  careDemand = this.careDemandService.careDemandLists;
  careSupply = this.careSupplyService.careSupplyLists;
  selectedSupplyList: string | undefined;

  popperOptions = (options: Partial<Options>) => {
    options.onFirstUpdate = (state) => {
      console.log('onFirstUpdate', state);
    };
    options.modifiers?.push({
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    });
    return options;
  };

  active = 1;
  zorgUren = '';

  constructor() {
    this.choroplethService.init();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.projectService.loadProject(params['id']);
      }
    });

    effect(() => {
      if (this.choroplethService.clickLocation().x !== 0) {
        this.setPopperOptions([
          this.choroplethService.clickLocation().x,
          this.choroplethService.clickLocation().y,
        ]);
        console.log(this.choroplethService.clickLocation().postalCodeData);
        const test = this.choroplethService.clickLocation().postalCodeData;
        setTimeout(() => this.myPopover.open({ test }), 100);
      }
    });
  }

  setPopperOptions(location: [number, number]) {
    this.popperOptions = (options: Partial<Options>) => {
      options.modifiers?.push({
        name: 'offset',
        options: {
          offset: [location[0], location[1]],
        },
      });

      return options;
    };
  }

  onCheckboxChange(event: Event) {
    // this.popoverButton.open();
    const target = event.target as HTMLInputElement;
    this.choroplethService.togglePostcode(target.checked);
  }

  addCareDemandList(event: Omit<AddCareDemandList, 'projectId'>) {
    this.careDemandService.addCareDemandList(event);
  }

  removeCareDemandList(event: string) {
    this.careDemandService.removeCareDemandList(event);
  }

  removeCareSupplyList(event: string) {
    this.careSupplyService.removeCareSupplyList(event);
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }

  addCareSupplyList(event: Omit<AddCareSupplyList, 'projectId'>) {
    this.careSupplyService.addCareSupplyList(event);
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
  }
}
