import { Injectable, Signal, computed, inject } from '@angular/core';
import { CareDemandService } from '../../project/care-demand/services/care-demand.service';
import { CareSupplyService } from '../../project/care-supply/services/care-supply.service';
import { CareDemandList } from '../../shared/interfaces/care-demand';
import {
  CareSupplyList,
  CombinedDemandSupply,
  ZipcodeEntry,
} from '../../shared/interfaces/care-supply';
import { environment } from '../../../environments/environment';

export interface ZipcodeData {
  zipcode: string;
  totalAmountOfClients: number | null;
  totalAmountOfHours: number | null;
  assignedTeamName: string | null;
  color: string | null;
  activeTeams: ZipcodeTeam[];
}

export interface ZipcodeTeam {
  teamName: string;
  amountOfHours: number;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class ZipcodeDataService {
  private careDemandService = inject(CareDemandService);
  private careSupplyService = inject(CareSupplyService);
  hoursInFTE = environment.hoursInFTE;

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

  combinedDemandSupply: Signal<CombinedDemandSupply[]> = computed(() => {
    const demandListEntries =
      this.careDemandService.selectedCareDemandList()?.careDemand;
    const supplyListEntries =
      this.careSupplyService.selectedCareSupplyList()?.careSupply;
    if (!supplyListEntries) return [] as CombinedDemandSupply[];

    const zipcodes: ZipcodeEntry[] = [];
    if (demandListEntries) {
      demandListEntries.forEach((entry) => {
        zipcodes.push({
          zipcode: entry.zipcode.toString(),
          demandClients: entry.clients ?? 0,
          demandHours: entry.hours ?? 0,
        });
      });
    }

    const combined: CombinedDemandSupply[] = [];
    supplyListEntries.forEach((entry) => {
      const org: CombinedDemandSupply = {
        organisationName: entry.name,
        totalDemandClients: 0,
        totalDemandHours: 0,
        totalSupplyHours: entry.amount ?? 0,
        zipcodes: [],
      };
      entry.areaZipcodes?.forEach((zipcode) => {
        const index = zipcodes.findIndex((el) => el.zipcode === zipcode);
        if (index !== -1) {
          org.zipcodes.push(zipcodes[index]);
          org.totalDemandClients += zipcodes[index].demandClients;
          org.totalDemandHours += zipcodes[index].demandHours;
          zipcodes.splice(index, 1);
        }
      });
      org.totalSupplyHours *= this.hoursInFTE;
      org.totalDemandHours = Math.round(org.totalDemandHours * 100) / 100;
      combined.push(org);
    });
    if (zipcodes.length === 0) return combined;

    const unassigned: CombinedDemandSupply = {
      organisationName: 'Niet toegewezen',
      totalDemandClients: 0,
      totalDemandHours: 0,
      totalSupplyHours: 0,
      zipcodes: [],
    };
    zipcodes.forEach((entry) => {
      unassigned.zipcodes.push(entry);
      unassigned.totalDemandClients += entry.demandClients;
      unassigned.totalDemandHours += entry.demandHours;
    });
    combined.push(unassigned);
    return combined;
  });

  convertDemandList(demandList: CareDemandList | null) {
    if (demandList === null) {
      return [];
    }
    const data: ZipcodeData[] = [];
    demandList.careDemand.forEach((entry) => {
      data.push({
        zipcode: entry.zipcode.toString(),
        totalAmountOfClients: entry.clients ?? 0,
        totalAmountOfHours: entry.hours ?? 0,
        assignedTeamName: 'Niet toegewezen',
        color: null,
        activeTeams: [],
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
        data.findIndex((el) => el.zipcode === zipcode) === -1
          ? data.push({
              zipcode: zipcode,
              totalAmountOfClients: null,
              totalAmountOfHours: null,
              assignedTeamName: entry.name,
              color: entry.color,
              activeTeams: [
                {
                  teamName: entry.name,
                  amountOfHours: entry.amount ?? 0,
                  color: entry.color,
                },
              ],
            })
          : data
              .find((el) => el.zipcode === zipcode)
              ?.activeTeams.push({
                teamName: entry.name,
                amountOfHours: entry.amount ?? 0,
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
        list1[index].assignedTeamName = entry.assignedTeamName ?? null;
        list1[index].color = entry.color ?? null;
      } else {
        list1.push(entry);
      }
    });
    return list1;
  }
}
