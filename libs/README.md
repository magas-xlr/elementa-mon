# 📚 Libs - Shared Libraries

This directory contains all shared libraries used across the monorepo.

## 🏗️ Architecture Principles

- **Domain-driven design** - Organized by domain (shared, game)
- **Reusability** - Code used by 2+ apps
- **Type safety** - Strong TypeScript types
- **Tree-shakeable** - Only import what you need
- **Testable** - High test coverage (80%+)

## 📁 Directory Structure

```
libs/
├── shared/              # Cross-cutting concerns
│   ├── models/          # TypeScript interfaces & types
│   ├── ui-components/   # Reusable UI components
│   ├── data-access/     # API clients & services
│   ├── utils/           # Utility functions
│   ├── types/           # Global TypeScript types
│   └── constants/       # Application constants
└── game/                # Game-specific libraries
    ├── state/           # NgRx store (root state)
    ├── battle/          # Battle system logic
    ├── pets/            # Pet management
    ├── cards/           # Card system
    ├── inventory/       # Inventory management
    ├── progression/     # Leveling & XP
    └── world/           # World generation
```

---

## 🌐 Shared Libraries

### 📦 `shared/models`

**Purpose**: TypeScript interfaces and data models

**Path**: `@elementamon/shared/models`

**Contents**:

```typescript
// User models
export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
}

// Pet models
export interface Pet {
  id: string;
  name: string;
  elementalType: ElementalType;
  stats: PetStats;
}

// Card models
export interface Card {
  id: string;
  name: string;
  type: CardType;
  manaCost: ManaCost;
}
```

**Usage**:

```typescript
import { Pet, Card } from '@elementamon/shared/models';
```

---

### 🎨 `shared/ui-components`

**Purpose**: Reusable Angular UI components

**Path**: `@elementamon/shared/ui-components`

**Components**:

- `Button` - Themed buttons
- `Card` - Card display component
- `Modal` - Dialog/modal component
- `Toast` - Notification component
- `Loader` - Loading spinner
- `Avatar` - User avatar
- `Badge` - Status badges
- `Input` - Form inputs
- `Select` - Dropdown select
- `Tabs` - Tab navigation

**Structure**:

```
ui-components/
├── src/
│   ├── lib/
│   │   ├── button/
│   │   │   ├── button.component.ts
│   │   │   ├── button.component.html
│   │   │   ├── button.component.scss
│   │   │   ├── button.component.spec.ts
│   │   │   └── button.stories.ts        # Storybook
│   │   ├── card/
│   │   └── ...
│   └── index.ts                          # Public API
```

**Usage**:

```typescript
import { ButtonComponent, CardComponent } from '@elementamon/shared/ui-components';

@Component({
  standalone: true,
  imports: [ButtonComponent, CardComponent],
})
export class MyComponent {}
```

---

### 🔌 `shared/data-access`

**Purpose**: API clients, HTTP services, GraphQL queries

**Path**: `@elementamon/shared/data-access`

**Services**:

- `ApiClient` - Base HTTP client
- `GraphQLClient` - Apollo Client wrapper
- `WebSocketClient` - Socket.io wrapper
- `AuthService` - Authentication
- `CacheService` - Local caching

**Structure**:

```
data-access/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── api-client.service.ts
│   │   │   └── api-interceptor.ts
│   │   ├── graphql/
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   └── fragments/
│   │   └── websocket/
│   │       └── websocket-client.service.ts
│   └── index.ts
```

**Usage**:

```typescript
import { ApiClient, GraphQLClient } from '@elementamon/shared/data-access';

const apiClient = inject(ApiClient);
const data = await apiClient.get('/api/pets');
```

---

### 🛠️ `shared/utils`

**Purpose**: Utility functions and helpers

**Path**: `@elementamon/shared/utils`

**Utilities**:

- `formatDate()` - Date formatting
- `calculateDamage()` - Damage calculation
- `generateId()` - UUID generation
- `debounce()` - Debounce function
- `throttle()` - Throttle function
- `deepClone()` - Deep object cloning
- `isValidEmail()` - Email validation
- `sanitizeInput()` - Input sanitization

**Usage**:

```typescript
import { formatDate, calculateDamage } from '@elementamon/shared/utils';

const formattedDate = formatDate(new Date(), 'yyyy-MM-dd');
const damage = calculateDamage(attacker, defender);
```

---

### 📝 `shared/types`

**Purpose**: Global TypeScript types and enums

**Path**: `@elementamon/shared/types`

