import { loadRemoteModule } from '@angular-architects/module-federation';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'deck-builder',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4202/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'battle',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4203/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'world-map',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4204/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'inventory',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4205/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'avatar-customization',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4206/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
  {
    path: 'game-over',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4207/remoteEntry.js',
        exposedModule: './Routes',
      }).then((m) => m.default),
  },
];
