import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
    title: 'Saleem Khan · Senior Software Engineer',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
