# GitHub Copilot Instructions for ElementaMon

This file provides context and instructions to GitHub Copilot to better assist with ElementaMon development.

## Project Overview

ElementaMon is an Angular 20 game combining creature collection (Neopets/Pokemon) with deckbuilding roguelike mechanics (Slay the Spire). Built as an Nx monorepo with:

- **Game Frontend**: 7 Angular microfrontends
- **Game Backend**: 8 Node.js microservices
- **Backoffice**: Next.js 15 admin platform for employee operations

## Architecture Patterns

### Microfrontends (Angular 20)

All microfrontends follow this structure:

- Standalone components with signals
- NgRx for state management
- OnPush change detection
- Material UI + Tailwind CSS
- GraphQL (Apollo Client) for data fetching
- WebSockets (Socket.io) for real-time features
- Test-Driven Development (Jasmine/Jest)

**Location:** `apps/[microfrontend-name]/`

**Available Microfrontends:**

1. `home` - Landing page and authentication
2. `deck-builder` - Deck management
3. `battle` - Real-time combat
4. `world-map` - Dungeon navigation
5. `inventory` - Item and pet management
6. `avatar-customization` - Character customization
7. `game-over` - Results and rewards

### Microservices (Node.js/Express)

All microservices follow this structure:

- Express.js with TypeScript
- GraphQL API (Apollo Server)
- MongoDB/PostgreSQL for data
- Redis for caching
- Jest for testing
- Docker containers

**Location:** `services/[service-name]/`

**Available Microservices:**

1. `auth` - Authentication (PostgreSQL)
2. `cards` - Card data (MongoDB)
3. `fight` - Battle logic (MongoDB)
4. `world` - World generation (MongoDB)
5. `character` - Player data (MongoDB)
6. `economy` - Items/trading (MongoDB)
7. `skins` - Cosmetics (MongoDB)
8. `ai` - AI integrations (OpenAI, ElevenLabs)

### Backoffice Admin Platform (Next.js 15)

Internal admin tool for employees:

- Next.js 15 with App Router and React Server Components
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication (SSO with Google/Azure AD)
- tRPC for type-safe APIs
- shadcn/ui components + Tailwind CSS
- Zustand for client state
- TanStack Query for data fetching

**Location:** `backoffice/apps/admin/`

**Key Modules:**

1. Player Management - Account operations, inventory management
2. Support System - Ticket queue, SLA tracking
3. Content Moderation - AI-assisted review
4. Analytics Dashboard - Metrics, revenue, AI costs
5. Content CMS - Cards, pets, events, economy
6. System Monitoring - Service health, logs
7. Settings - Employee accounts, RBAC, configurations

**See**: [BACKOFFICE_SPEC.md](../BACKOFFICE_SPEC.md) for complete specification

### Marketing Site & Landing Page (Nuxt 3)

Public-facing website for player acquisition:

- Nuxt 3 with Vue 3 Composition API
- TypeScript for type safety
- SSR/SSG hybrid rendering
- Nuxt Content for Markdown-based CMS
- Tailwind CSS + Nuxt UI components
- Pinia for state management
- Cloudinary for image/video CDN
- SEO optimization (95+ Lighthouse score)

**Location:** `marketing-site/`

**Key Pages:**

1. Home - Hero landing with gameplay preview
2. Features - Interactive game mechanics showcase
3. Pokédex - Pet gallery with 3D viewer
4. Guides - Wiki and tutorials (Markdown)
5. Community - Social feeds, Discord, creators
6. Blog - News, patch notes, dev updates
7. Download - Multi-platform download page
8. Press Kit - Media assets and contacts

**See**: [MARKETING_SITE_SPEC.md](../MARKETING_SITE_SPEC.md) for complete specification

## Code Conventions

### TypeScript

```typescript
// Use interfaces for data structures
interface ElementaMon {
  id: string;
  name: string;
  elementalType: ElementalType;
  stats: PetStats;
  currentHP: number;
  maxHP: number;
  level: number;
  skills: Skill[];
}

// Use enums for fixed values
enum ElementalType {
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
  Earth = 'Earth',
  Ice = 'Ice',
  Poison = 'Poison',
  Psychic = 'Psychic',
  Ghost = 'Ghost',
  Fairy = 'Fairy',
}

// Use type for unions
type CardType = 'pet' | 'ability' | 'summoning';
```

