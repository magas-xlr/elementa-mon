# 🔧 Services - Node.js Microservices

This directory contains all backend microservices built with Node.js, Express, and TypeScript.

## 🏗️ Architecture

All microservices follow:

- **Domain-Driven Design (DDD)**
- **Clean Architecture** (separation of concerns)
- **RESTful API** and **GraphQL** endpoints
- **MongoDB/PostgreSQL** for data persistence
- **Redis** for caching and sessions
- **Docker** containerization
- **Horizontal scaling** ready

## 📦 Microservices

### 🔐 Auth Service

**Port**: 3001
**Database**: PostgreSQL
**Purpose**: Authentication and authorization

**Endpoints**:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset

**Features**:

- JWT authentication
- Password hashing (bcrypt)
- OAuth2 (Google, Discord)
- Rate limiting
- Session management
- 2FA support

**Tech Stack**: Express, Passport.js, JWT, bcrypt, PostgreSQL, Redis

---

### 🐉 Pets Service

**Port**: 3002
**Database**: MongoDB
**Purpose**: Pet data management

**Endpoints**:

- `GET /api/pets` - List all pets
- `GET /api/pets/:id` - Get pet by ID
- `POST /api/pets` - Create pet (admin)
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet
- `GET /api/pets/player/:playerId` - Get player's pets
- `POST /api/pets/:id/evolve` - Evolve pet

**GraphQL**:

```graphql
query GetPet($id: ID!) {
  pet(id: $id) {
    id
    name
    elementalType
    stats {
      hp
      attack
      defense
    }
    evolution {
      level
      nextForm
    }
  }
}
```

**Features**:

- Pet CRUD operations
- Evolution system
- Stats calculation
- Sprite management (S3)
- Pet trading
- Filtering and search

**Tech Stack**: Express, MongoDB, GraphQL, AWS S3

---

### ⚔️ Battle Service

**Port**: 3003
**Database**: MongoDB + Redis
**Purpose**: Battle logic and real-time PvP

**Endpoints**:

- `POST /api/battle/start` - Start battle
- `POST /api/battle/:id/action` - Perform action
- `GET /api/battle/:id/state` - Get battle state
- `POST /api/battle/:id/surrender` - Surrender
- `POST /api/battle/matchmaking` - Find PvP match

**WebSocket Events**:

- `battle:start` - Battle started
- `battle:turn` - Turn changed
- `battle:action` - Action performed
- `battle:end` - Battle ended

**Features**:

- Turn-based battle engine
- Damage calculation
- Type effectiveness
- Status effects
- Real-time synchronization (Socket.io)
- Battle replay system
- Anti-cheat validation

**Tech Stack**: Express, Socket.io, MongoDB, Redis

---

### 🎒 Inventory Service

**Port**: 3004
**Database**: MongoDB
**Purpose**: Item and pet inventory management

**Endpoints**:

- `GET /api/inventory/:playerId` - Get inventory
- `POST /api/inventory/add` - Add item
- `POST /api/inventory/remove` - Remove item
- `POST /api/inventory/use` - Use consumable
- `GET /api/inventory/pets/:playerId` - Get pet collection
- `POST /api/inventory/trade` - Initiate trade

**Features**:

- Item management
- Pet storage
- Trading system
- Item crafting
- Inventory limits
- Item effects

**Tech Stack**: Express, MongoDB, Redis

---

### 📈 Progression Service

**Port**: 3005
**Database**: MongoDB
**Purpose**: Player progression (XP, levels, achievements)

**Endpoints**:

- `GET /api/progression/:playerId` - Get player progress
- `POST /api/progression/xp` - Grant XP
- `GET /api/progression/achievements/:playerId` - Get achievements
- `POST /api/progression/achievement/:id/unlock` - Unlock achievement
- `GET /api/progression/leaderboard` - Get leaderboard

**Features**:

- XP calculation
- Level progression
- Achievement system
- Daily quests
- Weekly challenges
- Season pass
- Leaderboards

**Tech Stack**: Express, MongoDB, Redis

---

### 👥 Social Service

**Port**: 3006
**Database**: MongoDB + Redis
**Purpose**: Social features (friends, chat, guilds)

**Endpoints**:

- `GET /api/social/friends/:playerId` - Get friends list
- `POST /api/social/friends/add` - Send friend request
- `POST /api/social/friends/accept` - Accept friend request
- `GET /api/social/guilds` - List guilds
- `POST /api/social/guilds/create` - Create guild
- `POST /api/social/chat/send` - Send message

**WebSocket Events**:

- `friend:request` - Friend request received
- `friend:online` - Friend came online
- `chat:message` - Chat message received
- `guild:invite` - Guild invitation

**Features**:

- Friends system
- Real-time chat
- Guilds/clans
- Player profiles
- Social feed
- Voice chat integration (Agora)

**Tech Stack**: Express, Socket.io, MongoDB, Redis

---

### 💰 Monetization Service

**Port**: 3007
**Database**: PostgreSQL
**Purpose**: Payments, gacha, shop

**Endpoints**:

- `POST /api/shop/purchase` - Purchase item
- `POST /api/gacha/pull` - Perform gacha pull
- `GET /api/shop/products` - List shop items
- `POST /api/payment/stripe` - Stripe payment
- `POST /api/payment/paypal` - PayPal payment
- `POST /api/payment/pix` - PIX payment (Brazil)
- `POST /api/coupon/redeem` - Redeem coupon code

