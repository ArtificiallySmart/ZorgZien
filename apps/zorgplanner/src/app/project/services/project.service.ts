import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AddProject,
  EditProject,
  Project,
  RemoveProject,
} from '../../shared/interfaces/project';
import { Subject, catchError, map, merge, of } from 'rxjs';
import { DataService } from './data.service';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';
import { connect } from 'ngxtension/connect';

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
  toastService = inject(ToastService);
  private router = inject(Router);
  //state
  initialState: ProjectState = {
    project: {} as Project,
    loaded: false,
    error: null,
  };

  public state = signal<ProjectState>(this.initialState);

  //selectors
  project = computed(() => this.state().project);
  projectId = computed(() => this.state().project.id);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

  //sources
  load$ = new Subject<Project>();
  edit$ = new Subject<EditProject>();
  remove$ = new Subject<RemoveProject>();
  clear$ = new Subject<void>();

  projectList$ = this.dataService.loadProjects();

  constructor() {
    //reducers

    const nextState$ = merge(
      this.load$.pipe(
        map((project) => ({
          loaded: true,
          project: project,
        })),
        catchError((err) => of(err))
      ),
      this.edit$.pipe(
        map(({ data }) => ({
          project: {
            ...this.project(),
            ...data,
          },
        }))
      ),
      this.remove$.pipe(map(() => this.initialState)),
      this.clear$.pipe(map(() => this.initialState))
    );

    connect(this.state).with(nextState$);
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
    return this.dataService.addProject(project).subscribe({
      next: (project) => {
        this.load$.next(project);
        this.router.navigate(['project', project.id]);
        this.toastService.show('Project aangemaakt', 'success');
      },
      error: (err) => this.load$.next(err),
    });
  }
}
