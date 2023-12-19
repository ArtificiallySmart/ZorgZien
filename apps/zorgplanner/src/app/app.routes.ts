import { Route } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

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
    canActivate: [authGuard],
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
    canActivate: [authGuard],
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
    canActivate: [authGuard],
  },
];
