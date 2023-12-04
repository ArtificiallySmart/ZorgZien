import { type } from 'os';

export interface CareNeedList {
  id: string;
  title: string;
  careNeed: Map<number, number>;
}

export type AddCareNeedList = Omit<CareNeedList, 'id'>;
export type EditCareNeedList = {
  id: CareNeedList['id'];
  data: AddCareNeedList;
};
export type RemoveCareNeedList = CareNeedList['id'];
