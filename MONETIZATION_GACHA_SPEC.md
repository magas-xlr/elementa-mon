# 💰 ElementaMon - Monetization & Gacha System Specification

**Free-to-Play with Fair Monetization & Gacha Mechanics**

---

## 📖 Overview

ElementaMon implements a **player-friendly free-to-play model** with multiple revenue streams while maintaining fair gameplay balance. The monetization system includes gacha mechanics for pet acquisition, optional advertisements, multiple payment methods (including cryptocurrency), and a robust coupon system.

### Core Principles

- 🎮 **Fair Free-to-Play**: All pets obtainable through gameplay
- 🎲 **Gacha with Pity System**: Guaranteed rare drops after X pulls
- 📺 **Optional Ads**: Rewarded videos for premium currency
- 💳 **Multiple Payment Methods**: Credit cards, PayPal, PIX, crypto
- 🎟️ **Coupon System**: Promotional codes and referral rewards
- ⚖️ **No Pay-to-Win**: Cosmetics only, gameplay balanced

---

## 🎲 Gacha System

### Gacha Mechanics Overview

**Summoning Portals** - Players can summon new ElementaMons through various gacha pools:

```typescript
interface GachaPool {
  id: string;
  name: string;
  description: string;
  cost: {
    currency: 'gems' | 'tickets';
    amount: number;
    bulk?: { pulls: number; cost: number }; // Bulk discount
  };
  rateUp?: {
    petIds: string[];
    multiplier: number; // 2x, 3x rate
    endDate: Date;
  };
  pitySystem: {
    enabled: boolean;
    guaranteedRare: number; // Guaranteed rare after X pulls
    guaranteedEpic: number;
    guaranteedLegendary: number;
  };
  dropRates: DropRate[];
  featured?: string[]; // Featured pet IDs
}

interface DropRate {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  baseRate: number; // Percentage (e.g., 1.5 for 1.5%)
  guaranteedAfter?: number; // Pity counter
}
```

### Gacha Pool Types

#### 1. Standard Gacha Pool

**Cost**: 150 Gems or 1 Standard Ticket per pull
**Bulk**: 10 pulls for 1,350 Gems (10% discount)

**Drop Rates**:

- Common: 55%
- Uncommon: 30%
- Rare: 10%
- Epic: 4%
- Legendary: 0.9%
- Mythic: 0.1%

**Pity System**:

- Guaranteed Rare: Every 10 pulls
- Guaranteed Epic: Every 50 pulls
- Guaranteed Legendary: Every 100 pulls

#### 2. Featured Gacha Pool (Rate-Up)

**Cost**: 150 Gems or 1 Featured Ticket per pull
**Bulk**: 10 pulls for 1,350 Gems

**Drop Rates** (Featured pets have 2x rate):

- Featured Legendary: 1.8% (2x base)
- Featured Epic: 8% (2x base)
- Other drops: Standard rates

**Pity System**:

- Guaranteed Featured Pet: Every 90 pulls
- Pity carries over to next banner if you stop

#### 3. Elemental Gacha Pools

Separate pools for each element type (Fire, Water, Electric, etc.)

**Cost**: 200 Gems per pull
**Bulk**: 10 pulls for 1,800 Gems

**Drop Rates**: Same as standard, but only pets of selected element

**Pity System**: Standard pity applies

#### 4. Special Event Gacha

Time-limited pools with exclusive pets

**Cost**: 300 Gems or 1 Premium Ticket
**Bulk**: 10 pulls for 2,700 Gems

**Drop Rates**:

- Exclusive Legendary: 2%
- Event Epic: 10%
- Standard drops: Reduced rates

**Pity System**:

- Guaranteed Event Pet: Every 75 pulls

### Gacha UI Components

