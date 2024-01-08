import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  NgbNavModule,
  NgbPopover,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CareDemandComponent } from './care-demand/care-demand.component';
import { CareDemandService } from './care-demand/services/care-demand.service';
import { ChoroplethService } from './services/choropleth.service';
import { ParserService } from './services/parser.service';
import { ProjectService } from './services/project.service';
import { CareSupplyComponent } from './care-supply/care-supply.component';
import { CareSupplyService } from './care-supply/services/care-supply.service';
import { Options } from '@popperjs/core';

@Component({
  selector: 'zorgplanner-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    CareDemandComponent,
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
    options.modifiers?.push({
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    });
    return options;
  };

  active = 1;

  constructor() {
    this.choroplethService.init();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.projectService.loadProject(params['id']);
      }
    });

    effect(() => {
      if (this.choroplethService.clickLocation().x !== 0) {
        if (this.myPopover.isOpen()) {
          this.myPopover.close();
        }
        this.setPopperOptions([
          this.choroplethService.clickLocation().x,
          this.choroplethService.clickLocation().y,
        ]);
        const zipcodeData = this.choroplethService.clickLocation().zipcodeData;
        setTimeout(() => this.myPopover.open({ zipcodeData }), 100);
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
    const target = event.target as HTMLInputElement;
    this.choroplethService.togglePostcode(target.checked);
  }

  demandType() {
    this.choroplethService.demandType.update((type) => {
      if (type === 'clients') {
        return 'hours';
      }
      return 'clients';
    });
  }

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }

  ngOnDestroy() {
    this.projectService.clear$.next();
    this.careDemandService.clear$.next();
  }
}