**Features**:

- Payment processing (Stripe, PayPal, PIX, Crypto)
- Gacha system with pity
- Shop management
- Coupon system
- Refunds
- Transaction history
- Fraud detection

**Tech Stack**: Express, PostgreSQL, Stripe SDK, PayPal SDK, Redis

---

### 📊 Analytics Service

**Port**: 3008
**Database**: PostgreSQL + MongoDB
**Purpose**: Game analytics and metrics

**Endpoints**:

- `POST /api/analytics/event` - Track event
- `GET /api/analytics/metrics` - Get metrics
- `GET /api/analytics/player/:playerId` - Player analytics
- `GET /api/analytics/retention` - Retention metrics
- `GET /api/analytics/revenue` - Revenue analytics

**Features**:

- Event tracking
- Player behavior analytics
- Retention metrics
- Revenue analytics
- A/B testing
- Funnel analysis
- Cohort analysis
- Real-time dashboards

**Tech Stack**: Express, PostgreSQL, MongoDB, Redis, Apache Kafka (optional)

---

## 🏗️ Microservice Structure

Each microservice follows this structure:

```
service-name/
├── src/
│   ├── controllers/           # API endpoints
│   │   └── service.controller.ts
│   ├── services/              # Business logic
│   │   └── service.service.ts
│   ├── models/                # Database models
│   │   └── service.model.ts
│   ├── repositories/          # Data access layer
│   │   └── service.repository.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/            # Input validation
│   │   └── service.validator.ts
│   ├── utils/                 # Helper functions
│   │   └── helpers.ts
│   ├── config/                # Configuration
│   │   ├── database.config.ts
│   │   └── server.config.ts
│   ├── graphql/               # GraphQL (if applicable)
│   │   ├── schema.graphql
│   │   └── resolvers.ts
│   ├── websocket/             # WebSocket handlers
│   │   └── socket.handler.ts
│   ├── main.ts                # Entry point
│   └── app.ts                 # Express app setup
├── tests/                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile                 # Docker configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # Service documentation
```

---

## 🚀 Development Commands

```powershell
# Generate new microservice
npx nx g @nx/node:app service-name --directory=services/service-name

# Start specific service
npx nx serve service-name

# Start all services with Docker
docker-compose up -d

# Build service
npx nx build service-name

# Test service
npx nx test service-name

# Lint service
npx nx lint service-name
```

---

## 🛠️ Common Patterns

### Controller Example

```typescript
// src/controllers/pets.controller.ts
import { Request, Response } from 'express';
import { PetsService } from '../services/pets.service';

export class PetsController {
  constructor(private petsService: PetsService) {}

  async getAllPets(req: Request, res: Response) {
    try {
      const pets = await this.petsService.findAll();
      res.json({ success: true, data: pets });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPetById(req: Request, res: Response) {
    try {
      const pet = await this.petsService.findById(req.params.id);
      if (!pet) {
        return res.status(404).json({ success: false, error: 'Pet not found' });
      }
      res.json({ success: true, data: pet });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
```

### Service Example

```typescript
// src/services/pets.service.ts
import { PetsRepository } from '../repositories/pets.repository';
import { Pet } from '../models/pet.model';

export class PetsService {
  constructor(private petsRepository: PetsRepository) {}

  async findAll(): Promise<Pet[]> {
    return this.petsRepository.findAll();
  }

  async findById(id: string): Promise<Pet | null> {
    return this.petsRepository.findById(id);
  }

  async evolvePet(id: string): Promise<Pet> {
    const pet = await this.findById(id);
    if (!pet) throw new Error('Pet not found');

    // Evolution logic
    pet.level += 1;
    if (pet.level >= pet.evolution.requiredLevel) {
      pet.form = pet.evolution.nextForm;
    }

    return this.petsRepository.update(id, pet);
  }
}
```

### Middleware Example

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 🔒 Security

All services implement:

- **JWT authentication**
- **Rate limiting** (express-rate-limit)
- **Helmet.js** (security headers)
- **CORS** configuration
- **Input validation** (Zod/Joi)
- **SQL injection protection**
- **XSS protection**
- **CSRF tokens**

---

## 📊 Monitoring

Each service exposes:

- `/health` - Health check endpoint
- `/metrics` - Prometheus metrics
- `/api-docs` - Swagger/OpenAPI documentation

---

## 🧪 Testing

Each service should have:

- **Unit tests** (85%+ coverage)
- **Integration tests** (API endpoints)
- **E2E tests** (full workflows)

```powershell
# Run tests
npx nx test service-name

# Run with coverage
npx nx test service-name --coverage

# Run integration tests
npx nx test service-name --testPathPattern=integration
```

---

## 🐳 Docker

Each service has its own Dockerfile:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 📚 API Documentation

Each service should document APIs with:

- **OpenAPI/Swagger** specification
- **GraphQL schema** (if applicable)
- **Postman collection**
- **Example requests/responses**

---

## 🎯 Best Practices

1. **Keep services small** - Single responsibility
2. **Stateless services** - For horizontal scaling
3. **Use DTOs** - Data Transfer Objects for validation
4. **Error handling** - Consistent error responses
5. **Logging** - Structured logging (Winston)
6. **Caching** - Use Redis for frequently accessed data
7. **Database indexing** - Optimize queries
8. **API versioning** - `/api/v1/...`
9. **Health checks** - Always implement `/health`
10. **Documentation** - Keep API docs updated
