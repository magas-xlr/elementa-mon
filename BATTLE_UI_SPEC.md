# 🎯 Battle Screen UI Design Specification

**ElementaMon - Battle Screen Feature Brief (v1 Mockup)**

## Objective

Implement the core 1v1 battle screen UI as the primary interface for the game's core loop, featuring real-time combat with WebSocket synchronization, NgRx state management, and Material UI components.

---

## 1. Header & Status Bar

Top-level information about players and match status.

### Player Info Block (Top-Left)

**User Story:** _As a player, I need to see my status so I can track my performance._

**Components:**

- Player Name (e.g., "FULANO")
- Active Pet Name (e.g., "Pet 1")
- Active Pet Level (e.g., "Lvl. 1")
- Pet Stats: "A: 300" (Attack), "D: 300" (Defense)
- HP Bar (Material UI LinearProgress)
  - Dynamically updates via NgRx
  - Color-coded: Green (>70%), Yellow (30-70%), Red (<30%)
  - Shows numerical value: "250/300 HP"

```typescript
interface PlayerStatus {
  playerName: string;
  activePet: {
    name: string;
    level: number;
    currentHp: number;
    maxHp: number;
    attack: number;
    defense: number;
    sprite: string;
  };
}
```

### Opponent Info Block (Top-Right)

**User Story:** _As a player, I need to see my opponent's status so I can make strategic decisions._

- Mirrors Player Info Block structure
- Real-time updates via WebSocket
- Read-only display

### Match Timer (Top-Center)

**User Story:** _As a player, I need to see the round timer so I know how much time is left._

**Components:**

- Circular timer UI
- Displays MM:SS format (e.g., "00:45")
- Color transitions as time depletes

**Game Logic:**

- **Turn-based with 60-second timer**
- On timeout (00:00): Automatically ends turn, passes to opponent
- WebSocket synchronized across clients

```typescript
interface BattleTimer {
  timeRemaining: number; // Seconds
  turnDuration: number; // 60 seconds
  isTimerActive: boolean;
}
```

### Deck Indicator (Top-Left)

**User Story:** _As a player, I need to know how many cards are left in my deck._

- Card stack icon
- Numerical value (e.g., "5 cards remaining")
- Updates on card draw

### Settings Menu (Top-Right)

**User Story:** _As a player, I need to access the menu to pause or change settings._

- Gear icon (Material Icon)
- Opens pause menu overlay (Material Dialog)
- Options: Resume, Sound Settings, Forfeit Match, Return to Menu

---

## 2. Battle Arena (Center)

Main visual area where pet battle animations occur.

### Pet Sprites

**User Story:** _As a player, I need to see the battle visually to understand what's happening._

**Components:**

- Player's active pet sprite (left side)
- Opponent's active pet sprite (right side)
- Dynamic sprite loading from AWS S3/Azure Blob Storage

**Animation States:**

- **Idle**: Continuous loop
- **Attack**: Plays when card is used
- **Take Damage**: Flash/shake effect
- **Faint**: Pet defeated animation

```typescript
interface PetSprite {
  petId: string;
  spriteAsset: string;
  position: 'left' | 'right';
  animations: {
    idle: string;
    attack: string;
    takeDamage: string;
    faint: string;
  };
}
```

**Real-time Sync:**

- WebSocket events trigger animations on both clients
- Ensures synchronized battle experience

### Background

- Dynamic background based on battle location
- Simple parallax effect (optional)
- Stored in cloud storage (Azure Blob/AWS S3)

---

## 3. Team "Bench" (Sidebars)

Vertical bars showing benched pets.

### Player Bench (Left Sidebar)

**User Story:** _As a player, I need to see my benched pets and their status so I can plan to swap them._

**Components:**

- 3 icon slots for non-active pets
- Each slot displays:
  - Pet icon (circular avatar)
  - Role badge ("ATK", "DEF", "BAL")
  - Mini HP bar
  - Grayed out if fainted

**Interaction:**

- **Tap to Swap**: Opens confirmation dialog (Material Dialog)
- **Swap Cost**: 1 turn (no other actions that turn)
- **Cooldown**: 2-turn cooldown before swapping again
- **Disabled**: During opponent's turn

