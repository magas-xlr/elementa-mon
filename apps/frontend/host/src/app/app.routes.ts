import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
  {
    path: 'avatar',
    loadChildren: () =>
      loadRemote<typeof import('avatar/Routes')>('avatar/Routes').then(
        (m) => m!.remoteRoutes
      ),
  },
  {
    path: 'battle',
    loadChildren: () =>
      loadRemote<typeof import('battle/Routes')>('battle/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'deck',
    loadChildren: () =>
      loadRemote<typeof import('deck/Routes')>('deck/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'game-over',
    loadChildren: () =>
      loadRemote<typeof import('gameOver/Routes')>('gameOver/Routes').then(
        (m) => m!.remoteRoutes
      ),
  },
];
