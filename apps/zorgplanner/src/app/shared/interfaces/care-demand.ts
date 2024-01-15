export interface CareDemandList {
  id: string;
  title: string;
  careDemand: CareDemandEntry[];
  projectId: number;
}

export type AddCareDemandList = {
  title: string;
  careDemand: AddCareDemandEntry[];
  projectId: number;
};

export type EditCareDemandList = {
  id: CareDemandList['id'];
  data: Omit<CareDemandList, 'id'>;
};

export type RemoveCareDemandList = CareDemandList['id'];

export interface CareDemandEntry {
  id?: string;
  zipcode: number;
  clients?: number;
  hours?: number;
  careDemandListId: string;
}

export type AddCareDemandEntry = Omit<
  CareDemandEntry,
  'id' | 'careDemandListId'
>;
