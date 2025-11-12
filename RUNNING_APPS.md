# 🚀 Running Applications - ElementaMon

## Currently Running Services

All microfrontend applications are now running successfully!

### Shell Application (Host)

- **URL**: http://localhost:4200/
- **Purpose**: Main host application with Module Federation
- **Status**: ✅ Running

### Remote Applications

| App Name             | Port | URL                    | Status     |
| -------------------- | ---- | ---------------------- | ---------- |
| Home                 | 4201 | http://localhost:4201/ | ✅ Running |
| Deck Builder         | 4202 | http://localhost:4202/ | ✅ Running |
| Battle               | 4203 | http://localhost:4203/ | ✅ Running |
| World Map            | 4204 | http://localhost:4204/ | ✅ Running |
| Inventory            | 4205 | http://localhost:4205/ | ✅ Running |
| Avatar Customization | 4206 | http://localhost:4206/ | ✅ Running |
| Game Over            | 4207 | http://localhost:4207/ | ✅ Running |

## Testing Module Federation

1. **Open Shell App**: Navigate to http://localhost:4200/
2. **Click Navigation Links**: Test each route in the header navigation
3. **Verify Remote Loading**: Each route should dynamically load its remote app

### Available Routes

- `/home` - Home page with UI component showcase
- `/deck-builder` - Deck building interface
- `/battle` - Battle arena
- `/world-map` - World exploration map
- `/inventory` - Inventory management with UI components
- `/avatar-customization` - Character customization
- `/game-over` - Game over results screen

## Module Federation Architecture

```
Shell (localhost:4200)
  ├── loads Home Remote (localhost:4201)
  ├── loads Deck Builder Remote (localhost:4202)
  ├── loads Battle Remote (localhost:4203)
  ├── loads World Map Remote (localhost:4204)
  ├── loads Inventory Remote (localhost:4205)
  ├── loads Avatar Customization Remote (localhost:4206)
  └── loads Game Over Remote (localhost:4207)
```

Each remote application:

- Exposes its routes via Module Federation
- Can be developed and deployed independently
- Shares common dependencies with the shell
- Uses the shared UI component library (`@elementamon/shared-ui-components`)

## UI Components Library

**Package**: `@elementamon/shared-ui-components`
**Location**: `libs/shared/ui-components/`
**Build Output**: `dist/libs/shared/ui-components/`

### Available Components

1. **ButtonComponent** (`<elem-button>`)
   - 6 variants: primary, secondary, success, danger, warning, ghost
   - 3 sizes: sm, md, lg
   - Features: icons, loading states, full width

2. **CardComponent** (`<lib-card>`)
   - 4 variants: default, elevated, outlined, glass
   - Content projection slots: header, body, footer

3. **ModalComponent** (`<lib-modal>`)
   - 5 sizes: sm, md, lg, xl, full
   - Features: backdrop control, close button, ESC key support

4. **InputComponent** (`<lib-input>`)
   - 7 types: text, email, password, number, tel, url, search
   - 3 sizes: sm, md, lg
   - Features: validation, icons, helper text

### Importing Components

```typescript
import {
  ButtonComponent,
  CardComponent,
  ModalComponent,
  InputComponent,
} from '@elementamon/shared-ui-components';

@Component({
  imports: [ButtonComponent, CardComponent, ModalComponent, InputComponent],
  // ...
})
export class YourComponent {}
```

## Resolved Issues

### ✅ Module Resolution Fixed

**Problem**: TypeScript couldn't find `@elementamon/shared-ui-components` module.

**Root Causes**:

1. Package name in `libs/shared/ui-components/package.json` was `ui-components` instead of `@elementamon/shared-ui-components`
2. Path mapping in `tsconfig.base.json` pointed to source (`src/`) instead of build output (`dist/`)

**Solutions Applied**:

1. Updated package name to `@elementamon/shared-ui-components`
2. Rebuilt library with `npx nx build ui-components --skip-nx-cache`
3. Changed tsconfig path mapping from:
   ```json
   "@elementamon/shared-ui-components": ["libs/shared/ui-components/src/index.ts"]
   ```
   to:
   ```json
   "@elementamon/shared-ui-components": ["dist/libs/shared/ui-components"]
   ```
4. Added implicit dependency in `apps/home/project.json`

### ✅ All Remote Apps Started

All 7 remote applications are now running and accessible via Module Federation.

## Development Workflow

### Starting All Apps

```powershell
# Terminal 1 - Shell (Host)
npx nx serve shell

# Terminal 2 - Home Remote
npx nx serve home --port 4201

# Terminal 3 - Deck Builder Remote
npx nx serve deck-builder --port 4202

# Terminal 4 - Battle Remote
npx nx serve battle --port 4203

# Terminal 5 - World Map Remote
npx nx serve world-map --port 4204

# Terminal 6 - Inventory Remote
npx nx serve inventory --port 4205

# Terminal 7 - Avatar Customization Remote
npx nx serve avatar-customization --port 4206

# Terminal 8 - Game Over Remote
npx nx serve game-over --port 4207
```

### Building UI Components

```powershell
# Build the shared UI components library
npx nx build ui-components

# Build without cache (if changes don't reflect)
npx nx build ui-components --skip-nx-cache
```

### Rebuilding After Changes

If you make changes to the UI components library:

1. **Rebuild the library**:

   ```powershell
   npx nx build ui-components
   ```

2. **Restart affected apps** (they will pick up the new build automatically in watch mode)

## Next Steps

1. **Add More UI Components**: Continue building the shared component library
2. **Implement NgRx State Management**: Set up global state for battle, inventory, pets
3. **Connect to Microservices**: Integrate with backend APIs
4. **Add Routing Guards**: Implement authentication and authorization
5. **Optimize Bundle Sizes**: Configure shared dependencies in Module Federation
6. **Add E2E Tests**: Test Module Federation integration end-to-end

## Troubleshooting

### Remote App Won't Load

1. Check if the remote app is running on the correct port
2. Verify `remoteEntry.js` is accessible (e.g., http://localhost:4201/remoteEntry.js)
3. Check browser console for Module Federation errors
4. Ensure `module-federation.config.ts` has correct port configuration

### Component Import Errors

1. Rebuild the UI components library: `npx nx build ui-components`
2. Clear Nx cache: `npx nx reset`
3. Verify path mapping in `tsconfig.base.json`
4. Check that package name in `libs/shared/ui-components/package.json` is `@elementamon/shared-ui-components`

### Port Already in Use

```powershell
# Find process using port (e.g., 4201)
netstat -ano | findstr :4201

# Kill process by PID
taskkill /PID <PID> /F
```

## Resources

- [Module Federation Guide](MODULE_FEDERATION.md)
- [Angular Module Federation](https://www.angulararchitects.io/en/blog/the-microfrontend-revolution-part-2-module-federation-with-angular/)
- [Nx Documentation](https://nx.dev/)
