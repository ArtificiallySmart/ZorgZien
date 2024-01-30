import { Route } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login-otp/login-otp.component').then(
        (m) => m.LoginOtpComponent
      ),
  },
  {
    path: 'project',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
    canActivate: [authGuard],
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./project/project.component').then((m) => m.ProjectComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
