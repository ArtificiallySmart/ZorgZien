import { CareNeedList } from './care-need';

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  lastOpened: Date;
  provinces: string[];
  careNeeds?: CareNeedList[];
}

export type AddProject = Omit<Project, 'id' | 'lastOpened'>;
export type EditProject = {
  id: Project['id'];
  data: AddProject;
};
export type RemoveProject = Project['id'];
