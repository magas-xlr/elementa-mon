import { loadRemoteModule } from '@angular-architects/native-federation';
import { Route } from '@angular/router';

// Remote URLs come from public/federation.manifest.json
export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => loadRemoteModule('home', './Routes').then((m) => m.default),
  },
  {
    path: 'deck-builder',
    loadChildren: () => loadRemoteModule('deck-builder', './Routes').then((m) => m.default),
  },
  {
    path: 'battle',
    loadChildren: () => loadRemoteModule('battle', './Routes').then((m) => m.default),
  },
  {
    path: 'world-map',
    loadChildren: () => loadRemoteModule('world-map', './Routes').then((m) => m.default),
  },
  {
    path: 'inventory',
    loadChildren: () => loadRemoteModule('inventory', './Routes').then((m) => m.default),
  },
  {
    path: 'avatar-customization',
    loadChildren: () => loadRemoteModule('avatar-customization', './Routes').then((m) => m.default),
  },
  {
    path: 'game-over',
    loadChildren: () => loadRemoteModule('game-over', './Routes').then((m) => m.default),
  },
];
