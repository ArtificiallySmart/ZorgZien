import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'project',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
  },
  {
    path: 'project/new',
    loadComponent: () =>
      import('./project/new-project/new-project.component').then(
        (m) => m.NewProjectComponent
      ),
  },
];
