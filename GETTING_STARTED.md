# 🎮 ElementaMon - Quick Start Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 22.11.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **Docker** >= 24.0 ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```powershell
# Install all packages (this will take 5-10 minutes)
pnpm install
```

### 2️⃣ Set Up Environment

```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env and add your configuration
# At minimum, set database passwords
```

### 3️⃣ Start Development Servers

**Option A: Docker Compose (Recommended)**

```powershell
# Start all services (databases + microservices)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Local Development**

```powershell
# Terminal 1: Start databases
docker-compose up postgres mongodb redis

# Terminal 2: Start Angular shell
pnpm dev:shell

# Terminal 3: Start a microservice
pnpm dev:auth
```

### 4️⃣ Access Applications

Once running, you can access:

- **Game Shell**: http://localhost:4200
- **Backoffice Admin**: http://localhost:3000
- **Marketing Site**: http://localhost:3100
- **Auth Service**: http://localhost:3001
- **Pets Service**: http://localhost:3002
- **Battle Service**: http://localhost:3003

---

## 📦 Project Structure Overview

```
elementa-mon/
├── apps/                       # Angular microfrontend applications
│   ├── shell/                  # Main application shell (Module Federation host)
│   ├── home/                   # Home/landing microfrontend
│   ├── deck-builder/           # Deck management
│   ├── battle/                 # Battle arena
│   ├── world-map/              # Dungeon navigation
│   ├── inventory/              # Inventory management
│   ├── avatar-customization/   # Character customization
│   └── game-over/              # Game over/rewards
├── libs/                       # Shared libraries
│   ├── shared/                 # Cross-cutting concerns
│   │   ├── models/             # TypeScript interfaces
│   │   ├── ui-components/      # Reusable UI components
│   │   ├── data-access/        # API clients
│   │   └── utils/              # Utility functions
│   └── game/                   # Game-specific libraries
│       ├── state/              # NgRx store
│       ├── battle/             # Battle logic
│       ├── pets/               # Pet management
│       └── cards/              # Card system
├── services/                   # Node.js microservices
│   ├── auth/                   # Authentication service
│   ├── pets/                   # Pet data service
│   ├── battle/                 # Battle logic service
│   ├── inventory/              # Inventory service
│   ├── progression/            # Leveling/progression
│   ├── social/                 # Social features
│   ├── monetization/           # Payments/gacha
│   └── analytics/              # Analytics service
├── backoffice/                 # Next.js 15 admin platform
├── marketing-site/             # Nuxt 3 marketing website
├── docker/                     # Docker configurations
│   ├── Dockerfile.service      # Microservices Dockerfile
│   ├── Dockerfile.app          # Angular apps Dockerfile
│   └── nginx.conf              # Nginx configuration
├── .github/                    # GitHub Actions CI/CD
└── docs/                       # Documentation
```

---

## 🛠️ Development Commands

### Building

```powershell
# Build specific app
pnpm nx build shell

# Build all apps
pnpm build

# Build affected (based on git changes)
pnpm build:affected

# Production build
pnpm nx build shell --configuration=production
```

### Testing

```powershell
# Run unit tests
pnpm test

# Run specific app tests
pnpm nx test shell

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage

# Run affected tests
pnpm test:affected
```

### Linting & Formatting

```powershell
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check
```

### Code Generation

```powershell
# Generate new Angular app
pnpm nx g @nx/angular:app my-app --standalone --routing --style=scss

# Generate new Angular library
pnpm nx g @nx/angular:lib my-lib --directory=libs/shared/my-lib

# Generate new component
pnpm nx g @nx/angular:component my-component --project=shell --standalone

# Generate new Node.js service
pnpm nx g @nx/node:app my-service --directory=services/my-service

# Generate NgRx store
pnpm nx g @nx/angular:ngrx-root-store --project=shell --minimal=false
```

### Storybook

```powershell
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build:storybook
```

### Docker

```powershell
# Build all Docker images
docker-compose build

# Build specific service
docker-compose build auth-service

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Remove volumes (reset databases)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

---

## 🗄️ Database Setup

### PostgreSQL (Auth, Backoffice)

```powershell
# Access PostgreSQL container
docker exec -it elementamon-postgres psql -U postgres -d elementamon

# Run migrations
pnpm nx run backoffice:prisma:migrate

# Seed database
pnpm nx run backoffice:prisma:seed

# Open Prisma Studio
pnpm nx run backoffice:prisma:studio
```

### MongoDB (Game Data)

```powershell
# Access MongoDB container
docker exec -it elementamon-mongodb mongosh -u admin -p admin123

# Use game database
use elementamon_game

# List collections
show collections

# Query pets
db.pets.find().pretty()
```

### Redis (Cache)

```powershell
# Access Redis container
docker exec -it elementamon-redis redis-cli -a redis123

# Check cached keys
KEYS *

# Get value
GET some:key

# Flush all cache
FLUSHALL
```

---

## 🔧 Nx Commands

### Dependency Graph

```powershell
# View project dependency graph
pnpm nx graph

# Open in browser
pnpm nx graph --open
```

### Affected Commands

```powershell
# See what's affected by your changes
pnpm nx affected:graph

# Test affected projects
pnpm nx affected:test

# Build affected projects
pnpm nx affected:build

# Lint affected projects
pnpm nx affected:lint
```

### Run Many

```powershell
# Run target on all projects
pnpm nx run-many --target=test --all