**Types**:

```typescript
// Enums
export enum ElementalType {
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
  // ...
}

export enum CardType {
  Pet = 'pet',
  Ability = 'ability',
  Summoning = 'summoning',
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ReadOnly<T> = { readonly [K in keyof T]: T[K] };
```

---

### 🔢 `shared/constants`

**Purpose**: Application-wide constants

**Path**: `@elementamon/shared/constants`

**Constants**:

```typescript
// Game constants
export const MAX_HAND_SIZE = 5;
export const MAX_PETS_IN_DECK = 3;
export const MAX_ABILITIES_IN_DECK = 15;
export const TURN_TIMER_SECONDS = 60;

// Elemental type chart
export const TYPE_EFFECTIVENESS = {
  Fire: { Water: 0.5, Earth: 1.5, Fire: 1.0 },
  // ...
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PETS: '/api/pets',
  BATTLE: '/api/battle',
};
```

---

## 🎮 Game Libraries

### 🎯 `game/state`

**Purpose**: Root NgRx store and global state

**Path**: `@elementamon/game/state`

**Structure**:

```typescript
// Root state
export interface GameState {
  player: PlayerState;
  battle: BattleState;
  inventory: InventoryState;
  world: WorldState;
}

// Actions, reducers, selectors, effects
```

---

### ⚔️ `game/battle`

**Purpose**: Battle system logic and calculations

**Path**: `@elementamon/game/battle`

**Features**:

- Damage calculation
- Type effectiveness
- Status effects
- Turn management
- Victory conditions

---

### 🐉 `game/pets`

**Purpose**: Pet management and evolution

**Path**: `@elementamon/game/pets`

**Features**:

- Pet CRUD operations
- Evolution logic
- Stat calculations
- Sprite management

---

### 🎴 `game/cards`

**Purpose**: Card system and effects

**Path**: `@elementamon/game/cards`

**Features**:

- Card effects engine
- Card validation
- Mana cost calculation
- Card filtering

---

### 🎒 `game/inventory`

**Purpose**: Inventory management

**Path**: `@elementamon/game/inventory`

**Features**:

- Item management
- Pet storage
- Sorting and filtering
- Trading logic

---

### 📈 `game/progression`

**Purpose**: Player progression (leveling, XP, achievements)

**Path**: `@elementamon/game/progression`

**Features**:

- XP calculation
- Level up logic
- Achievement tracking
- Skill tree

---

### 🗺️ `game/world`

**Purpose**: World generation and navigation

**Path**: `@elementamon/game/world`

**Features**:

- Procedural generation
- Dungeon layout
- Random events
- Boss spawning

---

## 🚀 Creating a New Library

```powershell
# Generate a new library
npx nx g @nx/angular:lib my-lib --directory=libs/shared/my-lib --standalone

# Generate a buildable library (can be published)
npx nx g @nx/angular:lib my-lib --directory=libs/shared/my-lib --buildable --standalone

# Generate a publishable library (NPM package)
npx nx g @nx/angular:lib my-lib --directory=libs/shared/my-lib --publishable --importPath=@elementamon/my-lib
```

## 🧪 Testing Libraries

```powershell
# Test specific library
npx nx test shared-models

# Test all libraries
npx nx run-many --target=test --projects=tag:type:lib

# Test with coverage
npx nx test shared-models --coverage
```

## 📦 Building Libraries

```powershell
# Build specific library
npx nx build shared-models

# Build all libraries
npx nx run-many --target=build --projects=tag:type:lib
```

## 🎯 Best Practices

1. **Keep libraries focused** - Single responsibility
2. **Export via barrel files** (index.ts)
3. **Document public APIs** with JSDoc
4. **Test thoroughly** (80%+ coverage)
5. **Version libraries** for breaking changes
6. **Tree-shakeable exports** - Named exports only
7. **Avoid circular dependencies**
8. **Use path mappings** from tsconfig.base.json

## 📊 Dependency Rules

Libraries can depend on:

- ✅ Other libraries in the same domain
- ✅ Shared libraries
- ❌ Application code (apps/\*)
- ❌ Services (services/\*)

```typescript
// ✅ Good
import { Pet } from '@elementamon/shared/models';
import { BattleService } from '@elementamon/game/battle';

// ❌ Bad
import { HomeComponent } from '@elementamon/home'; // Don't import from apps
```

## 📚 Documentation

Each library should have:

- README.md - Library overview
- API documentation (TSDoc)
- Usage examples
- Migration guides (for breaking changes)
