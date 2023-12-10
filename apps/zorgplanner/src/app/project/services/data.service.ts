import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { GeoJsonProperties } from 'geojson';
import { Objects } from 'topojson-specification';
import { AddProject, Project } from '../../shared/interfaces/project';
import {
  AddCareDemandList,
  ApiCareDemandList,
  CareDemandList,
} from '../../shared/interfaces/care-demand';
import { Observable, map } from 'rxjs';

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
    return this.httpService.get<Project[]>('/api/projects');
  }

  loadProject(id: string) {
    return this.httpService.get<Project>(`/api/projects/${id}`);
  }

  loadCareDemandLists(projectId: number): Observable<CareDemandList[]> {
    return this.httpService
      .get<ApiCareDemandList[]>(`/api/care-demand/${projectId}`)
      .pipe(
        map((lists) => {
          return lists.map((list) => {
            const careDemandMap = new Map<number, number>();
            Object.entries(list.careDemand).forEach(([key, value]) => {
              careDemandMap.set(parseInt(key), value);
            });
            return {
              ...list,
              careDemand: careDemandMap,
            };
          });
        })
      );
  }

  addCareDemandList(careDemandList: AddCareDemandList) {
    return this.httpService.post<CareDemandList, AddCareDemandList>(
      `/api/care-demand`,
      careDemandList
    );
  }
}