# Run on specific projects
pnpm nx run-many --target=build --projects=shell,home,battle
```

---

## 🌐 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Databases
DATABASE_URL=postgresql://postgres:password@localhost:5432/elementamon
MONGODB_URI=mongodb://admin:password@localhost:27017/elementamon_game
REDIS_URL=redis://:password@localhost:6379

# Authentication
JWT_SECRET=your_secret_key
NEXTAUTH_SECRET=your_nextauth_secret

# Payment Providers
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your_paypal_id

# AI Services
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=your_key

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

---

## 📊 Monitoring & Debugging

### Application Logs

```powershell
# View specific service logs
docker-compose logs -f auth-service

# View all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Performance Profiling

```powershell
# Angular DevTools (Chrome Extension)
# https://chrome.google.com/webstore/detail/angular-devtools

# Nx Console (VS Code Extension)
# Install from VS Code marketplace
```

### Database Monitoring

```powershell
# PostgreSQL stats
docker exec elementamon-postgres psql -U postgres -d elementamon -c "SELECT * FROM pg_stat_activity;"

# MongoDB stats
docker exec elementamon-mongodb mongosh -u admin -p admin123 --eval "db.stats()"

# Redis info
docker exec elementamon-redis redis-cli -a redis123 INFO
```

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```powershell
# Run all tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test:coverage

# Specific test file
pnpm nx test shell --testFile=app.component.spec.ts
```

### E2E Tests (Playwright)

```powershell
# Run E2E tests
pnpm test:e2e

# Run in specific browser
pnpm test:e2e --project=chromium

# Debug mode
pnpm test:e2e --debug

# UI mode
pnpm test:e2e --ui
```

### Integration Tests

```powershell
# Test specific microservice
cd services/auth
pnpm test

# Integration test with databases
pnpm test:integration
```

---

## 🚢 Deployment

### CI/CD Pipeline

GitHub Actions automatically:

- ✅ Runs linting and type checking
- ✅ Executes unit tests
- ✅ Runs E2E tests
- ✅ Builds Docker images
- ✅ Deploys to staging/production

### Manual Deployment

```powershell
# Build production images
docker-compose -f docker-compose.prod.yml build

# Push to registry
docker-compose -f docker-compose.prod.yml push

# Deploy to Kubernetes
kubectl apply -f k8s/
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Port already in use**

```powershell
# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 4200).OwningProcess

# Kill process
Stop-Process -Id <PID>
```

**2. Nx cache issues**

```powershell
# Clear Nx cache
pnpm nx reset
```

**3. Docker issues**

```powershell
# Restart Docker daemon
# (Restart Docker Desktop)

# Prune unused containers
docker system prune -a
```

**4. Node modules issues**

```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

**5. Database connection errors**

```powershell
# Ensure Docker containers are running
docker ps

# Restart database containers
docker-compose restart postgres mongodb redis
```

---

## 📚 Additional Resources

- **Main Documentation**: [README.md](README.md)
- **Best Practices**: [BEST_PRACTICES.md](BEST_PRACTICES.md)
- **Monetization**: [MONETIZATION_GACHA_SPEC.md](MONETIZATION_GACHA_SPEC.md)
- **Backoffice**: [BACKOFFICE_SPEC.md](BACKOFFICE_SPEC.md)
- **Marketing Site**: [MARKETING_SITE_SPEC.md](MARKETING_SITE_SPEC.md)
- **AI Integration**: [AI_INTEGRATION.md](AI_INTEGRATION.md)
- **Battle UI**: [BATTLE_UI_SPEC.md](BATTLE_UI_SPEC.md)

### Helpful Links

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [NgRx Documentation](https://ngrx.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nuxt Documentation](https://nuxt.com)

---

## 👥 Team Conventions

### Git Workflow

```powershell
# Create feature branch
git checkout -b feat/new-feature

# Make changes and commit (follows conventional commits)
git add .
git commit -m "feat: add new pet evolution system"

# Push and create PR
git push origin feat/new-feature
```

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
Scope: shell, battle, auth-service, backoffice, etc.
```

Examples:

- `feat(battle): add turn timer to battle arena`
- `fix(auth-service): resolve JWT expiration issue`
- `docs(readme): update installation instructions`
- `perf(pets): optimize pet sprite loading`

---

## 🎓 Learning Path

For new developers:

1. **Day 1-2**: Read all documentation (README, BEST_PRACTICES, specs)
2. **Day 3**: Set up local environment and run the application
3. **Day 4-5**: Explore codebase, understand project structure
4. **Week 2**: Complete first feature/bug fix
5. **Week 3+**: Take ownership of a microfrontend or microservice

---

## ✅ Next Steps

After setup, you can:

1. **Generate your first component**:

   ```powershell
   pnpm nx g @nx/angular:component my-component --project=shell --standalone
   ```

2. **Create a new feature**:

   ```powershell
   git checkout -b feat/my-feature
   # Make changes
   pnpm test
   pnpm lint
   git commit -m "feat: add my feature"
   ```

3. **Run the full stack**:

   ```powershell
   docker-compose up -d
   pnpm dev:shell
   ```

4. **Explore Storybook**:
   ```powershell
   pnpm storybook
   ```

---

**🎮 Happy coding! Welcome to ElementaMon!**
