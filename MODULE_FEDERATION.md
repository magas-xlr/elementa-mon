# 🚀 Module Federation - Quick Start Guide

## Overview

Module Federation has been configured for all ElementaMon microfrontends. The shell app acts as the host, and can dynamically load 7 remote microfrontends at runtime.

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

Each app has a `module-federation.config.ts`:

### Shell (Host)

```typescript
const config = {
  name: 'shell',
  remotes: [
    ['home', 'http://localhost:4201'],
    ['deck-builder', 'http://localhost:4202'],
    // ... 5 more remotes
  ],
};
```

### Remotes (e.g., Home)

```typescript
const config = {
  name: 'home',
  exposes: {
    './Routes': 'apps/home/src/app/app.routes.ts',
  },
};
```

## How to Test

### Option 1: Start Shell Only (Development)

```powershell
# Start shell (it will show errors when remotes are not available)
npx nx serve shell
```

Navigate to http://localhost:4200 - you'll see the shell UI with navigation.

### Option 2: Start Shell + One Remote

```powershell
# Terminal 1: Start shell
npx nx serve shell

# Terminal 2: Start home remote
npx nx serve home --port 4201
```

Now navigate to http://localhost:4200/home - the home microfrontend will load!

### Option 3: Start All Apps (Full Testing)

**PowerShell** (run each in a separate terminal):

```powershell
# Terminal 1
npx nx serve shell

# Terminal 2
npx nx serve home --port 4201

# Terminal 3
npx nx serve deck-builder --port 4202

# Terminal 4
npx nx serve battle --port 4203

# Terminal 5
npx nx serve world-map --port 4204

# Terminal 6
npx nx serve inventory --port 4205

# Terminal 7
npx nx serve avatar-customization --port 4206

# Terminal 8
npx nx serve game-over --port 4207
```

### Option 4: Use Nx Run Many (Parallel - Requires More RAM)

```powershell
# Start all apps in parallel (8 dev servers)
npx nx run-many -t serve -p shell,home,deck-builder,battle,world-map,inventory,avatar-customization,game-over --parallel=8
```

## Navigation

The shell app provides a navigation header with the following routes:

- 🏠 **Home** → `/home`
- 🎴 **Deck Builder** → `/deck-builder`
- ⚔️ **Battle** → `/battle`
- 🗺️ **World Map** → `/world-map`
- 🎒 **Inventory** → `/inventory`
- 👤 **Avatar** → `/avatar-customization`

## What Happens Under the Hood

1. User clicks "Deck Builder" in shell
2. Shell's router loads the route `/deck-builder`
3. `loadRemoteModule()` fetches `http://localhost:4202/remoteEntry.js`
4. The remote module's routes are loaded dynamically
5. Deck Builder's `AppComponent` is rendered in shell's `<router-outlet>`

## Benefits

✅ **Independent Development** - Each team can work on their microfrontend independently
✅ **Independent Deployment** - Deploy one microfrontend without rebuilding others
✅ **Lazy Loading** - Remotes are only loaded when needed
✅ **Shared Dependencies** - Angular core libraries are shared to reduce bundle size
✅ **Version Control** - Each microfrontend can have its own release cycle

## Troubleshooting

### Error: "Cannot GET /remoteEntry.js"

**Solution**: Make sure the remote app is running on the correct port.

```powershell
# Check if home is running on 4201
# If not, start it:
npx nx serve home --port 4201
```

### Error: "Uncaught (in promise) ChunkLoadError"

**Solution**: The remote app stopped or is on a different port.

1. Check `apps/shell/module-federation.config.ts` for correct URLs
2. Verify all remote apps are running
3. Check browser console for the failing URL

### Navigation Not Working

**Solution**: Ensure routes are exported correctly.

Each remote's `app.routes.ts` should:

```typescript
export const appRoutes: Route[] = [...];
export default appRoutes; // ← Important!
```

## Next Steps

1. ✅ Module Federation configured
2. ⏳ Add shared state management (NgRx)
3. ⏳ Implement authentication across microfrontends
4. ⏳ Add shared component library
5. ⏳ Set up production builds with CDN URLs

## Production Configuration

For production, update `module-federation.config.ts` with CDN URLs:

```typescript
const config = {
  name: 'shell',
  remotes: [
    ['home', 'https://cdn.elementamon.com/home/remoteEntry.js'],
    ['deck-builder', 'https://cdn.elementamon.com/deck-builder/remoteEntry.js'],
    // ... more remotes
  ],
};
```

## References

- [@angular-architects/module-federation](https://www.npmjs.com/package/@angular-architects/module-federation)
- [Nx Module Federation](https://nx.dev/recipes/module-federation)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