```typescript
interface BenchedPet {
  petId: string;
  name: string;
  icon: string;
  currentHp: number;
  maxHp: number;
  role: 'ATK' | 'DEF' | 'BAL';
  isAvailable: boolean;
}
```

### Opponent Bench (Right Sidebar)

**User Story:** _As a player, I need to see my opponent's benched pets to anticipate their strategy._

- Mirrors Player Bench visually
- **Read-only** (no interactions)
- Updates via WebSocket when opponent swaps

---

## 4. Player "Hand" (Bottom)

Primary interaction area for playing cards.

### Card Hand Display

**User Story:** _As a player, I need to see my hand of cards so I can choose my next action._

**Components:**

- Dynamic card container (max 5 cards)
- Horizontal scrolling on mobile
- Empty slots shown when < 5 cards
- Cards animate in when drawn

**Draw Mechanics:**

- Start battle with 5 cards
- Draw 1 card at start of each turn (if deck not empty)
- Playing a card does **not** immediately draw replacement

### Card Anatomy (Individual Card)

**User Story:** _As a player, I need to quickly understand what a card does._

**Card Structure:**

```
┌─────────────────┐
│  [Cost Icons]   │  ← Mana cost (top-left)
│                 │
│   [Card Art]    │  ← Central illustration
│                 │
│  "CARD NAME"    │  ← Bold title
│                 │
│  "Effect Text"  │  ← Description
│                 │
│  [2X]           │  ← Multiplier (bottom-right)
└─────────────────┘
```

**Components:**

1. **Card Art**: Central illustration (from AWS S3)
2. **Card Title**: Bold text (e.g., "MIRROR")
3. **Effect Description**: (e.g., "COUNTER ATK", "+10 HP")
4. **Mana Cost Icons** (top-left):
   - 🥊 Close-Combat (red icon)
   - 🔮 Illusion (purple icon)
   - ⭐ Talent (blue icon)
5. **Damage Multiplier**: (e.g., "2X") - damage multiplication value

**Color Coding:**

- **Brown**: Base pet cards (Level 1)
- **Orange**: Evolved pet cards (Level 2)
- **Pink**: Final evolution pet cards (Level 3)
- **Purple**: Ability cards
- **Gray**: Summoning cards

```typescript
interface CardInHand {
  cardId: string;
  cardType: 'pet' | 'ability' | 'summoning';
  name: string;
  artwork: string;
  description: string;
  manaCost: {
    closeCombat: number;
    illusion: number;
    talent: number;
  };
  damageMultiplier?: number; // e.g., 2X
  effect: string;
}
```

### Hand Interaction Flow

**User Story:** _As a player, I need to play cards to affect the battle._

**Primary Interaction:**

1. **Select Card**: Tap/click card (highlights with border)
2. **Choose Target** (if applicable):
   - Enemy pet (for attacks)
   - Own pet (for buffs)
   - No target needed (self-effect cards)
3. **Confirm Action**:
   - Auto-confirm for self-effects
   - Tap target to confirm for targeted abilities
4. **Card Plays**:
   - Animation plays
   - Mana deducted
   - Card effect triggers
   - Card moves to discard pile
   - New card drawn at start of next turn

**Alternative: Drag-and-Drop** (using Angular CDK)

```typescript
import { CdkDragDrop } from '@angular/cdk/drag-drop';

onCardDrop(event: CdkDragDrop<CardInHand[]>): void {
  if (this.canPlayCard(event.item.data)) {
    this.store.dispatch(BattleActions.playCard({
      cardId: event.item.data.cardId,
      targetId: this.getDropTarget(event)
    }));
  }
}
```

---

## 5. Technical Implementation

### NgRx State Management