```typescript
// components/gacha/gacha-portal.component.ts
import { Component, signal, computed } from '@angular/core';
import { GachaService } from '@/services/gacha.service';

@Component({
  selector: 'app-gacha-portal',
  template: `
    <div class="gacha-portal">
      <!-- Pool Selection -->
      <div class="pool-tabs">
        <button
          *ngFor="let pool of gachaPools()"
          [class.active]="selectedPool() === pool"
          (click)="selectPool(pool)"
        >
          {{ pool.name }}
          <span class="badge" *ngIf="pool.featured">NEW</span>
        </button>
      </div>

      <!-- Pool Details -->
      <div class="pool-details" *ngIf="selectedPool()">
        <h2>{{ selectedPool().name }}</h2>
        <p>{{ selectedPool().description }}</p>

        <!-- Drop Rates Display -->
        <div class="drop-rates">
          <h3>Drop Rates</h3>
          <div *ngFor="let rate of selectedPool().dropRates">
            <span class="rarity-badge" [attr.data-rarity]="rate.rarity">
              {{ rate.rarity }}
            </span>
            <span class="rate">{{ rate.baseRate }}%</span>
          </div>
        </div>

        <!-- Pity Counter -->
        <div class="pity-counter" *ngIf="selectedPool().pitySystem.enabled">
          <h3>Pity System</h3>
          <p>Pulls until guaranteed Rare: {{ pullsUntilRare() }}</p>
          <p>Pulls until guaranteed Epic: {{ pullsUntilEpic() }}</p>
          <p>Pulls until guaranteed Legendary: {{ pullsUntilLegendary() }}</p>
          <div class="progress-bar">
            <div class="progress" [style.width.%]="pityProgress()"></div>
          </div>
        </div>

        <!-- Featured Pets Preview -->
        <div class="featured-pets" *ngIf="featuredPets().length > 0">
          <h3>Featured Pets (Rate Up 2x)</h3>
          <div class="pet-grid">
            <app-pet-card *ngFor="let pet of featuredPets()" [pet]="pet" [showRateUp]="true" />
          </div>
        </div>
      </div>

      <!-- Pull Buttons -->
      <div class="pull-actions">
        <button class="btn-pull-single" [disabled]="!canAffordPull(1)" (click)="performPull(1)">
          <div class="cost">
            <img [src]="getCurrencyIcon()" />
            <span>{{ selectedPool().cost.amount }}</span>
          </div>
          <span>Pull x1</span>
        </button>

        <button class="btn-pull-bulk" [disabled]="!canAffordPull(10)" (click)="performPull(10)">
          <div class="cost">
            <img [src]="getCurrencyIcon()" />
            <span>{{ selectedPool().cost.bulk.cost }}</span>
            <span class="discount">Save 10%</span>
          </div>
          <span>Pull x10</span>
        </button>
      </div>

      <!-- Player Currency Display -->
      <div class="currency-display">
        <div class="currency-item">
          <img src="/assets/icons/gem.png" />
          <span>{{ playerGems() }}</span>
        </div>
        <div class="currency-item">
          <img src="/assets/icons/ticket.png" />
          <span>{{ playerTickets() }}</span>
        </div>
      </div>
    </div>
  `,
  standalone: true,
})
export class GachaPortalComponent {
  private gachaService = inject(GachaService);

  gachaPools = signal<GachaPool[]>([]);
  selectedPool = signal<GachaPool | null>(null);
  playerGems = signal(0);
  playerTickets = signal(0);

  // Pity counters
  pullsUntilRare = computed(() => {
    const pool = this.selectedPool();
    if (!pool) return 0;
    return (
      pool.pitySystem.guaranteedRare -
      (this.gachaService.getPityCounter('rare') % pool.pitySystem.guaranteedRare)
    );
  });

  pullsUntilEpic = computed(() => {
    const pool = this.selectedPool();
    if (!pool) return 0;
    return (
      pool.pitySystem.guaranteedEpic -
      (this.gachaService.getPityCounter('epic') % pool.pitySystem.guaranteedEpic)
    );
  });

  pullsUntilLegendary = computed(() => {
    const pool = this.selectedPool();
    if (!pool) return 0;
    return (
      pool.pitySystem.guaranteedLegendary -
      (this.gachaService.getPityCounter('legendary') % pool.pitySystem.guaranteedLegendary)
    );
  });

  async performPull(count: number) {
    const result = await this.gachaService.performPull(this.selectedPool()!.id, count);

    // Show animation and results
    this.showGachaAnimation(result);
  }

  private showGachaAnimation(result: GachaResult) {
    // Trigger gacha pull animation (orbs, cards flipping, etc.)
  }
}
```

### Gacha Animation System

```typescript
// components/gacha/gacha-animation.component.ts
@Component({
  selector: 'app-gacha-animation',
  template: `
    <div class="gacha-animation" *ngIf="isAnimating()">
      <!-- Summoning Circle Animation -->
      <div class="summoning-circle">
        <svg><!-- Animated circle with elemental symbols --></svg>
      </div>

      <!-- Card Reveal Animation -->
      <div class="card-reveal" *ngFor="let result of results(); let i = index">
        <div
          class="card-flip"
          [style.animation-delay.ms]="i * 200"
          [attr.data-rarity]="result.rarity"
        >
          <div class="card-front">
            <img src="/assets/card-back.png" />
          </div>
          <div class="card-back">
            <app-pet-card [pet]="result.pet" [animated]="true" />
          </div>
        </div>
      </div>

      <!-- Skip Button -->
      <button class="skip-btn" (click)="skipAnimation()">Skip Animation</button>
    </div>
  `,
})
export class GachaAnimationComponent {
  isAnimating = signal(false);
  results = signal<GachaResult[]>([]);

  startAnimation(results: GachaResult[]) {
    this.results.set(results);
    this.isAnimating.set(true);

    // Play sound effects based on rarity
    results.forEach((result, index) => {
      setTimeout(() => {
        this.playRaritySound(result.rarity);
      }, index * 200);
    });
  }

  private playRaritySound(rarity: string) {
    const audio = new Audio(`/assets/sounds/gacha-${rarity}.mp3`);
    audio.play();
  }
}
```

### Gacha Backend Service

