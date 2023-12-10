export interface CareNeedList {
  id: string;
  title: string;
  careNeed: Map<number, number>;
  projectId: number;
}

export type AddCareNeedList = Omit<CareNeedList, 'id'>;

export type EditCareNeedList = {
  id: CareNeedList['id'];
  data: AddCareNeedList;
};

export type RemoveCareNeedList = CareNeedList['id'];

export interface ApiCareNeedList {
  id: string;
  title: string;
  careNeed: Record<number, number>;
  projectId: number;
}
