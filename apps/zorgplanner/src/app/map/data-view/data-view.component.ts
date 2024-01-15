import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareDemandService } from '../../project/care-demand/services/care-demand.service';
import { CareSupplyService } from '../../project/care-supply/services/care-supply.service';
import { ZipcodeDataService } from '../../project/services/zipcode-data.service';

@Component({
  selector: 'zorgplanner-data-view',
  standalone: true,
  imports: [CommonModule],
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

  combinedDemandSupply = this.zipcodeDataService.combinedDemandSupply;

  selectList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careDemandService.selectCareDemandListId$.next(target.value);
  }

  selectSupplyList(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.careSupplyService.selectCareSupplyListId$.next(target.value);
  }
}