```typescript
// services/economy/src/controllers/gacha.controller.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { GachaService } from '../services/gacha.service';

const router = Router();
const gachaService = new GachaService();

// Get available gacha pools
router.get('/pools', authenticate, async (req, res) => {
  const pools = await gachaService.getAvailablePools();
  res.json(pools);
});

// Get player pity counters
router.get('/pity', authenticate, async (req, res) => {
  const userId = req.user.id;
  const pityCounters = await gachaService.getPityCounters(userId);
  res.json(pityCounters);
});

// Perform gacha pull
router.post('/pull', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { poolId, count } = req.body;

  try {
    // Validate user has enough currency
    const hasEnough = await gachaService.validateCurrency(userId, poolId, count);
    if (!hasEnough) {
      return res.status(400).json({ error: 'Insufficient currency' });
    }

    // Perform pull with pity system
    const results = await gachaService.performPull(userId, poolId, count);

    // Deduct currency
    await gachaService.deductCurrency(userId, poolId, count);

    // Update pity counters
    await gachaService.updatePityCounters(userId, poolId, results);

    // Log transaction
    await gachaService.logGachaTransaction(userId, poolId, count, results);

    res.json({
      results,
      remainingCurrency: await gachaService.getUserCurrency(userId),
      pityCounters: await gachaService.getPityCounters(userId),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get gacha history
router.get('/history', authenticate, async (req, res) => {
  const userId = req.user.id;
  const history = await gachaService.getGachaHistory(userId, {
    limit: 50,
    offset: 0,
  });
  res.json(history);
});

export default router;
```

### Pity System Implementation

```typescript
// services/economy/src/services/gacha.service.ts
export class GachaService {
  async performPull(userId: string, poolId: string, count: number): Promise<GachaResult[]> {
    const pool = await this.getPool(poolId);
    const pityCounters = await this.getPityCounters(userId, poolId);
    const results: GachaResult[] = [];

    for (let i = 0; i < count; i++) {
      pityCounters.total += 1;
      pityCounters.sinceRare += 1;
      pityCounters.sinceEpic += 1;
      pityCounters.sinceLegendary += 1;

      let result: GachaResult;

      // Check pity system
      if (pityCounters.sinceLegendary >= pool.pitySystem.guaranteedLegendary) {
        result = await this.guaranteedPull('legendary', pool);
        pityCounters.sinceLegendary = 0;
        pityCounters.sinceEpic = 0;
        pityCounters.sinceRare = 0;
      } else if (pityCounters.sinceEpic >= pool.pitySystem.guaranteedEpic) {
        result = await this.guaranteedPull('epic', pool);
        pityCounters.sinceEpic = 0;
        pityCounters.sinceRare = 0;
      } else if (pityCounters.sinceRare >= pool.pitySystem.guaranteedRare) {
        result = await this.guaranteedPull('rare', pool);
        pityCounters.sinceRare = 0;
      } else {
        // Normal pull with weighted random
        result = await this.randomPull(pool);

        // Reset appropriate counters if rare+ obtained
        if (result.rarity === 'legendary' || result.rarity === 'mythic') {
          pityCounters.sinceLegendary = 0;
          pityCounters.sinceEpic = 0;
          pityCounters.sinceRare = 0;
        } else if (result.rarity === 'epic') {
          pityCounters.sinceEpic = 0;
          pityCounters.sinceRare = 0;
        } else if (result.rarity === 'rare') {
          pityCounters.sinceRare = 0;
        }
      }

      results.push(result);
    }

    // Save updated pity counters
    await this.savePityCounters(userId, poolId, pityCounters);

    // Award pets to player
    await this.awardPets(userId, results);

    return results;
  }

  private async randomPull(pool: GachaPool): Promise<GachaResult> {
    // Weighted random selection
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const dropRate of pool.dropRates) {
      cumulative += dropRate.baseRate;
      if (rand <= cumulative) {
        const pet = await this.getRandomPetByRarity(dropRate.rarity, pool);
        return {
          pet,
          rarity: dropRate.rarity,
          isNew: await this.isNewPet(pet.id),
          isDuplicate: await this.isDuplicate(pet.id),
        };
      }
    }

    // Fallback to common
    return this.guaranteedPull('common', pool);
  }
}
```

---

## 💰 Currency System

### Currency Types

```typescript
enum CurrencyType {
  // Free Currency (earned through gameplay)
  GOLD = 'gold', // Basic currency from battles
  DUST = 'dust', // Duplicate pet conversion

  // Premium Currency (purchased or earned via ads)
  GEMS = 'gems', // Primary premium currency

  // Special Tickets
  STANDARD_TICKET = 'standard_ticket',
  FEATURED_TICKET = 'featured_ticket',
  PREMIUM_TICKET = 'premium_ticket',

  // Event Currency
  EVENT_TOKENS = 'event_tokens',
}

interface PlayerCurrency {
  userId: string;
  gold: number;
  dust: number;
  gems: number;
  tickets: {
    standard: number;
    featured: number;
    premium: number;
  };
  eventTokens: Record<string, number>; // eventId -> amount
  lastUpdated: Date;
}
```

### Currency Earning Methods

**Gold** (Free):

- Battle victories: 50-200 gold
- Daily missions: 500 gold
- Weekly challenges: 2,000 gold
- Tournament participation: 1,000-5,000 gold

**Dust** (Free):

- Duplicate pets conversion:
  - Common: 5 dust
  - Uncommon: 20 dust
  - Rare: 75 dust
  - Epic: 300 dust
  - Legendary: 1,500 dust

**Gems** (Premium + Ads):

- In-app purchases: Various bundles
- Daily login: 20 gems
- Weekly missions: 100 gems
- Achievements: 50-500 gems
- Watching ads: 10 gems per video (5 per day limit)
- Referral rewards: 500 gems per friend
- Tournament top ranks: 1,000-10,000 gems

**Tickets** (Mixed):

- Login rewards
- Monthly pass
- Event rewards
- Special promotions