```typescript
interface BattleState {
  battleId: string;
  player: PlayerStatus;
  opponent: PlayerStatus;
  currentTurn: 'player' | 'opponent';
  timer: BattleTimer;
  playerHand: CardInHand[];
  playerDeck: DeckStatus;
  playerBench: BenchedPet[];
  opponentBench: BenchedPet[];
  combatLog: CombatEvent[];
  animations: AnimationQueue[];
}

// Actions
export const BattleActions = {
  playCard: createAction('[Battle] Play Card', props<{ cardId: string; targetId?: string }>()),
  dealDamage: createAction('[Battle] Deal Damage', props<{ targetId: string; damage: number }>()),
  swapPet: createAction('[Battle] Swap Pet', props<{ petId: string }>()),
  endTurn: createAction('[Battle] End Turn'),
  timerTick: createAction('[Battle] Timer Tick', props<{ timeRemaining: number }>()),

  // WebSocket events
  opponentAction: createAction('[Battle] Opponent Action', props<{ action: any }>()),
  battleUpdate: createAction('[Battle] Battle Update', props<{ state: Partial<BattleState> }>()),
};
```

### WebSocket Real-Time Synchronization

```typescript
@Injectable()
export class BattleWebSocketService {
  private socket: Socket;

  connect(battleId: string): Observable<BattleEvent> {
    this.socket = io(`${environment.wsEndpoint}/battle`, {
      query: { battleId },
    });

    return merge(
      fromEvent(this.socket, 'card-played'),
      fromEvent(this.socket, 'damage-dealt'),
      fromEvent(this.socket, 'pet-swapped'),
      fromEvent(this.socket, 'turn-ended'),
      fromEvent(this.socket, 'timer-sync')
    );
  }

  playCard(cardId: string, targetId?: string): void {
    this.socket.emit('play-card', { cardId, targetId });
  }

  endTurn(): void {
    this.socket.emit('end-turn');
  }
}
```

### Component Implementation Example

```typescript
@Component({
  selector: 'app-battle-screen',
  template: `
    <div class="battle-screen">
      <!-- Header -->
      <div class="header">
        <app-player-status [player]="(battle$ | async)?.player"></app-player-status>
        <app-battle-timer [timer]="(battle$ | async)?.timer"></app-battle-timer>
        <app-player-status [player]="(battle$ | async)?.opponent"></app-player-status>
      </div>

      <!-- Arena -->
      <div class="battle-arena">
        <app-pet-bench [pets]="(battle$ | async)?.playerBench"></app-pet-bench>
        <app-battle-pets
          [playerPet]="(battle$ | async)?.player.activePet"
          [opponentPet]="(battle$ | async)?.opponent.activePet"
        >
        </app-battle-pets>
        <app-pet-bench [pets]="(battle$ | async)?.opponentBench"></app-pet-bench>
      </div>

      <!-- Hand -->
      <div class="player-hand">
        <app-battle-card
          *ngFor="let card of (battle$ | async)?.playerHand; trackBy: trackByCardId"
          [card]="card"
          (cardPlayed)="onCardPlayed($event)"
        >
        </app-battle-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance optimization
})
export class BattleScreenComponent implements OnInit, OnDestroy {
  battle$ = this.store.select(selectBattle);
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private wsService: BattleWebSocketService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const battleId = this.route.snapshot.params['id'];

