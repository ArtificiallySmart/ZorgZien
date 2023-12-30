export interface CareDemandList {
  id: string;
  title: string;
  careDemand: [number, number][];
  projectId: number;
}

export type AddCareDemandList = Omit<CareDemandList, 'id'>;

export type EditCareDemandList = {
  id: CareDemandList['id'];
  data: AddCareDemandList;
};

export type RemoveCareDemandList = CareDemandList['id'];

export interface ApiCareDemandList {
  id: string;
  title: string;
  careDemand: [number, number][];
  projectId: number;
}
