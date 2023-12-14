export interface CareSupplyList {
  id: string;
  title: string;
  careSupply: CareSupplyEntry[];
  projectId: number;
}
export interface CareSupplyEntry {
  name: string;
  amount?: number;
  color: string;
  areaPostalCodes?: string[];
}

export type AddCareSupplyList = Omit<CareSupplyList, 'id'>;

export type EditCareSupplyList = {
  id: CareSupplyList['id'];
  data: AddCareSupplyList;
};

export type RemoveCareSupplyList = CareSupplyList['id'];