---

## 📺 Advertisement System

### Rewarded Video Ads

```typescript
// services/ads/ad-manager.service.ts
import { AdMob } from '@capacitor-community/admob';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdManagerService {
  private dailyAdCount = signal(0);
  private readonly MAX_DAILY_ADS = 5;
  private readonly GEMS_PER_AD = 10;

  async initialize() {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      initializeForTesting: false,
    });
  }

  async showRewardedAd(): Promise<AdReward> {
    if (this.dailyAdCount() >= this.MAX_DAILY_ADS) {
      throw new Error('Daily ad limit reached');
    }

    try {
      const result = await AdMob.prepareRewardVideoAd({
        adId: 'ca-app-pub-xxxxx/rewarded',
        isTesting: false,
      });

      await AdMob.showRewardVideoAd();

      // Increment counter
      this.dailyAdCount.update((count) => count + 1);

      // Award gems
      const reward = {
        type: 'gems',
        amount: this.GEMS_PER_AD,
        success: true,
      };

      await this.awardAdReward(reward);

      return reward;
    } catch (error) {
      console.error('Ad failed:', error);
      return { success: false };
    }
  }

  canWatchAd(): boolean {
    return this.dailyAdCount() < this.MAX_DAILY_ADS;
  }

  getRemainingAds(): number {
    return Math.max(0, this.MAX_DAILY_ADS - this.dailyAdCount());
  }

  private async awardAdReward(reward: AdReward) {
    // Call economy service to credit gems
    await this.http.post('/api/economy/ad-reward', reward).toPromise();
  }
}
```

### Ad Placement Locations

1. **Rewarded Video** (Optional)
   - Watch ad for 10 gems
   - Double battle rewards
   - Continue after defeat
   - Speed up timers

2. **Banner Ads** (Non-intrusive)
   - Main menu (dismissible)
   - Loading screens
   - End of battle summary

3. **Interstitial Ads** (Rare, optional)
   - Between long play sessions
   - After major milestones
   - Player can opt-out with ad-free pass

### Ad-Free Premium Pass

```typescript
interface PremiumPass {
  id: string;
  name: 'Monthly Premium Pass';
  price: {
    usd: 4.99;
    brl: 24.99;
  };
  benefits: [
    'No banner ads',
    'No interstitial ads',
    'Daily 100 gems bonus',
    'Exclusive avatar border',
    '2x battle rewards',
  ];
  duration: 30 * 24 * 60 * 60 * 1000; // 30 days
}
```

---

## 💳 Payment System

### Supported Payment Methods

```typescript
enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  PIX = 'pix', // Brazilian instant payment
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  GOOGLE_PAY = 'google_pay',
  APPLE_PAY = 'apple_pay',
  STRIPE = 'stripe',
}

interface PaymentProvider {
  method: PaymentMethod;
  provider: string;
  enabled: boolean;
  regions: string[]; // Country codes
  minimumAmount?: number;
  maximumAmount?: number;
  processingFee?: number; // Percentage
}
```

### Payment Integration Architecture

```typescript
// services/economy/src/payments/payment-orchestrator.ts
export class PaymentOrchestrator {
  private providers = new Map<PaymentMethod, PaymentProvider>();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Credit/Debit Cards - Stripe
    this.providers.set(PaymentMethod.CREDIT_CARD, {
      provider: new StripeProvider(),
      regions: ['global'],
      enabled: true,
    });

    // PayPal
    this.providers.set(PaymentMethod.PAYPAL, {
      provider: new PayPalProvider(),
      regions: ['global'],
      enabled: true,
    });

    // PIX (Brazil)
    this.providers.set(PaymentMethod.PIX, {
      provider: new MercadoPagoProvider(), // or PagSeguro
      regions: ['BR'],
      enabled: true,
    });

    // Bitcoin
    this.providers.set(PaymentMethod.BITCOIN, {
      provider: new CoinbaseCommerceProvider(),
      regions: ['global'],
      enabled: true,
      minimumAmount: 5.0,
    });

    // Ethereum
    this.providers.set(PaymentMethod.ETHEREUM, {
      provider: new CoinbaseCommerceProvider(),
      regions: ['global'],
      enabled: true,
      minimumAmount: 5.0,
    });
  }

  async processPayment(
    userId: string,
    method: PaymentMethod,
    bundleId: string,
    metadata?: any
  ): Promise<PaymentResult> {
    const provider = this.providers.get(method);
    if (!provider || !provider.enabled) {
      throw new Error('Payment method not available');
    }

    const bundle = await this.getBundle(bundleId);

    // Create payment intent
    const paymentIntent = await provider.provider.createPayment({
      amount: bundle.price,
      currency: 'USD',
      userId,
      bundleId,
      metadata,
    });

    return {
      paymentId: paymentIntent.id,
      status: 'pending',
      redirectUrl: paymentIntent.url,
      qrCode: paymentIntent.qrCode, // For PIX/crypto
    };
  }
}
```

### Stripe Integration (Credit/Debit Cards)

