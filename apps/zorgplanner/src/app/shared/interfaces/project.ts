import { CareDemandList } from './care-demand';

export interface Project {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  lastOpened: Date;
  provinces: string[];
  careDemands?: CareDemandList[];
}

export type AddProject = Omit<Project, 'id' | 'startDate' | 'lastOpened'>;
export type EditProject = {
  id: Project['id'];
  data: AddProject;
};
export type RemoveProject = Project['id'];
