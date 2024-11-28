import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const appRoutes: Route[] = [
  {
    path: 'avatar',
    loadChildren: () =>
      loadRemoteModule('avatar', './Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'battle',
    loadChildren: () =>
      loadRemoteModule('battle', './Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'deck',
    loadChildren: () =>
      loadRemoteModule('deck', './Routes').then((m) => m.remoteRoutes),
  },

];