```typescript
// services/economy/src/payments/stripe-provider.ts
import Stripe from 'stripe';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createPayment(params: PaymentParams): Promise<PaymentIntent> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: params.bundleName,
              description: `${params.gemAmount} Gems`,
              images: [params.bundleImage],
            },
            unit_amount: params.amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: params.email,
      metadata: {
        userId: params.userId,
        bundleId: params.bundleId,
      },
    });

    return {
      id: session.id,
      url: session.url,
      status: 'pending',
    };
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === 'paid';
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillOrder(session);
    }
  }

  private async fulfillOrder(session: Stripe.Checkout.Session) {
    const { userId, bundleId } = session.metadata!;

    // Award gems to player
    await economyService.awardBundle(userId, bundleId);

    // Log transaction
    await economyService.logTransaction({
      userId,
      bundleId,
      paymentMethod: 'credit_card',
      amount: session.amount_total! / 100,
      currency: session.currency,
      status: 'completed',
      transactionId: session.payment_intent as string,
    });
  }
}
```

### PIX Integration (Brazil)

```typescript
// services/economy/src/payments/pix-provider.ts
import MercadoPago from 'mercadopago';

export class PixProvider implements PaymentProvider {
  private mp: typeof MercadoPago;

  constructor() {
    this.mp = new MercadoPago(process.env.MERCADOPAGO_ACCESS_TOKEN!);
  }

  async createPayment(params: PaymentParams): Promise<PaymentIntent> {
    const payment = await this.mp.payment.create({
      transaction_amount: params.amount,
      description: `${params.gemAmount} Gems - ElementaMon`,
      payment_method_id: 'pix',
      payer: {
        email: params.email,
        first_name: params.name,
      },
      metadata: {
        user_id: params.userId,
        bundle_id: params.bundleId,
      },
    });

    return {
      id: payment.body.id.toString(),
      status: 'pending',
      qrCode: payment.body.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
      pixKey: payment.body.point_of_interaction.transaction_data.ticket_url,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const payment = await this.mp.payment.get(paymentId);

    return {
      status: payment.body.status, // 'pending', 'approved', 'rejected'
      statusDetail: payment.body.status_detail,
    };
  }
}
```

### Cryptocurrency Integration (Bitcoin/Ethereum)

```typescript
// services/economy/src/payments/crypto-provider.ts
import { Client, resources } from 'coinbase-commerce-node';

export class CryptoProvider implements PaymentProvider {
  private client: typeof Client;

  constructor() {
    Client.init(process.env.COINBASE_COMMERCE_API_KEY!);
    this.client = Client;
  }

  async createPayment(params: PaymentParams): Promise<PaymentIntent> {
    const charge = await resources.Charge.create({
      name: `${params.gemAmount} Gems`,
      description: 'ElementaMon Premium Currency',
      local_price: {
        amount: params.amount.toString(),
        currency: 'USD',
      },
      pricing_type: 'fixed_price',
      metadata: {
        user_id: params.userId,
        bundle_id: params.bundleId,
      },
      redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    return {
      id: charge.id,
      url: charge.hosted_url,
      status: 'pending',
      addresses: {
        bitcoin: charge.addresses?.bitcoin,
        ethereum: charge.addresses?.ethereum,
      },
      expiresAt: new Date(charge.expires_at),
    };
  }

  async handleWebhook(signature: string, payload: string): Promise<void> {
    const event = Webhook.verifyEventBody(payload, signature, process.env.COINBASE_WEBHOOK_SECRET!);

    if (event.type === 'charge:confirmed') {
      await this.fulfillOrder(event.data);
    }
  }
}
```

### PayPal Integration

```typescript
// services/economy/src/payments/paypal-provider.ts
import paypal from '@paypal/checkout-server-sdk';

export class PayPalProvider implements PaymentProvider {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );
    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createPayment(params: PaymentParams): Promise<PaymentIntent> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: params.amount.toFixed(2),
          },
          description: `${params.gemAmount} Gems`,
        },
      ],
      application_context: {
        brand_name: 'ElementaMon',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment/paypal/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    });

    const order = await this.client.execute(request);
    const approvalUrl = order.result.links.find((link: any) => link.rel === 'approve')?.href;

    return {
      id: order.result.id,
      url: approvalUrl,
      status: 'pending',
    };
  }

  async capturePayment(orderId: string): Promise<boolean> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await this.client.execute(request);

    if (capture.result.status === 'COMPLETED') {
      await this.fulfillOrder(capture.result);
      return true;
    }

    return false;
  }
}
```

### Gem Bundles

```typescript
interface GemBundle {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  totalGems: number;
  price: {
    usd: number;
    brl: number;
    eur: number;
  };
  popular?: boolean;
  bestValue?: boolean;
  firstTimeBonusMultiplier?: number; // 2x gems on first purchase
}

const GEM_BUNDLES: GemBundle[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    gems: 60,
    bonusGems: 0,
    totalGems: 60,
    price: { usd: 0.99, brl: 4.99, eur: 0.99 },
  },
  {
    id: 'small',
    name: 'Small Pack',
    gems: 300,
    bonusGems: 30,
    totalGems: 330,
    price: { usd: 4.99, brl: 24.99, eur: 4.99 },
  },
  {
    id: 'medium',
    name: 'Medium Pack',
    gems: 980,
    bonusGems: 120,
    totalGems: 1100,
    price: { usd: 9.99, brl: 49.99, eur: 9.99 },
    popular: true,
  },
  {
    id: 'large',
    name: 'Large Pack',
    gems: 1980,
    bonusGems: 520,
    totalGems: 2500,
    price: { usd: 19.99, brl: 99.99, eur: 19.99 },
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    gems: 3280,
    bonusGems: 1320,
    totalGems: 4600,
    price: { usd: 29.99, brl: 149.99, eur: 29.99 },
    bestValue: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    gems: 6560,
    bonusGems: 3440,
    totalGems: 10000,
    price: { usd: 49.99, brl: 249.99, eur: 49.99 },
    bestValue: true,
  },
];
```

