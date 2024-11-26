import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'battle',
    loadChildren: () => import('battle/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'avatar',
    loadChildren: () => import('avatar/Routes').then((m) => m!.remoteRoutes),
  },
];
