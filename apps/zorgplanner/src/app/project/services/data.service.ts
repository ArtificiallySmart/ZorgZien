import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { GeoJsonProperties } from 'geojson';
import { Objects } from 'topojson-specification';
import { AddProject, Project } from '../../shared/interfaces/project';
import {
  AddCareNeedList,
  ApiCareNeedList,
  CareNeedList,
} from '../../shared/interfaces/care-need';
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

  loadCareNeedLists(projectId: number): Observable<CareNeedList[]> {
    return this.httpService
      .get<ApiCareNeedList[]>(`/api/care-need/${projectId}`)
      .pipe(
        map((lists) => {
          return lists.map((list) => {
            const careNeedMap = new Map<number, number>();
            Object.entries(list.careNeed).forEach(([key, value]) => {
              careNeedMap.set(parseInt(key), value);
            });
            return {
              ...list,
              careNeed: careNeedMap,
            };
          });
        })
      );
  }

  addCareNeedList(careNeedList: AddCareNeedList) {
    return this.httpService.post<CareNeedList, AddCareNeedList>(
      `/api/care-need`,
      careNeedList
    );
  }
}
