import { Injectable, Signal, computed, inject } from '@angular/core';
import { CareDemandService } from '../care-demand/services/care-demand.service';
import { CareSupplyService } from '../care-supply/services/care-supply.service';
import { CareDemandList } from '../../shared/interfaces/care-demand';
import { CareSupplyList } from '../../shared/interfaces/care-supply';

export interface ZipcodeData {
  zipcode: string;
  demand: number | null;
  amountOfClients: number | null;
  amountOfHours: number | null;
  assignedTeam: string | null;
  color: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ZipcodeDataService {
  private careDemandService = inject(CareDemandService);
  private careSupplyService = inject(CareSupplyService);

  demandZipcodeData: Signal<ZipcodeData[]> = computed(() => {
    if (this.careDemandService.loaded()) {
      return this.convertDemandList(
        this.careDemandService.selectedCareDemandList()
      );
    }
    return [];
  });

  supplyZipcodeData: Signal<ZipcodeData[]> = computed(() => {
    if (this.careSupplyService.loaded()) {
      return this.convertSupplyList(
        this.careSupplyService.selectedCareSupplyList()
      );
    }
    return [];
  });

  currentZipcodeData: Signal<ZipcodeData[]> = computed(() => {
    return this.combineZipcodeData();
  });

  convertDemandList(demandList: CareDemandList | null) {
    if (demandList === null) {
      return [];
    }
    const data: ZipcodeData[] = [];
    demandList.careDemand.forEach((entry) => {
      data.push({
        zipcode: entry.zipcode.toString(),
        demand: entry.clients ?? 0,
        amountOfClients: entry.clients ?? 0,
        amountOfHours: entry.hours ?? 0,
        assignedTeam: 'Niet toegewezen',
        color: null,
      });
    });
    return data;
  }

  convertSupplyList(supplyList: CareSupplyList | null) {
    if (supplyList === null) {
      return [];
    }
    const data: ZipcodeData[] = [];
    supplyList.careSupply.forEach((entry) => {
      entry.areaZipcodes?.forEach((zipcode) => {
        data.push({
          zipcode: zipcode,
          demand: null,
          amountOfClients: null,
          amountOfHours: null,
          assignedTeam: entry.name,
          color: entry.color,
        });
      });
    });
    return data;
  }

  combineZipcodeData() {
    const list1 = this.demandZipcodeData().map((entry) => ({
      ...entry,
    }));
    const list2 = this.supplyZipcodeData().map((entry) => ({ ...entry }));

    list2.forEach((entry) => {
      const index = list1.findIndex((el) => el.zipcode === entry.zipcode);
      if (index !== -1) {
        list1[index].assignedTeam = entry.assignedTeam ?? null;
        list1[index].color = entry.color ?? null;
      } else {
        list1.push(entry);
      }
    });
    return list1;
  }
}
