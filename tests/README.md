# 🧪 Tests - Testing Infrastructure

Comprehensive testing setup for ElementaMon project.

## 📖 Overview

Testing infrastructure for:

- **Unit Tests** - Individual components and functions
- **Integration Tests** - Service interactions
- **E2E Tests** - Full user workflows
- **Visual Regression** - UI screenshot comparison
- **Performance Tests** - Load and stress testing
- **Accessibility Tests** - WCAG 2.1 AA compliance

---

## 🏗️ Testing Stack

### Unit & Integration Tests

- **Jest** - Test runner and assertion library
- **Testing Library** - Angular/React component testing
- **Jasmine** - Angular default testing framework
- **Sinon** - Mocks and stubs

### End-to-End Tests

- **Playwright** - Cross-browser E2E testing
- **Cypress** (optional) - Alternative E2E framework

### Performance Tests

- **Lighthouse CI** - Performance metrics
- **k6** - Load testing
- **Artillery** - Stress testing

### Visual Regression

- **Percy** - Visual testing
- **Chromatic** - Storybook visual testing

### Accessibility

- **axe-core** - Accessibility testing
- **Pa11y** - Automated accessibility audits

---

## 📁 Directory Structure

```
tests/
├── e2e/                            # End-to-end tests
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── battle/
│   │   ├── pvp.spec.ts
│   │   └── pve.spec.ts
│   ├── deck-builder/
│   │   └── deck-management.spec.ts
│   ├── inventory/
│   │   └── item-management.spec.ts
│   └── utils/
│       ├── test-helpers.ts
│       └── page-objects/
├── integration/                    # Integration tests
│   ├── api/
│   │   ├── auth.integration.ts
│   │   ├── pets.integration.ts
│   │   └── battle.integration.ts
│   ├── database/
│   │   ├── postgres.integration.ts
│   │   └── mongodb.integration.ts
│   └── services/
│       ├── auth-service.integration.ts
│       └── battle-service.integration.ts
├── fixtures/                       # Test data
│   ├── pets.json
│   ├── cards.json
│   ├── users.json
│   └── battles.json
├── mocks/                          # Mock data and services
│   ├── api/
│   │   ├── auth.mock.ts
│   │   └── pets.mock.ts
│   ├── services/
│   │   └── battle.mock.ts
│   └── websocket/
│       └── socket.mock.ts
├── performance/                    # Performance tests
│   ├── lighthouse/
│   │   └── lighthouse.config.js
│   ├── k6/
│   │   └── load-test.js
│   └── artillery/
│       └── stress-test.yml
├── visual/                         # Visual regression tests
│   └── screenshots/
├── accessibility/                  # A11y tests
│   ├── wcag.spec.ts
│   └── aria.spec.ts
├── playwright.config.ts            # Playwright configuration
├── jest.config.ts                  # Jest configuration
└── README.md
```

---

## 🚀 Quick Start

### Run All Tests

```powershell
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run integration tests
pnpm test:integration

# Run all tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Run Specific Tests

```powershell
# Run tests for specific app
npx nx test home

# Run E2E tests for specific feature
npx nx e2e shell-e2e --spec=auth/login.spec.ts

# Run integration tests
npx jest --testPathPattern=integration

# Run accessibility tests
npx jest --testPathPattern=accessibility
```

---

## 🧪 Unit Testing

### Angular Component Test Example

```typescript
// apps/battle/src/app/battle-arena/battle-arena.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BattleArenaComponent } from './battle-arena.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { mockBattleState } from '@elementamon/game/state/testing';

describe('BattleArenaComponent', () => {
  let component: BattleArenaComponent;
  let fixture: ComponentFixture<BattleArenaComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleArenaComponent],
      providers: [provideMockStore({ initialState: mockBattleState })],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleArenaComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display player pets', () => {
    fixture.detectChanges();
    const petElements = fixture.nativeElement.querySelectorAll('.player-pet');
    expect(petElements.length).toBe(3);
  });

  it('should dispatch action when card is played', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.playCard('card-123');
    expect(dispatchSpy).toHaveBeenCalledWith(battleActions.playCard({ cardId: 'card-123' }));
  });
});
```

### Service Test Example

```typescript
// libs/game/battle/src/lib/services/damage-calculator.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { DamageCalculatorService } from './damage-calculator.service';
import { ElementalType } from '@elementamon/shared/types';

describe('DamageCalculatorService', () => {
  let service: DamageCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DamageCalculatorService);
  });

  it('should calculate base damage', () => {
    const damage = service.calculateDamage({
      attackPower: 100,
      defenseValue: 50,
      attackerType: ElementalType.Fire,
      defenderType: ElementalType.Water,
    });

    expect(damage).toBeGreaterThan(0);
  });

  it('should apply type effectiveness', () => {
    const fireDamage = service.calculateDamage({
      attackPower: 100,
      defenseValue: 50,
      attackerType: ElementalType.Fire,
      defenderType: ElementalType.Water, // Fire weak against Water
    });

    const effectiveDamage = service.calculateDamage({
      attackPower: 100,
      defenseValue: 50,
      attackerType: ElementalType.Fire,
      defenderType: ElementalType.Earth, // Fire strong against Earth
    });

    expect(effectiveDamage).toBeGreaterThan(fireDamage);
  });
});
```

---

## 🌐 End-to-End Testing

### Playwright Test Example

```typescript
// tests/e2e/battle/pvp.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PvP Battle', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4200/login');
    await page.fill('input[name="email"]', 'test@elementamon.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/home');
  });

  test('should start matchmaking', async ({ page }) => {
    // Navigate to battle
    await page.click('text=Battle');
    await page.click('text=PvP Match');

    // Wait for matchmaking
    await expect(page.locator('text=Finding opponent...')).toBeVisible();

    // Wait for battle to start (timeout 30s)
    await expect(page.locator('.battle-arena')).toBeVisible({ timeout: 30000 });
  });

  test('should play a card', async ({ page }) => {
    // Assume battle is already started
    await page.goto('http://localhost:4203/battle/pvp');

    // Wait for battle UI
    await expect(page.locator('.player-hand')).toBeVisible();

    // Play first card
    const firstCard = page.locator('.hand-card').first();
    await firstCard.click();

    // Select target
    const opponentPet = page.locator('.opponent-pet').first();
    await opponentPet.click();

    // Verify card was played
    await expect(page.locator('text=Card played successfully')).toBeVisible();
  });

  test('should display battle results', async ({ page, context }) => {
    // Open two browser contexts (two players)
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Both players join battle
    await page1.goto('http://localhost:4203/battle/pvp');
    await page2.goto('http://localhost:4203/battle/pvp');

    // Play until battle ends (mock scenario)
    // ... battle actions ...

    // Verify results screen
    await expect(page1.locator('.battle-results')).toBeVisible();
    await expect(page1.locator('text=Victory')).toBeVisible();
  });
});
```

### Page Object Pattern

```typescript
// tests/e2e/utils/page-objects/battle.page.ts
import { Page, Locator } from '@playwright/test';

