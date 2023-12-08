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
}
