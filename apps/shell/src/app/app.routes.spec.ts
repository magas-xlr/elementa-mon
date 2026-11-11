import { loadRemoteModule } from '@angular-architects/native-federation';
import { appRoutes } from './app.routes';

jest.mock('@angular-architects/native-federation', () => ({
  loadRemoteModule: jest.fn(),
}));

const remotes = [
  'home',
  'deck-builder',
  'battle',
  'world-map',
  'inventory',
  'avatar-customization',
  'game-over',
];

describe('appRoutes', () => {
  const load = loadRemoteModule as jest.Mock;

  beforeEach(() => load.mockReset());

  it('should redirect the empty path to home', () => {
    expect(appRoutes[0]).toEqual({ path: '', redirectTo: 'home', pathMatch: 'full' });
  });

  it.each(remotes)("should lazy load the '%s' remote routes", async (remote) => {
    const remoteRoutes = [{ path: '' }];
    load.mockResolvedValue({ default: remoteRoutes });

    const route = appRoutes.find((r) => r.path === remote);
    const loaded = await route?.loadChildren?.();

    expect(load).toHaveBeenCalledWith(remote, './Routes');
    expect(loaded).toBe(remoteRoutes);
  });
});