---

## 🎟️ Coupon System

### Coupon Types

```typescript
interface Coupon {
  code: string;
  type: CouponType;
  value: CouponReward;
  restrictions: CouponRestrictions;
  usage: CouponUsage;
  validity: {
    startDate: Date;
    endDate: Date;
  };
  metadata?: {
    campaign?: string;
    source?: string;
    notes?: string;
  };
}

enum CouponType {
  GEMS = 'gems',
  TICKETS = 'tickets',
  BUNDLE = 'bundle',
  DISCOUNT = 'discount',
  SPECIAL_PET = 'special_pet',
  PREMIUM_PASS = 'premium_pass',
}

interface CouponReward {
  type: CouponType;
  amount?: number; // For gems, tickets
  percentage?: number; // For discounts
  bundleId?: string; // For bundle rewards
  petId?: string; // For special pet rewards
  passDuration?: number; // For premium pass (days)
}

interface CouponRestrictions {
  minLevel?: number;
  maxUsesPerUser: number;
  maxUsesTotal?: number;
  newUsersOnly?: boolean;
  regions?: string[]; // Country codes
  platforms?: ('web' | 'mobile' | 'desktop')[];
}

interface CouponUsage {
  totalUses: number;
  usedBy: string[]; // User IDs
  createdAt: Date;
  lastUsedAt?: Date;
}
```

### Coupon Examples

```typescript
const EXAMPLE_COUPONS: Coupon[] = [
  // Welcome coupon for new players
  {
    code: 'WELCOME2025',
    type: CouponType.GEMS,
    value: { type: CouponType.GEMS, amount: 500 },
    restrictions: {
      maxUsesPerUser: 1,
      newUsersOnly: true,
    },
    validity: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
    },
  },

  // Streamer partnership code
  {
    code: 'STREAMER-ABC',
    type: CouponType.BUNDLE,
    value: {
      type: CouponType.BUNDLE,
      bundleId: 'streamer-starter-pack',
    },
    restrictions: {
      maxUsesPerUser: 1,
      maxUsesTotal: 1000,
    },
    validity: {
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-12-31'),
    },
    metadata: {
      campaign: 'Streamer Partnership',
      source: 'streamer-abc',
    },
  },

  // Holiday event code
  {
    code: 'XMAS2025',
    type: CouponType.SPECIAL_PET,
    value: {
      type: CouponType.SPECIAL_PET,
      petId: 'snowmon-legendary',
    },
    restrictions: {
      maxUsesPerUser: 1,
    },
    validity: {
      startDate: new Date('2025-12-20'),
      endDate: new Date('2026-01-05'),
    },
  },

  // Black Friday discount
  {
    code: 'BLACKFRIDAY50',
    type: CouponType.DISCOUNT,
    value: {
      type: CouponType.DISCOUNT,
      percentage: 50,
    },
    restrictions: {
      maxUsesPerUser: 1,
    },
    validity: {
      startDate: new Date('2025-11-24'),
      endDate: new Date('2025-11-27'),
    },
  },

  // Referral reward
  {
    code: 'REF-ABC123XYZ', // Unique per user
    type: CouponType.GEMS,
    value: {
      type: CouponType.GEMS,
      amount: 500,
    },
    restrictions: {
      maxUsesPerUser: 1,
      maxUsesTotal: 1,
      newUsersOnly: true,
    },
    validity: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
    },
  },
];
```

### Coupon Service Implementation

