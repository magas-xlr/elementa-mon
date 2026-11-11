# 🚀 Module Federation - Quick Start Guide

## Overview

ElementaMon microfrontends use **[Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation)**
(`@angular-architects/native-federation`), the Module Federation implementation that works with Angular's
esbuild `application` builder. The shell app acts as the host and dynamically loads 7 remote microfrontends at runtime.

> The previous setup (`@angular-architects/module-federation`) is webpack-only and never produced a
> `remoteEntry.js` with the esbuild builder used by these apps, so the shell could not load any remote.

## Architecture

```
Shell (Host) - http://localhost:4200
├── Home - http://localhost:4201
├── Deck Builder - http://localhost:4202
├── Battle - http://localhost:4203
├── World Map - http://localhost:4204
├── Inventory - http://localhost:4205
├── Avatar Customization - http://localhost:4206
└── Game Over - http://localhost:4207
```

## Configuration Files

| File                                    | Purpose                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `apps/<app>/federation.config.js`       | Federation name, exposed modules and shared dependencies      |
| `apps/<app>/src/main.ts`                | Calls `initFederation()` before bootstrapping                 |
| `apps/<app>/src/bootstrap.ts`           | The original Angular bootstrap code                           |
| `apps/shell/public/federation.manifest.json` | Remote name → `remoteEntry.json` URL map used by the shell |
| `apps/<app>/project.json`               | `build`/`serve` use `@angular-architects/native-federation:build`, wrapping the `esbuild` and `serve-original` targets |

### Shell (Host)

```json
// apps/shell/public/federation.manifest.json
{
  "home": "http://localhost:4201/remoteEntry.json",
  "deck-builder": "http://localhost:4202/remoteEntry.json"
}
```

```typescript
// apps/shell/src/app/app.routes.ts
{
  path: 'home',
  loadChildren: () => loadRemoteModule('home', './Routes').then((m) => m.default),
}
```

### Remotes (e.g., Home)

```javascript
// apps/home/federation.config.js
module.exports = withNativeFederation({
  name: 'home',
  exposes: {
    './Routes': './apps/home/src/app/app.routes.ts',
  },
  shared: { ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }) },
});
```

## How to Test

Each app's dev-server port is set in its `project.json`, so no `--port` flag is needed.

```powershell
# Terminal 1: Start shell
npx nx serve shell

# Terminal 2: Start home remote
npx nx serve home
```

Navigate to http://localhost:4200/home - the home microfrontend is loaded inside the shell.

To test everything, start the other remotes (`deck-builder`, `battle`, `world-map`, `inventory`,
`avatar-customization`, `game-over`) the same way, each in its own terminal.

> **Tip:** start the dev servers one at a time. Starting all 8 at once on a machine with 16 GB RAM can run Node
> out of memory while the first builds run.

## What Happens Under the Hood

1. `initFederation('federation.manifest.json')` in the shell reads the manifest and each remote's `remoteEntry.json`
2. Shared dependencies (Angular, RxJS, ...) are resolved through an import map, so they are loaded only once
3. User clicks "Deck Builder" in the shell, and the router loads `/deck-builder`
4. `loadRemoteModule('deck-builder', './Routes')` imports the remote's exposed routes
5. Deck Builder's `AppComponent` is rendered in the shell's `<router-outlet>`

## Troubleshooting

### Error: "Cannot GET /remoteEntry.json" or the page area stays blank

**Solution**: Make sure the remote app is running on the port listed in `apps/shell/public/federation.manifest.json`.

### Navigation Not Working

**Solution**: Ensure routes are exported correctly. Each remote's `app.routes.ts` should:

```typescript
export const appRoutes: Route[] = [...];
export default appRoutes; // ← Important!
```

## Production Configuration

For production, point the shell's `federation.manifest.json` at the deployed remotes:

```json
{
  "home": "https://cdn.elementamon.com/home/remoteEntry.json",
  "deck-builder": "https://cdn.elementamon.com/deck-builder/remoteEntry.json"
}
```

## References

- [@angular-architects/native-federation](https://www.npmjs.com/package/@angular-architects/native-federation)
- [Native Federation with Angular](https://www.angulararchitects.io/blog/micro-frontends-with-modern-angular-part-1-standalone-and-esbuild/)
