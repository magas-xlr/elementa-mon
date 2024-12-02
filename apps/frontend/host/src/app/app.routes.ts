import { loadRemoteModule } from '@angular-architects/module-federation';
import { Route } from '@angular/router';
// import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
  {
    path: 'avatar',
    loadChildren: () =>
      loadRemoteModule('avatar', './Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'battle',
    loadChildren: () =>
      loadRemoteModule('battle', './Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'deck',
    loadChildren: () =>
      loadRemoteModule('deck', './Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'game-over',
    loadChildren: () =>
      loadRemoteModule('gameOver', './Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'home',
    loadChildren: () =>
      loadRemoteModule('home', './Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'inventory',
    loadChildren: () =>
      loadRemoteModule('inventory', './Routes').then((m) => m!.remoteRoutes),

  },

  // {
  //   path: 'avatar',
  //   loadChildren: () =>
  //     loadRemote<typeof import('avatar/Routes')>('avatar/Routes').then(
  //       (m) => m!.remoteRoutes
  //     ),
  // },
  // {
  //   path: 'battle',
  //   loadChildren: () =>
  //     loadRemote<typeof import('battle/Routes')>('battle/Routes').then(
  //       (m) => m!.remoteRoutes
  //     ),
  // },
  // {
  //   path: 'deck',
  //   loadChildren: () =>
  //     loadRemote<typeof import('deck/Routes')>('deck/Routes').then(
  //       (m) => m!.remoteRoutes
  //     ),
  // },
  // {
  //   path: 'game-over',
  //   loadChildren: () =>
  //     loadRemote<typeof import('gameOver/Routes')>('gameOver/Routes').then(
  //       (m) => m!.remoteRoutes
  //     ),
  // },
  // {
  //   path: 'home',
  //   loadChildren: () =>
  //     loadRemote<typeof import('home/Routes')>('home/Routes').then(
  //       (m) => m!.remoteRoutes
  //     ),
  // },
];
