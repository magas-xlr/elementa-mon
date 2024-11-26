import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'avatar',
    loadChildren: () => import('avatar/Routes').then((m) => m!.remoteRoutes),
  },
];