### Angular Components

```typescript
import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pet-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-card.component.html',
  styleUrls: ['./pet-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetCardComponent {
  // Use signals for reactive state
  pet = signal<ElementaMon | null>(null);

  // Use computed for derived values
  isAlive = computed(() => {
    const p = this.pet();
    return p && p.currentHP > 0;
  });

  // Use effect for side effects
  constructor() {
    effect(() => {
      const p = this.pet();
      if (p) {
        console.log(`Pet ${p.name} HP: ${p.currentHP}/${p.maxHP}`);
      }
    });
  }
}
```

### NgRx State Management

```typescript
// State interface
export interface BattleState {
  playerPets: ElementaMon[];
  opponentPets: ElementaMon[];
  currentTurn: 'player' | 'opponent';
  turnTimer: number;
  playerHand: Card[];
  playerMana: ManaPool;
}

// Actions
export const battleActions = createActionGroup({
  source: 'Battle',
  events: {
    'Play Card': props<{ cardId: string; targetId?: string }>(),
    'End Turn': emptyProps(),
    'Swap Pet': props<{ fromIndex: number; toIndex: number }>(),
  },
});

// Selectors
export const selectBattleState = createFeatureSelector<BattleState>('battle');
export const selectPlayerPets = createSelector(selectBattleState, (state) => state.playerPets);
```

### Service Patterns (Angular)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CardsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCardsByElement(element: ElementalType): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/cards`, {
      params: { element },
    });
  }
}
```

### Next.js Server Components (Backoffice)

```typescript
// app/(dashboard)/players/page.tsx
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { PlayerTable } from '@/components/players/player-table';