```typescript
// services/economy/src/services/coupon.service.ts
export class CouponService {
  async redeemCoupon(userId: string, code: string): Promise<CouponRedemptionResult> {
    // Normalize code (uppercase, trim)
    code = code.toUpperCase().trim();

    // Fetch coupon from database
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    // Validate coupon
    await this.validateCoupon(coupon, userId);

    // Redeem coupon
    const reward = await this.applyCouponReward(userId, coupon);

    // Update usage tracking
    await this.updateCouponUsage(code, userId);

    // Log redemption
    await this.logCouponRedemption(userId, code, reward);

    return {
      success: true,
      reward,
      message: this.getRewardMessage(coupon),
    };
  }

  private async validateCoupon(coupon: Coupon, userId: string): Promise<void> {
    const now = new Date();

    // Check validity dates
    if (now < coupon.validity.startDate) {
      throw new Error('Coupon is not yet active');
    }
    if (now > coupon.validity.endDate) {
      throw new Error('Coupon has expired');
    }

    // Check user usage limit
    const userUsageCount = coupon.usage.usedBy.filter((id) => id === userId).length;
    if (userUsageCount >= coupon.restrictions.maxUsesPerUser) {
      throw new Error('You have already used this coupon');
    }

    // Check total usage limit
    if (
      coupon.restrictions.maxUsesTotal &&
      coupon.usage.totalUses >= coupon.restrictions.maxUsesTotal
    ) {
      throw new Error('Coupon usage limit reached');
    }

    // Check new user restriction
    if (coupon.restrictions.newUsersOnly) {
      const user = await this.getUserProfile(userId);
      if (user.createdAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        throw new Error('This coupon is only for new players');
      }
    }

    // Check level restriction
    if (coupon.restrictions.minLevel) {
      const user = await this.getUserProfile(userId);
      if (user.level < coupon.restrictions.minLevel) {
        throw new Error(`You must be level ${coupon.restrictions.minLevel} to use this coupon`);
      }
    }

    // Check region restriction
    if (coupon.restrictions.regions) {
      const user = await this.getUserProfile(userId);
      if (!coupon.restrictions.regions.includes(user.country)) {
        throw new Error('This coupon is not available in your region');
      }
    }
  }

  private async applyCouponReward(userId: string, coupon: Coupon): Promise<any> {
    switch (coupon.type) {
      case CouponType.GEMS:
        await this.awardGems(userId, coupon.value.amount!);
        return { gems: coupon.value.amount };

      case CouponType.TICKETS:
        await this.awardTickets(userId, coupon.value.amount!);
        return { tickets: coupon.value.amount };

      case CouponType.BUNDLE:
        const bundle = await this.getBundle(coupon.value.bundleId!);
        await this.awardBundle(userId, bundle);
        return { bundle: bundle.name };

      case CouponType.SPECIAL_PET:
        const pet = await this.getPet(coupon.value.petId!);
        await this.awardPet(userId, pet);
        return { pet: pet.name, rarity: pet.rarity };

      case CouponType.PREMIUM_PASS:
        await this.activatePremiumPass(userId, coupon.value.passDuration!);
        return { premiumDays: coupon.value.passDuration };

      case CouponType.DISCOUNT:
        await this.applyDiscount(userId, coupon.value.percentage!);
        return { discountPercentage: coupon.value.percentage };

      default:
        throw new Error('Unknown coupon type');
    }
  }

  async generateReferralCode(userId: string): Promise<string> {
    // Generate unique referral code for user
    const code = `REF-${this.generateRandomString(10)}`;

    await this.createCoupon({
      code,
      type: CouponType.GEMS,
      value: { type: CouponType.GEMS, amount: 500 },
      restrictions: {
        maxUsesPerUser: 1,
        maxUsesTotal: 1,
        newUsersOnly: true,
      },
      validity: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
      metadata: {
        campaign: 'Referral Program',
        source: `user-${userId}`,
      },
    });

    return code;
  }
}
```

### Coupon UI Component

```typescript
// components/shop/coupon-input.component.ts
@Component({
  selector: 'app-coupon-input',
  template: `
    <div class="coupon-input-container">
      <h3>Have a Coupon Code?</h3>

      <form (submit)="redeemCoupon()" [formGroup]="couponForm">
        <div class="input-group">
          <input
            type="text"
            formControlName="code"
            placeholder="Enter coupon code"
            [class.error]="hasError()"
            maxlength="20"
          />
          <button type="submit" [disabled]="isRedeeming() || !couponForm.valid">
            {{ isRedeeming() ? 'Redeeming...' : 'Redeem' }}
          </button>
        </div>

        <p class="error-message" *ngIf="errorMessage()">
          {{ errorMessage() }}
        </p>

        <p class="success-message" *ngIf="successMessage()">
          {{ successMessage() }}
        </p>
      </form>

      <!-- Recent Coupons -->
      <div class="recent-coupons" *ngIf="recentCoupons().length > 0">
        <h4>Recently Used</h4>
        <div class="coupon-list">
          <div *ngFor="let coupon of recentCoupons()" class="coupon-item">
            <span class="code">{{ coupon.code }}</span>
            <span class="reward">{{ coupon.rewardDescription }}</span>
            <span class="date">{{ coupon.usedAt | date }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
})
export class CouponInputComponent {
  private couponService = inject(CouponService);

  couponForm = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  isRedeeming = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  recentCoupons = signal<any[]>([]);

  async redeemCoupon() {
    if (!this.couponForm.valid) return;

    this.isRedeeming.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const code = this.couponForm.value.code!;

    try {
      const result = await this.couponService.redeemCoupon(code);

      this.successMessage.set(result.message);
      this.couponForm.reset();

      // Show reward animation
      this.showRewardAnimation(result.reward);

      // Refresh recent coupons
      this.loadRecentCoupons();
    } catch (error: any) {
      this.errorMessage.set(error.message);
    } finally {
      this.isRedeeming.set(false);
    }
  }
}
```

### Referral System

```typescript
// services/economy/src/services/referral.service.ts
export class ReferralService {
  async createReferralLink(userId: string): Promise<string> {
    // Generate unique referral code
    const code = await this.couponService.generateReferralCode(userId);

    // Create referral tracking entry
    await this.createReferralTracking(userId, code);

    // Generate shareable link
    const link = `https://elementamon.com/join?ref=${code}`;

    return link;
  }

