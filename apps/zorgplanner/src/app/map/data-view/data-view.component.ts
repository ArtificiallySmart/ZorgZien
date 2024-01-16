import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CareDemandService } from '../../project/care-demand/services/care-demand.service';
import { CareSupplyService } from '../../project/care-supply/services/care-supply.service';
import { ZipcodeDataService } from '../../project/services/zipcode-data.service';
import { CombinedDemandSupply } from '../../shared/interfaces/care-supply';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'zorgplanner-data-view',
  standalone: true,
  imports: [CommonModule, NgbCollapseModule, TablerIconsModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.scss',
})
export class DataViewComponent {
  careDemandService = inject(CareDemandService);
  careSupplyService = inject(CareSupplyService);
  zipcodeDataService = inject(ZipcodeDataService);

  careDemand = this.careDemandService.careDemandLists;
  careSupply = this.careSupplyService.careSupplyLists;

  selectedCareDemandList = this.careDemandService.selectedCareDemandList;
  selectedCareSupplyList = this.careSupplyService.selectedCareSupplyList;

  combinedDemandSupplyTable = computed(() =>
    this.zipcodeDataService
      .combinedDemandSupply()
      .map((item: CombinedDemandSupply) => {
        return {
          ...item,
          isCollapsed: true,
        };
      })
  );

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }
}
