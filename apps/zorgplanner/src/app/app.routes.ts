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
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'project',
    loadComponent: () =>
      import('./project/new-project/new-project.component').then(
        (m) => m.NewProjectComponent
      ),
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
  },
];