  async trackReferral(referralCode: string, newUserId: string): Promise<void> {
    // Find referrer
    const referrer = await this.getReferrerByCode(referralCode);
    if (!referrer) return;

    // Award referrer
    await this.awardGems(referrer.userId, 500);

    // Award new user (will be applied when they redeem the coupon)
    // Coupon redemption handled separately

    // Update referral stats
    await this.updateReferralStats(referrer.userId, newUserId);
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    return {
      totalReferrals: 10,
      activeReferrals: 7,
      totalRewardsEarned: 5000,
      referralLink: await this.createReferralLink(userId),
    };
  }
}
```

---

## 📊 Shop UI Implementation

```typescript
// components/shop/shop.component.ts
@Component({
  selector: 'app-shop',
  template: `
    <div class="shop-container">
      <app-shop-header [playerCurrency]="playerCurrency()" />

      <mat-tab-group>
        <!-- Gem Bundles Tab -->
        <mat-tab label="💎 Gems">
          <div class="bundles-grid">
            <app-gem-bundle
              *ngFor="let bundle of gemBundles"
              [bundle]="bundle"
              (purchase)="purchaseBundle($event)"
            />
          </div>
        </mat-tab>

        <!-- Gacha Tab -->
        <mat-tab label="🎲 Gacha">
          <app-gacha-portal />
        </mat-tab>

        <!-- Tickets Tab -->
        <mat-tab label="🎫 Tickets">
          <div class="tickets-grid">
            <app-ticket-bundle
              *ngFor="let ticket of ticketBundles"
              [ticket]="ticket"
              (purchase)="purchaseTicket($event)"
            />
          </div>
        </mat-tab>

        <!-- Premium Pass Tab -->
        <mat-tab label="⭐ Premium Pass">
          <app-premium-pass-details />
        </mat-tab>

        <!-- Coupon Tab -->
        <mat-tab label="🎟️ Coupons">
          <app-coupon-input />
          <app-referral-system />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class ShopComponent {
  playerCurrency = signal<PlayerCurrency>({
    gold: 5000,
    gems: 150,
    dust: 300,
    tickets: { standard: 2, featured: 0, premium: 1 },
  });
}
```

---

## 🎯 Monetization Strategy Summary

### Revenue Streams

1. **Gem Bundles** (Primary)
   - $0.99 to $49.99 packages
   - First-time purchase bonuses
   - Limited-time offers

2. **Monthly Premium Pass** ($4.99/month)
   - Ad-free experience
   - Daily gem bonuses
   - Exclusive rewards

3. **Gacha System**
   - Fair pity system (no predatory mechanics)
   - Guaranteed rare drops
   - Optional, all pets obtainable through gameplay

4. **Advertisement Revenue**
   - Rewarded videos (optional)
   - Non-intrusive banners
   - Limited daily watches

5. **Special Bundles**
   - Starter packs
   - Event bundles
   - Streamer partnership packs

### Player-Friendly Practices

✅ **No Pay-to-Win**: Purchases don't affect PvP balance
✅ **Generous Free Currency**: Daily missions, achievements
✅ **Pity System**: Guaranteed drops prevent bad luck
✅ **Free Path**: All pets obtainable without spending
✅ **Transparent Rates**: Clear drop rate disclosure
✅ **No Loot Boxes**: Direct purchases available
✅ **Ad-Free Option**: Premium pass removes ads
✅ **Referral Rewards**: Earn by inviting friends

---

## 📈 Analytics & Tracking

```typescript
interface MonetizationMetrics {
  // Revenue
  totalRevenue: number;
  revenueByMethod: Record<PaymentMethod, number>;
  revenueByBundle: Record<string, number>;

  // Conversion
  conversionRate: number; // Free → Paying
  avgRevenuePerUser: number; // ARPU
  avgRevenuePerPayingUser: number; // ARPPU

  // Gacha
  totalGachaPulls: number;
  pullsByPool: Record<string, number>;
  avgPullsPerUser: number;
  pityTriggerRate: number;

  // Ads
  totalAdViews: number;
  adRevenue: number;
  avgAdsPerUser: number;

  // Coupons
  totalCouponRedemptions: number;
  redemptionsByType: Record<CouponType, number>;
  referralConversion: number;
}
```

---

## 🔒 Compliance & Regulations

### Age Rating Considerations

- **ESRB**: E10+ or T rating
- **PEGI**: 12+ rating
- **Gacha disclosure**: Required in many regions

### Required Disclosures

- ✅ Drop rates displayed in-game
- ✅ Spending limits for minors
- ✅ Refund policy clearly stated
- ✅ Terms of service
- ✅ Privacy policy (COPPA, GDPR compliant)

### Regional Requirements

- **Japan**: Gacha rate disclosure, "complete gacha" ban
- **China**: Gacha rate disclosure, real-name verification
- **EU**: GDPR compliance, loot box regulations
- **USA**: COPPA for users under 13

---

## 📝 Summary

ElementaMon's monetization system balances **fair free-to-play mechanics** with **multiple revenue streams**:

✅ **Gacha System** - Fair pity system with guaranteed drops
✅ **Multiple Payment Methods** - Credit card, PayPal, PIX, Bitcoin, Ethereum
✅ **Optional Ads** - Rewarded videos with daily limits
✅ **Coupon System** - Promotional codes, referrals, events
✅ **Premium Pass** - Monthly subscription for ad-free experience
✅ **Transparent Pricing** - Clear costs and drop rates
✅ **No Pay-to-Win** - Cosmetics only, balanced gameplay
✅ **Generous Free Path** - All content accessible without spending

**Estimated Development Time**: 6-8 weeks for complete monetization system (2 backend + 2 frontend developers)
