export interface CareSupplyList {
  id: string;
  title: string;
  careSupply: CareSupplyEntry[];
  projectId: number;
}
export interface CareSupplyEntry {
  id?: string;
  name: string;
  amount?: number;
  color: string;
  areaZipcodes?: string[];
}

export interface CombinedDemandSupply {
  organisationName: string;
  totalDemandClients: number;
  totalDemandHours: number;
  totalSupplyHours: number;
  zipcodes: ZipcodeEntry[];
}

export interface ZipcodeEntry {
  zipcode: string;
  demandClients: number;
  demandHours: number;
}

export type AddCareSupplyList = Omit<CareSupplyList, 'id'>;

export type EditCareSupplyList = {
  id: CareSupplyList['id'];
  data: AddCareSupplyList;
};

export type RemoveCareSupplyList = CareSupplyList['id'];
