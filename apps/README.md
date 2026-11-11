# 📱 Apps - Angular Microfrontend Applications

This directory contains all Angular microfrontend applications using Module Federation.

## 🏗️ Architecture

All apps are:

- **Standalone components** (no NgModules)
- **OnPush change detection** for performance
- **Lazy loaded** routes
- **Module Federation** enabled for micro frontend architecture

## 📦 Applications

### 🏠 Shell (Host Application)

**Directory**: `shell/`
**Port**: 4200
**Purpose**: Main application shell that loads all microfrontends
**Routes**:

- `/` - Redirects to home
- `/home` - Loads home microfrontend
- `/deck-builder` - Loads deck builder
- `/battle` - Loads battle arena
- etc.

### 🎮 Microfrontends (Remote Applications)

#### 1. **Home** - Landing & Authentication

**Directory**: `home/`
**Port**: 4201
**Features**:

- User authentication (login/register)
- Starter pet selection
- Tutorial introduction
- News and updates

#### 2. **Deck Builder** - Deck Management

**Directory**: `deck-builder/`
**Port**: 4202
**Features**:

- Deck creation and editing
- Card filtering and search
- Deck validation
- Deck presets and templates
- Import/export deck codes

#### 3. **Battle** - Combat Arena

**Directory**: `battle/`
**Port**: 4203
**Features**:

- Turn-based battle system
- Real-time multiplayer (Socket.io)
- Battle animations
- Damage calculations
- Victory/defeat screens

#### 4. **World Map** - Dungeon Exploration

**Directory**: `world-map/`
**Port**: 4204
**Features**:

- Procedural dungeon generation
- Node-based navigation
- Random events
- Boss encounters
- Treasure rooms

#### 5. **Inventory** - Item & Pet Management

**Directory**: `inventory/`
**Port**: 4205
**Features**:

- Pet collection display
- Item inventory
- Pet evolution
- Trading system
- Filters and sorting

#### 6. **Avatar Customization** - Character Appearance

**Directory**: `avatar-customization/`
**Port**: 4206
**Features**:

- Avatar appearance editor
- Cosmetic items
- Skin previews
- Unlock requirements

#### 7. **Game Over** - Results & Rewards

**Directory**: `game-over/`
**Port**: 4207
**Features**:

- Victory/defeat summary
- Rewards distribution
- Statistics display
- Continue/retry options

## 🚀 Development Commands

```powershell
# Generate new microfrontend
npx nx g @nx/angular:app <app-name> --standalone --routing --style=scss

# Serve specific app
npx nx serve <app-name>

# Serve shell (loads all microfrontends)
npx nx serve shell

# Build specific app
npx nx build <app-name> --configuration=production

# Test specific app
npx nx test <app-name>

# Lint specific app
npx nx lint <app-name>
```

## 📐 Project Structure (Example)

```
app-name/
├── src/
│   ├── app/
│   │   ├── components/        # Presentation components
│   │   ├── containers/        # Smart components
│   │   ├── services/          # Business logic
│   │   ├── guards/            # Route guards
│   │   ├── interceptors/      # HTTP interceptors
│   │   ├── app.component.ts   # Root component
│   │   ├── app.config.ts      # App configuration
│   │   └── app.routes.ts      # Route definitions
│   ├── assets/                # Static files
│   ├── environments/          # Environment configs
│   ├── main.ts                # Bootstrap
│   └── styles.scss            # Global styles
├── project.json               # Nx configuration
├── tsconfig.app.json          # TypeScript config
├── tsconfig.spec.json         # Test TypeScript config
└── jest.config.ts             # Jest configuration
```

## 🔗 Module Federation

Each microfrontend is exposed via Module Federation:

```typescript
// federation.config.js (Native Federation, see MODULE_FEDERATION.md)
module.exports = withNativeFederation({
  name: 'home',
  exposes: {
    './Routes': './apps/home/src/app/app.routes.ts',
  },
});
```

Shell app imports remote modules dynamically:

```typescript
// shell/src/app/app.routes.ts
{
  path: 'home',
  loadChildren: () => loadRemoteModule('home', './Module'),
}
```

## 📊 State Management

Each microfrontend can have its own NgRx store:

```
app-name/src/app/
└── +state/
    ├── app-name.actions.ts
    ├── app-name.reducer.ts
    ├── app-name.effects.ts
    ├── app-name.selectors.ts
    └── app-name.facade.ts
```

## 🎯 Best Practices

1. **Keep apps small and focused** - Single responsibility
2. **Use shared libraries** for common code
3. **Lazy load everything** possible
4. **OnPush change detection** for all components
5. **Standalone components** only (no NgModules)
6. **Signals** for reactive state
7. **Inject() function** for dependency injection
8. **TypeScript strict mode** always enabled

## 🧪 Testing

Each app should have:

- **Unit tests** (Jest) - 80%+ coverage
- **Component tests** (Testing Library)
- **E2E tests** (Playwright)

## 📚 Documentation

See individual app README files for specific documentation.
