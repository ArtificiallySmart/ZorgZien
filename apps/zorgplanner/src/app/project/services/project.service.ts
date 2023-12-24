import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AddProject,
  EditProject,
  Project,
  RemoveProject,
} from '../../shared/interfaces/project';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from './data.service';

export interface ProjectState {
  project: Project;
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  dataService = inject(DataService);
  //state
  public state = signal<ProjectState>({
    project: {} as Project,
    loaded: false,
    error: null,
  });

  //selectors
  project = computed(() => this.state().project);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  load$ = new Subject<Project | HttpErrorResponse>();
  edit$ = new Subject<EditProject>();
  remove$ = new Subject<RemoveProject>();
  clear$ = new Subject<void>();

  constructor() {
    this.load$.subscribe((result) => {
      if (result instanceof HttpErrorResponse) {
        return this.state.update((state) => ({
          ...state,
          loaded: false,
          error: result.message,
        }));
      }
      this.state.update(() => ({
        project: result,
        loaded: true,
        error: null,
      }));
    });

    this.edit$.subscribe((project) => {
      this.state.update((state) => ({
        ...state,
        project: {
          ...state.project,
          ...project.data,
        },
      }));
    });

    this.remove$.subscribe(() => {
      this.state.update((state) => ({
        ...state,
        project: {} as Project,
        loaded: false,
      }));
    });

    this.clear$.subscribe(() => {
      this.state.update((state) => ({
        ...state,
        project: {} as Project,
        loaded: false,
      }));
    });
  }

  loadProject(id: string) {
    this.dataService.loadProject(id).subscribe({
      next: (project) => {
        this.load$.next(project);
      },
      error: (err) => this.load$.next(err),
    });
  }

  addProject(project: AddProject) {
    this.dataService.addProject(project).subscribe({
      next: (project) => this.load$.next(project),
      error: (err) => this.load$.next(err),
    });
  }
}
