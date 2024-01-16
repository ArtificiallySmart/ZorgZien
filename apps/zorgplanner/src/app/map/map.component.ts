import { Component, ViewChild, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgbCollapseModule,
  NgbPopover,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Options } from '@popperjs/core';
import { ChoroplethService } from '../project/services/choropleth.service';
import { CareDemandService } from '../project/care-demand/services/care-demand.service';
import { CareSupplyService } from '../project/care-supply/services/care-supply.service';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProjectService } from '../project/services/project.service';
import {
  ZipcodeData,
  ZipcodeDataService,
} from '../project/services/zipcode-data.service';

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

    effect(
      () => {
        console.log('effect');
        const zipcodeData = this.choroplethService.clickLocation().zipcodeData;
        this.assignZipcodes
          ? this.reassingZipcode(zipcodeData)
          : this.togglePopover(zipcodeData);
      },
      { allowSignalWrites: true }
    );
  }

  reassingZipcode(zipcodeData: ZipcodeData) {
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
    console.log(oldOrganisationName, newOrganisationName, zipcodeData.zipcode);
  }

  togglePopover(zipcodeData: ZipcodeData) {
    this.myPopover.close(false);

    if (!zipcodeData.zipcode) {
      return;
    }
    if (this.choroplethService.clickLocation().x !== 0) {
      this.setPopperOptions([
        this.choroplethService.clickLocation().x,
        this.choroplethService.clickLocation().y,
      ]);

      setTimeout(() => this.myPopover.open({ zipcodeData }), 100);
    }
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

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }
}
