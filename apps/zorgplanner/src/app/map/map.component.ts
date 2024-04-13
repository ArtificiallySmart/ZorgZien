import { Component, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbCollapseModule,
  NgbPopover,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Options } from '@popperjs/core';
import {
  ChoroplethService,
  ClickLocationData,
} from './services/choropleth.service';
import { CareDemandService } from '../project/care-demand/services/care-demand.service';
import { CareSupplyService } from '../project/care-supply/services/care-supply.service';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProjectService } from '../project/services/project.service';
import {
  ZipcodeData,
  ZipcodeDataService,
} from './services/zipcode-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'zorgplanner-map',
  standalone: true,
  imports: [
    CommonModule,
    NgbPopoverModule,
    TablerIconsModule,
    NgbCollapseModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  @ViewChild('myPopover') myPopover!: NgbPopover;
  choroplethService = inject(ChoroplethService);
  careDemandService = inject(CareDemandService);
  careSupplyService = inject(CareSupplyService);
  projectService = inject(ProjectService);
  zipcodeDataService = inject(ZipcodeDataService);

  careDemand = this.careDemandService.careDemandLists;
  careSupply = this.careSupplyService.careSupplyLists;
  project = this.projectService.project;
  isCollapsed = false;

  organisationNames = computed(() => {
    return this.careSupplyService
      .selectedCareSupplyList()
      ?.careSupply.map((careSupply) => careSupply.name);
  });

  assignZipcodes = false;
  selectedOrganisationName = '';

  constructor() {
    this.choroplethService.init();

    this.choroplethService.clickLocation$
      .pipe(takeUntilDestroyed())
      .subscribe((clickLocation) => {
        this.assignZipcodes
          ? this.reassignZipcode(clickLocation.zipcodeData)
          : this.togglePopover(clickLocation);
      });
  }

  reassignZipcode(zipcodeData: ZipcodeData) {
    const oldOrganisationName = zipcodeData.assignedTeamName;
    const newOrganisationName = this.selectedOrganisationName;
    if (oldOrganisationName === newOrganisationName || !zipcodeData.zipcode) {
      return;
    }
    this.careSupplyService.changeZipcodeForOrganisation$.next({
      zipcode: zipcodeData.zipcode,
      oldOrganisationName,
      newOrganisationName,
    });
  }

  togglePopover(clickLocation: ClickLocationData) {
    this.myPopover.close(false);

    if (!clickLocation.zipcodeData.zipcode) {
      return;
    }

    if (clickLocation.x !== 0) {
      // Set the popper options to the click location
      this.setPopperOptions([clickLocation.x, clickLocation.y]);

      // Use requestAnimationFrame to delay execution until the next frame to ensure the popper options are set
      requestAnimationFrame(() => {
        this.myPopover.open({ zipcodeData: clickLocation.zipcodeData });
      });
    }
  }

  toggleAssign(event: Event) {
    this.assignZipcodes = (event.target as HTMLInputElement).checked;
  }

  selectOrganisationName(name: string) {
    if (this.selectedOrganisationName === name) {
      this.selectedOrganisationName = '';
      return;
    }
    this.selectedOrganisationName = name;
  }

  popperOptions = (options: Partial<Options>) => {
    options.modifiers?.push({
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    });
    return options;
  };
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
    const target = event.target as HTMLInputElement;
    this.choroplethService.togglePostcode(target.checked);
  }

  changeDemandType(type: 'clients' | 'hours') {
    this.choroplethService.demandType.update(() => type);
  }

  selectDemandList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }
}