    // Connect to WebSocket
    this.wsService
      .connect(battleId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.store.dispatch(
          BattleActions.battleUpdate({
            state: event.data,
          })
        );
      });
  }

  onCardPlayed(cardId: string): void {
    this.store.dispatch(BattleActions.playCard({ cardId }));
  }

  trackByCardId(index: number, card: CardInHand): string {
    return card.cardId; // Optimize ngFor
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## 6. Game Mechanics Clarifications

### Resolved Decisions

| Question              | Decision                                                              |
| --------------------- | --------------------------------------------------------------------- |
| **A/D Stats Meaning** | A = Attack (base damage), D = Defense (damage reduction)              |
| **HP Display**        | Show both visual bar + numerical value: "250/300 HP"                  |
| **Card "2X" Meaning** | Damage multiplier applied to attack calculations (2X = double damage) |
| **Win Condition**     | Player loses when all 3 pets in party are defeated (HP = 0)           |
| **Turn Structure**    | **Turn-based with 60-second timer**: auto-end on timeout              |

### Detailed Mechanics

#### Timer System

- Each player has **60 seconds** per turn
- Timer counts down visually (circular progress)
- At 00:00: Turn automatically ends, passes to opponent
- Timer resets to 60s for next player's turn
- **WebSocket ensures synchronized timer** across both clients

#### Mana System

- 3 mana types: **Close-Combat** (red), **Illusion** (purple), **Talent** (blue)
- Start each battle with **3 mana points** (1 of each type)
- Gain **1 mana point** of chosen type per turn
- Cards cost specific mana combinations
- **Cannot play cards** without sufficient mana

#### Pet Swapping

- Costs **1 turn** (cannot play cards same turn)
- Swapped pet enters with **current HP** (not full)
- **2-turn cooldown** before can swap again
- **Fainted pets cannot be swapped in**
- Disabled during opponent's turn

#### Card Draw System

- Start battle with **5 cards** in hand
- Draw **1 card** at start of each turn (if deck not empty)
- Playing a card does **not** immediately draw replacement
- Once deck is empty, no more draws (hand depletes)
- **Max hand size: 5 cards**

#### Combat Damage Calculation

```typescript
function calculateDamage(attacker: Pet, defender: Pet, card: CardInHand): number {
  const baseAttack = attacker.attack;
  const multiplier = card.damageMultiplier || 1;
  const elementalModifier = getElementalModifier(attacker.type, defender.type);

  const rawDamage = baseAttack * multiplier * elementalModifier;
  const finalDamage = Math.max(0, rawDamage - defender.defense);

  return Math.floor(finalDamage);
}
```

---

## 7. Testing Strategy (TDD)

### Unit Tests (Jasmine + Jest)

```typescript
describe('BattleCardComponent', () => {
  it('should display correct mana costs', () => {
    const card: CardInHand = {
      cardId: '1',
      cardType: 'ability',
      name: 'Fire Blast',
      artwork: 'fire-blast.webp',
      description: 'Deal fire damage',
      manaCost: { closeCombat: 2, illusion: 0, talent: 1 },
      effect: 'damage',
    };

    const { getByTestId } = render(BattleCardComponent, {
      componentProperties: { card },
    });

    expect(getByTestId('close-combat-cost')).toHaveTextContent('2');
    expect(getByTestId('talent-cost')).toHaveTextContent('1');
  });

  it('should apply correct color class based on card type', () => {
    const petCard: CardInHand = {
      cardId: '2',
      cardType: 'pet',
      name: 'Flaming Gecko',
      level: 2,
      // ...
    };

    const fixture = TestBed.createComponent(BattleCardComponent);
    fixture.componentInstance.card = petCard;
    fixture.detectChanges();

    const cardElement = fixture.nativeElement.querySelector('.battle-card');
    expect(cardElement.classList).toContain('pet-level-2');
  });
});

describe('CombatService - Damage Calculation', () => {
  it('should calculate correct damage with multiplier', () => {
    const attacker = createPet({ type: 'Fire', attack: 50 });
    const defender = createPet({ type: 'Water', defense: 10 });
    const card = createCard({ damageMultiplier: 2 });

    // Fire vs Water = 30% damage (from elemental table)
    // (50 * 2 * 0.3) - 10 = 30 - 10 = 20
    const damage = combatService.calculateDamage(attacker, defender, card);
    expect(damage).toBe(20);
  });
});
```

### Integration Tests

```typescript
describe('Battle Effects', () => {
  it('should update pet HP when damage is dealt', (done) => {
    actions$ = of(
      BattleActions.dealDamage({
        targetId: 'pet-1',
        damage: 20,
      })
    );

    effects.dealDamage$.subscribe((action) => {
      expect(action).toEqual(
        BattleActions.updatePetHp({
          petId: 'pet-1',
          newHp: 280, // 300 - 20
        })
      );
      done();
    });
  });

  it('should trigger faint animation when HP reaches 0', (done) => {
    actions$ = of(
      BattleActions.dealDamage({
        targetId: 'pet-1',
        damage: 300,
      })
    );

    effects.dealDamage$.pipe(toArray()).subscribe((actions) => {
      expect(actions).toContainEqual(BattleActions.petFainted({ petId: 'pet-1' }));
      done();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
test('complete battle turn flow', async ({ page }) => {
  await page.goto('/battle/test-battle-id');

  // Wait for battle screen to load
  await page.waitForSelector('[data-testid="battle-screen"]');

  // Verify initial state
  await expect(page.locator('[data-testid="player-hp"]')).toHaveText('300/300 HP');

  // Select and play a card
  await page.click('[data-testid="card-0"]');
  await expect(page.locator('[data-testid="card-0"]')).toHaveClass(/selected/);

  // Click enemy pet to target
  await page.click('[data-testid="enemy-pet"]');

  // Verify damage dealt
  await expect(page.locator('[data-testid="enemy-hp"]')).not.toHaveText('300/300 HP');

  // Verify mana deducted
  await expect(page.locator('[data-testid="close-combat-mana"]')).toHaveText('1'); // Started with 3, used 2

  // End turn
  await page.click('[data-testid="end-turn-button"]');

  // Verify turn changed
  await expect(page.locator('[data-testid="current-turn"]')).toHaveText('Opponent');

  // Verify timer reset
  await expect(page.locator('[data-testid="timer"]')).toHaveText('01:00');
});

test('pet swap interaction', async ({ page }) => {
  await page.goto('/battle/test-battle-id');
  await page.waitForSelector('[data-testid="battle-screen"]');

  // Click benched pet
  await page.click('[data-testid="bench-pet-1"]');

  // Confirm swap dialog appears
  await expect(page.locator('[data-testid="swap-confirmation"]')).toBeVisible();

  // Confirm swap
  await page.click('[data-testid="confirm-swap"]');

  // Verify active pet changed
  await expect(page.locator('[data-testid="active-pet-name"]')).toHaveText('Pet 2');

  // Verify turn ended
  await expect(page.locator('[data-testid="current-turn"]')).toHaveText('Opponent');
});

test('timer expiration ends turn', async ({ page }) => {
  await page.goto('/battle/test-battle-id');

  // Wait for timer to reach 00:00 (or mock time progression)
  await page.evaluate(() => {
    // Mock timer to expire immediately
    window.dispatchEvent(new CustomEvent('timer-expired'));
  });

  // Verify turn automatically ended
  await expect(page.locator('[data-testid="current-turn"]')).toHaveText('Opponent');
});
```

---

## 8. Accessibility & Responsive Design

### WCAG 2.1 AA Compliance

**Accessibility Features:**

- High contrast mode support for HP bars and cards
- Screen reader labels for all interactive elements
- Keyboard navigation for all card plays:
  - Tab to navigate cards
  - Enter to select card
  - Arrow keys to choose target
  - Enter to confirm
- Color-blind friendly palettes (alternative to color-coding)
- Focus indicators on all interactive elements
- ARIA labels and roles

```typescript
// Example: Accessible card component
<mat-card
  role="button"
  tabindex="0"
  [attr.aria-label]="getCardAriaLabel(card)"
  [attr.aria-selected]="isSelected"
  (keydown.enter)="onCardClick()"
  (click)="onCardClick()">
  <!-- Card content -->
</mat-card>

getCardAriaLabel(card: CardInHand): string {
  return `${card.name}. ${card.description}.
          Costs ${card.manaCost.closeCombat} close combat mana,
          ${card.manaCost.illusion} illusion mana,
          ${card.manaCost.talent} talent mana.`;
}
```

### Responsive Breakpoints

```scss
// Mobile (portrait)
@media (max-width: 768px) {
  .battle-arena {
    flex-direction: column;
    padding: 8px;
  }

  .player-hand {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .battle-card {
    min-width: 120px;
    font-size: 0.8rem;
  }

  .pet-bench {
    flex-direction: row;
    justify-content: center;
  }
}

// Tablet (landscape)
@media (min-width: 769px) and (max-width: 1024px) {
  .battle-card {
    scale: 0.9;
  }

  .battle-arena {
    max-width: 900px;
  }
}

// Desktop
@media (min-width: 1025px) {
  .battle-arena {
    max-width: 1400px;
    margin: 0 auto;
  }

  .battle-card {
    min-width: 180px;
  }
}
```

### Mobile Touch Gestures

**Gestures:**

- **Swipe left/right**: Scroll through hand cards
- **Long-press**: View detailed card information
- **Tap card → tap target**: Play card sequence
- **Pinch-to-zoom**: Zoom on battle arena (optional)

```typescript
@Component({
  selector: 'app-battle-card',
  template: `
    <mat-card (press)="onLongPress()" (tap)="onCardClick()">
      <!-- Card content -->
    </mat-card>
  `,
})
export class BattleCardComponent {
  @Output() cardDetails = new EventEmitter<string>();

  onLongPress(): void {
    // Show detailed card modal
    this.cardDetails.emit(this.card.cardId);
  }
}
```

---

## 9. Performance Optimization

### Change Detection Strategy

```typescript
@Component({
  selector: 'app-battle-screen',
  changeDetection: ChangeDetectionStrategy.OnPush, // Immutable state
  template: `...`,
})
export class BattleScreenComponent {
  // Use observables from NgRx store
  battle$ = this.store.select(selectBattle);

  // TrackBy functions for ngFor
  trackByCardId(index: number, card: CardInHand): string {
    return card.cardId;
  }

  trackByPetId(index: number, pet: BenchedPet): string {
    return pet.petId;
  }
}
```

### Asset Optimization

**Images:**

- Use **WebP format** for card artwork (30-50% smaller than PNG)
- **Sprite sheets** for pet animations (reduce HTTP requests)
- **Lazy load** non-visible cards (virtual scrolling)
- **CDN caching** for static assets (Azure Blob Storage / AWS S3 with CloudFront)

```typescript
// Lazy load card artwork
<img
  [src]="card.artwork"
  [alt]="card.name"
  loading="lazy"
  decoding="async">
```

**WebSocket Optimization:**

- **MessagePack compression** for messages (smaller than JSON)
- **Batch non-critical updates**: Timer ticks every second (not millisecond)
- **Reconnection logic** with exponential backoff
- **Heartbeat mechanism** to detect disconnections

```typescript
// MessagePack compression
import * as msgpack from '@msgpack/msgpack';

socket.emit('play-card', msgpack.encode({ cardId, targetId }));

socket.on('battle-update', (data: ArrayBuffer) => {
  const event = msgpack.decode(new Uint8Array(data));
  this.store.dispatch(BattleActions.battleUpdate({ state: event }));
});
```

### Bundle Size Optimization

- **Code splitting** for battle module (lazy loaded)
- **Tree shaking** to remove unused code
- **Angular Universal (SSR)** for faster initial load
- **Service Worker** for offline caching (PWA)

```typescript
// Lazy load battle module
const routes: Routes = [
  {
    path: 'battle/:id',
    loadChildren: () => import('./battle/battle.module').then((m) => m.BattleModule),
  },
];
```

---

## 10. Summary & Next Steps

### Implementation Checklist

- [ ] Set up NgRx store with battle state
- [ ] Implement WebSocket service for real-time sync
- [ ] Create Player/Opponent status components (Material UI)
- [ ] Build circular timer component
- [ ] Implement pet sprite system with animations
- [ ] Create pet bench components with swap functionality
- [ ] Build card hand display with drag-and-drop
- [ ] Implement card component with mana cost display
- [ ] Add combat damage calculation service
- [ ] Write unit tests for all components (TDD)
- [ ] Write integration tests for NgRx effects
- [ ] Write E2E tests for battle flow (Playwright)
- [ ] Implement accessibility features (WCAG 2.1 AA)
- [ ] Optimize for mobile responsive design
- [ ] Performance testing and optimization

### Technologies Summary

- **Frontend**: Angular 20, Material UI, Tailwind CSS, Angular CDK
- **State**: NgRx with OnPush Change Detection
- **Real-time**: WebSockets (Socket.io) with MessagePack
- **Testing**: Jasmine, Jest, Playwright (TDD approach)
- **Assets**: AWS S3, Azure Blob Storage with CDN
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: SSR (Angular Universal), lazy loading, sprite sheets

---

**Reference**: This specification implements the battle screen mockup (battle.png) with full technical stack integration for ElementaMon.