export default async function PlayersPage() {
  // Server-side authentication and authorization
  await requirePermission(PERMISSIONS.PLAYERS.VIEW);

  // Fetch data directly in Server Component
  const players = await prisma.player.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      stats: true,
      tickets: {
        where: { status: 'OPEN' },
      },
    },
  });

  return (
    <div>
      <h1>Player Management</h1>
      <PlayerTable players={players} />
    </div>
  );
}
```

### Next.js API Routes with tRPC (Backoffice)

```typescript
// server/routers/tickets.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const ticketsRouter = router({
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        assignedToId: z.string().optional(),
        page: z.number().default(1),
        pageSize: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check permission
      if (!ctx.session.user.permissions.includes('tickets:view')) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          status: input.status,
          priority: input.priority,
          assignedToId: input.assignedToId,
        },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
        include: {
          assignedTo: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const total = await ctx.prisma.ticket.count({
        where: {
          status: input.status,
          priority: input.priority,
          assignedToId: input.assignedToId,
        },
      });

      return {
        tickets,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  assign: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        assignedToId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.permissions.includes('tickets:assign')) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const ticket = await ctx.prisma.ticket.update({
        where: { id: input.ticketId },
        data: { assignedToId: input.assignedToId },
        include: { assignedTo: true },
      });

      // Log action
      await ctx.prisma.auditLog.create({
        data: {
          employeeId: ctx.session.user.id,
          action: 'TICKET_ASSIGNED',
          resource: 'Ticket',
          resourceId: ticket.id,
          changes: { assignedToId: input.assignedToId },
        },
      });

      return ticket;
    }),
});
```

### Backoffice Client Component (Next.js)

```typescript
// components/tickets/ticket-queue.tsx
'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function TicketQueue() {
  const [status, setStatus] = useState<'OPEN' | 'PENDING'>('OPEN');
  const { toast } = useToast();

  // tRPC query with React Query
  const { data, isLoading, refetch } = trpc.tickets.getAll.useQuery({
    status,
    page: 1,
    pageSize: 50,
  });

  // tRPC mutation
  const assignMutation = trpc.tickets.assign.useMutation({
    onSuccess: () => {
      toast({ title: 'Ticket assigned successfully' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAssign = (ticketId: string, employeeId: string) => {
    assignMutation.mutate({ ticketId, assignedToId: employeeId });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          variant={status === 'OPEN' ? 'default' : 'outline'}
          onClick={() => setStatus('OPEN')}
        >
          Open ({data?.tickets.filter((t) => t.status === 'OPEN').length})
        </Button>
        <Button
          variant={status === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setStatus('PENDING')}
        >
          Pending
        </Button>
      </div>

      <div className="space-y-2">
        {data?.tickets.map((ticket) => (
          <div key={ticket.id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{ticket.subject}</h3>
                <p className="text-sm text-gray-600">
                  {ticket.playerUsername} • {ticket.ticketNumber}
                </p>
              </div>
              <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
            </div>
            <Button
              size="sm"
              onClick={() => handleAssign(ticket.id, 'current-user-id')}
              disabled={assignMutation.isLoading}
            >
              Assign to Me
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Testing Patterns (Angular)

```typescript
describe('BattleComponent', () => {
  let component: BattleComponent;
  let fixture: ComponentFixture<BattleComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleComponent],
      providers: [provideMockStore({ initialState: mockBattleState })],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('should display player pets', () => {
    fixture.detectChanges();
    const petElements = fixture.nativeElement.querySelectorAll('.player-pet');
    expect(petElements.length).toBe(3);
  });

  it('should dispatch action when card is played', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.playCard('card-123');
    expect(dispatchSpy).toHaveBeenCalledWith(battleActions.playCard({ cardId: 'card-123' }));
  });
});
```

### Nuxt/Vue Components (Marketing Site)

```vue
<!-- pages/index.vue - Home page with SEO -->
<script setup lang="ts">
// SEO optimization
useSeoMeta({
  title: 'ElementaMon - Collect, Build, Battle',
  description: 'Join the epic creature collection adventure',
  ogImage: 'https://elementamon.com/og-image.jpg',
  ogType: 'website',
});

// Analytics tracking
const { trackPageView } = useAnalytics();
onMounted(() => trackPageView('home'));

// Hero animation
const { y } = useWindowScroll();
const heroTransform = computed(() => `translateY(${y.value * 0.5}px)`);
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero from-fire to-water min-h-screen bg-gradient-to-br">
      <div :style="{ transform: heroTransform }">
        <h1 class="text-7xl font-bold text-white">Collect. Build. Battle.</h1>
        <p class="max-w-2xl text-2xl text-white/90">
          Strategic creature collection meets deckbuilding roguelike
        </p>
        <UButton size="xl" @click="navigateTo('/play')"> Play Free Now </UButton>
      </div>

      <!-- Video Preview -->
      <video autoplay loop muted playsinline class="rounded-2xl">
        <source src="/videos/gameplay.mp4" type="video/mp4" />
      </video>
    </section>

    <!-- Features Grid -->
    <FeaturesGrid />
    <PetShowcase />
    <NewsletterSignup />
  </div>
</template>
```

```vue
<!-- components/pets/PetCard.vue - Pet card component -->
<script setup lang="ts">
import type { Pet } from '@/types';

const props = defineProps<{
  pet: Pet;
}>();

const emit = defineEmits<{
  click: [pet: Pet];
}>();

// Element color mapping
const elementColors = {
  Fire: 'from-red-500 to-orange-500',
  Water: 'from-blue-500 to-cyan-500',
  Electric: 'from-yellow-400 to-amber-500',
  // ... more elements
};

const gradientClass = computed(
  () => elementColors[props.pet.elementalType] || 'from-gray-500 to-gray-600'
);
</script>

<template>
  <UCard class="cursor-pointer transition-transform hover:scale-105" @click="emit('click', pet)">
    <div :class="['rounded-t-lg bg-gradient-to-br p-4', gradientClass]">
      <NuxtImg
        :src="pet.sprite"
        :alt="pet.name"
        width="200"
        height="200"
        format="webp"
        loading="lazy"
      />
    </div>
    <template #header>
      <h3 class="text-xl font-bold">{{ pet.name }}</h3>
      <UBadge :color="pet.elementalType.toLowerCase()">
        {{ pet.elementalType }}
      </UBadge>
    </template>
    <p class="text-sm text-gray-600">{{ pet.description }}</p>
  </UCard>
</template>
```

```typescript
// composables/useAnalytics.ts - Analytics composable
export const useAnalytics = () => {
  const gtag = useGtag();

  const trackPageView = (pageName: string) => {
    gtag.pageview({
      page_title: pageName,
      page_location: window.location.href,
    });
  };

  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    gtag.event(eventName, params);
  };

  const trackDownload = (platform: string) => {
    gtag.event('download_game', {
      platform,
      download_type: 'direct',
    });
  };

  return {
    trackPageView,
    trackEvent,
    trackDownload,
  };
};
```

```typescript
// server/api/pets.ts - API endpoint
export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event);
  const element = query.element as string | undefined;

  // Fetch from database or cache
  const cached = await useStorage('redis').getItem(`pets:${element || 'all'}`);
  if (cached) {
    return cached;
  }

  // Fetch pets (simulate API call)
  const pets = await $fetch('https://api.elementamon.com/pets', {
    params: { element },
  });

  // Cache for 1 hour
  await useStorage('redis').setItem(`pets:${element || 'all'}`, pets, { ttl: 3600 });

  return pets;
});
```

## File Structure Conventions

### Microfrontend Structure

```
apps/[app-name]/
├── src/
│   ├── app/
│   │   ├── components/       # Presentation components
│   │   ├── containers/       # Smart components
│   │   ├── services/         # Business logic
│   │   ├── state/           # NgRx store
│   │   │   ├── actions/
│   │   │   ├── reducers/
│   │   │   ├── effects/
│   │   │   └── selectors/
│   │   ├── models/          # TypeScript interfaces
│   │   └── guards/          # Route guards
│   ├── assets/              # Static files
│   └── environments/        # Environment configs
├── project.json             # Nx configuration
└── tsconfig.json           # TypeScript config
```

### Microservice Structure

```
services/[service-name]/
├── src/
│   ├── controllers/         # API endpoints
│   ├── services/           # Business logic
│   ├── models/             # Database models
│   ├── middleware/         # Express middleware
│   ├── utils/              # Helper functions
│   ├── config/             # Configuration
│   └── graphql/            # GraphQL schema/resolvers
├── tests/                  # Test files
├── Dockerfile
└── package.json
```

## Common Tasks

### Creating a New Component

When asked to create a component:

1. Generate standalone component with signals
2. Add Material UI imports if needed
3. Use OnPush change detection
4. Add proper TypeScript types
5. Include unit tests
6. Add Storybook story if it's a shared component

### Creating a New Service

When asked to create a service:

1. Use `providedIn: 'root'` or module-scoped
2. Use `inject()` function for dependencies
3. Return Observables for async operations
4. Add error handling
5. Include unit tests with mocks

### Creating NgRx State

When asked to create state management:

1. Define state interface
2. Create actions with `createActionGroup()`
3. Create reducer with `createReducer()`
4. Create selectors with `createSelector()`
5. Create effects if needed (API calls, side effects)
6. Add unit tests for all pieces

### Creating API Endpoint

When asked to create an endpoint:

1. Create controller method
2. Add validation middleware
3. Create service layer for business logic
4. Add error handling
5. Create GraphQL resolver if needed
6. Add unit tests
7. Document with JSDoc/OpenAPI

## Game Mechanics Reference

### Elemental Type Chart

Damage multipliers (attacker → defender):

|              | Fire | Water | Elec | Earth | Ice  | Poison | Psy  | Ghost | Fairy |
| ------------ | ---- | ----- | ---- | ----- | ---- | ------ | ---- | ----- | ----- |
| **Fire**     | 100% | 50%   | 100% | 150%  | 150% | 100%   | 100% | 100%  | 100%  |
| **Water**    | 150% | 100%  | 50%  | 150%  | 100% | 100%   | 100% | 100%  | 100%  |
| **Electric** | 100% | 150%  | 100% | 50%   | 100% | 100%   | 100% | 100%  | 100%  |
| **Earth**    | 50%  | 100%  | 150% | 100%  | 150% | 50%    | 100% | 100%  | 100%  |
| **Ice**      | 50%  | 100%  | 100% | 150%  | 100% | 100%   | 100% | 100%  | 150%  |
| **Poison**   | 100% | 100%  | 100% | 150%  | 100% | 50%    | 100% | 50%   | 150%  |
| **Psychic**  | 100% | 100%  | 100% | 100%  | 100% | 150%   | 50%  | 50%   | 100%  |
| **Ghost**    | 100% | 100%  | 100% | 100%  | 100% | 100%   | 150% | 150%  | 100%  |
| **Fairy**    | 100% | 100%  | 100% | 100%  | 50%  | 50%    | 100% | 150%  | 100%  |

### Mana System

Three mana types:

- **Close-Combat** (Red) - Physical attacks
- **Illusion** (Blue) - Special effects, buffs/debuffs
- **Talent** (Green) - Pet abilities, evolution

Cards cost 1-3 mana of specific types. Mana regenerates each turn based on active pets.

### Card Types

- **Pet Cards**: Summon pets to battle (max 3 in deck)
- **Ability Cards**: Attack, defend, buff (max 14-15 in deck)
- **Summoning Cards**: Special effects (max 1 in deck)

### Battle Rules

- 3 pets per team (1 active, 2 bench)
- 5 cards max in hand
- 60-second turn timer
- Win by defeating all opponent pets

## AI Integration

When implementing AI features:

### NPC Dialogue

```typescript
// Use GPT-4 with caching
const dialogue = await npcService.generateDialogue({
  npcId: 'quest-giver-1',
  context: {
    playerName: 'Ash',
    playerLevel: 5,
    location: 'Starter Town',
  },
});
```

### Image Generation

```typescript
// Use DALL-E 3 with S3 upload
const sprite = await imageService.generatePetSprite(
  'A small fire lizard',
  ElementalType.Fire,
  'base'
);
```

### Voice Synthesis

```typescript
// Use ElevenLabs for premium, Azure for cost-effective
const voice = await voiceService.synthesize(dialogue.text, character.voiceId);
```

Always include:

- Cost tracking
- Redis caching
- Rate limiting
- Error handling

## Naming Conventions

- **Components**: PascalCase + Component suffix (e.g., `BattleArenaComponent`)
- **Services**: PascalCase + Service suffix (e.g., `CardsService`)
- **Interfaces**: PascalCase (e.g., `ElementaMon`, `Card`)
- **Enums**: PascalCase (e.g., `ElementalType`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_HAND_SIZE`)
- **Variables/Functions**: camelCase (e.g., `calculateDamage`)
- **Files**: kebab-case (e.g., `battle-arena.component.ts`)

## Import Order

```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';

// 2. Angular modules
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// 3. Third-party libraries
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

// 4. Project shared libraries
import { ElementaMon, Card } from '@elementamon/shared/models';

// 5. Local imports
import { BattleService } from './services/battle.service';
import { battleActions } from './state/actions';
```

## Documentation Requirements

Always include:

- JSDoc comments for public methods
- README.md for new modules/services
- OpenAPI/GraphQL schema documentation
- Storybook stories for shared components
- Unit test descriptions

## Performance Best Practices

1. **Use OnPush change detection** for all components
2. **Lazy load routes** for microfrontends
3. **Memoize selectors** with `createSelector()`
4. **Use trackBy** for \*ngFor loops
5. **Optimize images** (WebP format, lazy loading)
6. **Cache API responses** with Redis
7. **Use Web Workers** for heavy computations
8. **Implement virtual scrolling** for long lists

## Security Best Practices

1. **Sanitize user inputs** before AI processing
2. **Use Content Security Policy** (CSP)
3. **Implement rate limiting** on all endpoints
4. **Store secrets** in Azure Key Vault
5. **Validate JWT tokens** on every request
6. **Use HTTPS** everywhere
7. **Implement CORS** properly
8. **Moderate user-generated content**

## Monetization & Gacha System

When implementing monetization features:

### Gacha Implementation

```typescript
// Use signals for reactive gacha state
import { Component, signal, computed } from '@angular/core';
import { GachaService } from './services/gacha.service';

@Component({
  selector: 'app-gacha-portal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GachaPortalComponent {
  private gachaService = inject(GachaService);

  // Signals for reactive state
  selectedPool = signal<GachaPool>(GachaPool.STANDARD);
  gems = signal<number>(0);
  pityCounter = signal<number>(0);

  // Computed values
  canPull = computed(() => this.gems() >= this.getCost());
  pityProgress = computed(() => (this.pityCounter() / 100) * 100);

  async performPull(count: 1 | 10) {
    const results = await this.gachaService.pull(this.selectedPool(), count);
    this.updatePityCounter(results);
    this.playAnimation(results);
  }
}
```

### Payment Processing

```typescript
// Payment orchestrator pattern
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private providers = {
    stripe: inject(StripeService),
    paypal: inject(PayPalService),
    pix: inject(PixService),
    crypto: inject(CryptoService),
  };

  async processPurchase(bundle: GemBundle, method: PaymentMethod) {
    const provider = this.providers[method];
    const transaction = await provider.createTransaction(bundle);

    // Track in analytics
    this.analytics.trackPurchaseIntent(bundle, method);

    return transaction;
  }
}
```

### Coupon Validation

```typescript
// Coupon service with validation
@Injectable({ providedIn: 'root' })
export class CouponService {
  async validateCoupon(code: string, playerId: string): Promise<CouponValidation> {
    // Check code exists
    const coupon = await this.db.coupons.findOne({ code });
    if (!coupon) throw new Error('Invalid coupon code');

    // Check expiration
    if (coupon.expiresAt < new Date()) {
      throw new Error('Coupon has expired');
    }

    // Check usage limit
    const usageCount = await this.db.couponUsage.count({
      couponId: coupon.id,
    });
    if (usageCount >= coupon.maxUses) {
      throw new Error('Coupon usage limit reached');
    }

    // Check player eligibility
    const player = await this.db.players.findOne({ id: playerId });
    if (coupon.minLevel && player.level < coupon.minLevel) {
      throw new Error(`Minimum level ${coupon.minLevel} required`);
    }

    return { valid: true, reward: coupon.reward };
  }
}
```

### Ad Integration

```typescript
// AdMob rewarded video service
@Injectable({ providedIn: 'root' })
export class AdService {
  private readonly MAX_DAILY_ADS = 5;
  private readonly GEMS_PER_AD = 10;

  async showRewardedAd(): Promise<AdReward> {
    // Check daily limit
    const watchedToday = await this.getWatchedToday();
    if (watchedToday >= this.MAX_DAILY_ADS) {
      throw new Error('Daily ad limit reached');
    }

    // Show ad
    const completed = await this.admob.showRewardedVideo();

    if (completed) {
      // Grant reward
      await this.currencyService.addGems(this.GEMS_PER_AD, 'ad_reward');

      // Track analytics
      this.analytics.trackAdCompletion('rewarded_video', this.GEMS_PER_AD);

      return { gems: this.GEMS_PER_AD };
    }

    throw new Error('Ad not completed');
  }
}
```

Always include:

- **Transaction logging** - Audit all purchases and currency changes
- **Fraud prevention** - Validate all server-side
- **Analytics tracking** - Track conversion funnels
- **Error handling** - User-friendly payment errors
- **Compliance** - Follow regional regulations (drop rates, age restrictions)

## References

- Full documentation: `README.md`
- **Best practices**: `BEST_PRACTICES.md` - Production-ready technologies & methodologies (33+ categories)
- Battle UI spec: `BATTLE_UI_SPEC.md`
- AI integration: `AI_INTEGRATION.md`
- Monetization & Gacha: `MONETIZATION_GACHA_SPEC.md`
- Backoffice spec: `BACKOFFICE_SPEC.md`
- Marketing site: `MARKETING_SITE_SPEC.md`
- Architecture: `README.md` (Architecture section)

## When In Doubt

1. Check existing similar implementations in the codebase
2. Follow Angular style guide: https://angular.io/guide/styleguide
3. Follow Nx best practices: https://nx.dev/concepts
4. Maintain consistency with existing patterns
5. Ask for clarification if requirements are unclear
