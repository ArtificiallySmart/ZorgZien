import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { GeoJsonProperties } from 'geojson';
import { Objects } from 'topojson-specification';
import { AddProject, Project } from '../../shared/interfaces/project';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private httpService = inject(HttpService);
  constructor() {}

  loadGeoData(provinces?: string[]) {
    if (provinces) {
      throw new Error('Method not implemented.');
    }
    return this.httpService.get<TopoJSON.Topology<Objects<GeoJsonProperties>>>(
      '/api'
    );
  }

  addProject(newProject: AddProject) {
    return this.httpService.post<Project, AddProject>(
      '/api/project',
      newProject
    );
  }
}
