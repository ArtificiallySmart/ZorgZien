import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { GeoJsonProperties } from 'geojson';
import { Objects } from 'topojson-specification';
import { AddProject, Project } from '../../shared/interfaces/project';
import {
  AddCareDemandList,
  CareDemandList,
  EditCareDemandList,
} from '../../shared/interfaces/care-demand';
import { Observable, map } from 'rxjs';
import {
  AddCareSupplyList,
  CareSupplyList,
  EditCareSupplyList,
} from '../../shared/interfaces/care-supply';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private httpService = inject(HttpService);
  constructor() {}

  loadGeoData() {
    return this.httpService.get<TopoJSON.Topology<Objects<GeoJsonProperties>>>(
      '/api/geodata'
    );
  }

  addProject(newProject: AddProject) {
    return this.httpService.post<Project, AddProject>(
      '/api/projects',
      newProject
    );
  }

  loadProjects() {
    return this.httpService.get<Project[]>('/api/projects').pipe(
      map((projects) => {
        if (projects.length === 0) {
          return [];
        }
        return projects;
      })
    );
  }

  loadProject(id: string) {
    return this.httpService.get<Project>(`/api/projects/${id}`);
  }

  loadCareDemandLists(projectId: number): Observable<CareDemandList[]> {
    return this.httpService.get<CareDemandList[]>(
      `/api/care-demand/${projectId}`
    );
    // .pipe(
    //   map((lists) => {
    //     return lists.map((list) => {
    //       const careDemandMap = new Map<number, number>();
    //       Object.entries(list.careDemand).forEach(([key, value]) => {
    //         careDemandMap.set(parseInt(key), value);
    //       });
    //       return {
    //         ...list,
    //         careDemand: careDemandMap,
    //       };
    //     });
    //   })
    // );
  }

  addCareDemandList(careDemandList: AddCareDemandList) {
    return this.httpService.post<CareDemandList, AddCareDemandList>(
      `/api/care-demand`,
      careDemandList
    );
  }

  editCareDemandList(careDemandList: EditCareDemandList) {
    return this.httpService.patch<CareDemandList, AddCareDemandList>(
      `/api/care-demand/${careDemandList.id}`,
      careDemandList.data
    );
  }

  removeCareDemandList(id: string) {
    return this.httpService.delete<CareDemandList>(`/api/care-demand/${id}`);
  }

  loadCareSupplyLists(projectId: number) {
    return this.httpService.get<CareSupplyList[]>(
      `/api/care-supply/${projectId}`
    );
  }

  addCareSupplyList(careSupplyList: AddCareSupplyList) {
    return this.httpService.post<CareSupplyList, AddCareSupplyList>(
      `/api/care-supply`,
      careSupplyList
    );
  }

  editCareSupplyList(careSupplyList: EditCareSupplyList) {
    return this.httpService.patch<CareSupplyList, AddCareSupplyList>(
      `/api/care-supply/${careSupplyList.id}`,
      careSupplyList.data
    );
  }

  removeCareSupplyList(id: string) {
    return this.httpService.delete<CareSupplyList>(`/api/care-supply/${id}`);
  }
}