export class BattlePage {
  readonly page: Page;
  readonly playerPets: Locator;
  readonly opponentPets: Locator;
  readonly handCards: Locator;
  readonly endTurnButton: Locator;
  readonly surrenderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.playerPets = page.locator('.player-pet');
    this.opponentPets = page.locator('.opponent-pet');
    this.handCards = page.locator('.hand-card');
    this.endTurnButton = page.locator('button:has-text("End Turn")');
    this.surrenderButton = page.locator('button:has-text("Surrender")');
  }

  async goto() {
    await this.page.goto('http://localhost:4203/battle');
  }

  async playCard(cardIndex: number, targetIndex: number) {
    const card = this.handCards.nth(cardIndex);
    await card.click();

    const target = this.opponentPets.nth(targetIndex);
    await target.click();
  }

  async endTurn() {
    await this.endTurnButton.click();
  }

  async surrender() {
    await this.surrenderButton.click();
    await this.page.click('button:has-text("Confirm")');
  }

  async waitForBattleStart() {
    await this.page.waitForSelector('.battle-arena', { timeout: 30000 });
  }
}

// Usage
test('should play battle', async ({ page }) => {
  const battlePage = new BattlePage(page);
  await battlePage.goto();
  await battlePage.waitForBattleStart();
  await battlePage.playCard(0, 0);
  await battlePage.endTurn();
});
```

---

## 🔗 Integration Testing

### API Integration Test

```typescript
// tests/integration/api/auth.integration.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../services/auth/src/app';

describe('Auth API Integration', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  it('should register a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@elementamon.com',
      username: 'testuser',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('token');
  });

  it('should login with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@elementamon.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    authToken = response.body.token;
  });

  it('should get current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test@elementamon.com');
  });

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
```

---

## 🎭 Mocking

### Mock Services

```typescript
// tests/mocks/services/battle.mock.ts
import { BattleService } from '@elementamon/game/battle';
import { of } from 'rxjs';

export const mockBattleService: Partial<BattleService> = {
  startBattle: jest.fn().mockReturnValue(
    of({
      battleId: 'battle-123',
      playerPets: [],
      opponentPets: [],
    })
  ),

  playCard: jest.fn().mockReturnValue(
    of({
      success: true,
      damage: 50,
    })
  ),

  endTurn: jest.fn().mockReturnValue(
    of({
      success: true,
    })
  ),
};
```

### Mock API Responses

```typescript
// tests/mocks/api/pets.mock.ts
import { rest } from 'msw';

export const petsHandlers = [
  rest.get('/api/pets', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Fire Dragon', elementalType: 'Fire' },
        { id: '2', name: 'Water Turtle', elementalType: 'Water' },
      ])
    );
  }),

  rest.get('/api/pets/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'Fire Dragon',
        elementalType: 'Fire',
        stats: { hp: 100, attack: 80, defense: 60 },
      })
    );
  }),
];
```

---

## ⚡ Performance Testing

### Lighthouse CI

```javascript
// tests/performance/lighthouse/lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200/',
        'http://localhost:4200/battle',
        'http://localhost:4200/deck-builder',
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:best-practices': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 1.0 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### k6 Load Test

```javascript
// tests/performance/k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests can fail
  },
};

export default function () {
  const response = http.get('http://localhost:3002/api/pets');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

---

## ♿ Accessibility Testing

### Axe Core Test

```typescript
// tests/accessibility/wcag.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have accessibility violations on home page', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on battle page', async ({ page }) => {
    await page.goto('http://localhost:4203/battle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 📊 Test Coverage

### Coverage Targets

- **Overall**: 80%+
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Generate Coverage Report

```powershell
# Generate coverage
pnpm test:coverage

# View HTML report
start .\coverage\index.html
```

---

## 🎯 Best Practices

1. **Follow AAA pattern** - Arrange, Act, Assert
2. **Use Page Objects** for E2E tests
3. **Mock external dependencies**
4. **Test edge cases** and error scenarios
5. **Use fixtures** for test data
6. **Keep tests isolated** and independent
7. **Use descriptive test names**
8. **Test user behavior**, not implementation
9. **Run tests in CI/CD**
10. **Monitor flaky tests**

---

## 📚 Resources

- **Jest**: https://jestjs.io
- **Playwright**: https://playwright.dev
- **Testing Library**: https://testing-library.com
- **Axe Core**: https://www.deque.com/axe
- **k6**: https://k6.io/docs
