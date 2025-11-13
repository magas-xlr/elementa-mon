# 🚀 ElementaMon - Complete Deployment Guide

## Overview

This guide covers all deployment options for ElementaMon, from local development to production deployment with Docker and CI/CD.

---

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Docker Setup](#docker-setup)
3. [Backend Microservices](#backend-microservices)
4. [Production Deployment](#production-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## 1. Development Setup

### Local Development (Manual)

```powershell
# Install dependencies
pnpm install

# Build UI components
npx nx build ui-components

# Start shell (host)
npx nx serve shell

# Start remotes (in separate terminals)
npx nx serve home --port 4201
npx nx serve deck-builder --port 4202
# ... etc
```

### Docker Development (Recommended)

```powershell
# Start all services
.\docker-start.ps1

# Or with docker-compose directly
docker-compose -f docker-compose.dev.yml up -d

# View logs
.\docker-logs.ps1

# Check status
.\docker-status.ps1

# Stop all
.\docker-stop.ps1
```

---

## 2. Docker Setup

### Architecture

```
Docker Stack
├── Angular Apps (8 containers)
│   ├── shell:4200
│   ├── home:4201
│   ├── deck-builder:4202
│   ├── battle:4203
│   ├── world-map:4204
│   ├── inventory:4205
│   ├── avatar-customization:4206
│   └── game-over:4207
├── Databases (3 containers)
│   ├── PostgreSQL:5432
│   ├── MongoDB:27017
│   └── Redis:6379
└── Microservices (8 containers)
    ├── auth-service:3001
    ├── cards-service:3002
    ├── fight-service:3003
    ├── world-service:3004
    ├── character-service:3005
    ├── economy-service:3006
    ├── skins-service:3007
    └── ai-service:3008
```

### Docker Files

| File                       | Purpose                            |
| -------------------------- | ---------------------------------- |
| `Dockerfile.angular`       | Development build for Angular apps |
| `Dockerfile.microservices` | Backend Node.js services           |
| `Dockerfile.production`    | Production-optimized with nginx    |
| `docker-compose.dev.yml`   | Development stack (19 services)    |
| `docker-compose.prod.yml`  | Production stack (nginx serving)   |

### Commands

```powershell
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml scale shell=3

# Specific service
docker-compose -f docker-compose.dev.yml restart shell
docker-compose -f docker-compose.dev.yml logs -f home
```

---

## 3. Backend Microservices

### Service Overview

| Service   | Port | Database   | Purpose                              |
| --------- | ---- | ---------- | ------------------------------------ |
| auth      | 3001 | PostgreSQL | Authentication, users, sessions      |
| cards     | 3002 | MongoDB    | Card data, decks                     |
| fight     | 3003 | MongoDB    | Battle logic, matchmaking            |
| world     | 3004 | MongoDB    | World generation, dungeons           |
| character | 3005 | MongoDB    | Player characters, progress          |
| economy   | 3006 | MongoDB    | Items, trading, marketplace          |
| skins     | 3007 | MongoDB    | Cosmetics, customization             |
| ai        | 3008 | MongoDB    | AI integrations (OpenAI, ElevenLabs) |

### Environment Variables

Each service requires these environment variables:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://elementamon:elementamon_dev_pass@mongodb:27017/elementamon?authSource=admin
DATABASE_URL=postgresql://elementamon:elementamon_dev_pass@postgres:5432/elementamon
REDIS_URL=redis://:elementamon_dev_pass@redis:6379
JWT_SECRET=your_jwt_secret
```

### Adding a New Microservice

1. **Create service directory**:

   ```bash
   mkdir -p services/my-service/src
   cd services/my-service
   ```

2. **Add to Dockerfile.microservices**:

   ```dockerfile
   FROM base AS my-service
   WORKDIR /app/services/my-service
   EXPOSE 3009
   CMD ["node", "src/index.js"]
   ```

3. **Add to docker-compose.dev.yml**:
   ```yaml
   my-service:
     build:
       context: .
       dockerfile: Dockerfile.microservices
       target: my-service
     container_name: elementamon-my-service
     ports:
       - '3009:3009'
     volumes:
       - ./services/my-service:/app/services/my-service
       - /app/node_modules
     networks:
       - elementamon-network
     environment:
       - NODE_ENV=development
       - PORT=3009
     depends_on:
       - mongodb
       - redis
   ```

---

## 4. Production Deployment

### Production Docker Build

```powershell
# Build all production images
docker-compose -f docker-compose.prod.yml build

# Build specific app
docker build -f Dockerfile.production --build-arg APP_NAME=shell -t elementamon-shell:latest .

# Run production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Production Features

- ✅ **Nginx** serving static files
- ✅ **Gzip compression** enabled
- ✅ **Security headers** configured
- ✅ **Health checks** for all services
- ✅ **Resource limits** defined
- ✅ **Non-root user** for security
- ✅ **Optimized caching** (1 year for assets)

### nginx Configuration

Located at `docker/nginx.conf`:

- Serves Angular SPA with proper routing
- Caches static assets (JS, CSS, images)
- Security headers (CSP, X-Frame-Options)
- Gzip compression
- Health check endpoint: `/health`

### Environment Variables for Production

Create `.env.production`:

```env
NODE_ENV=production

# API URLs
API_URL=https://api.elementamon.com
GRAPHQL_ENDPOINT=https://api.elementamon.com/graphql
WEBSOCKET_ENDPOINT=wss://api.elementamon.com/ws

# Databases
DATABASE_URL=postgresql://prod_user:prod_pass@db.elementamon.com:5432/elementamon
MONGODB_URI=mongodb://prod_user:prod_pass@mongo.elementamon.com:27017/elementamon
REDIS_URL=redis://:prod_pass@redis.elementamon.com:6379

# Auth
JWT_SECRET=${JWT_SECRET}
OPENID_ISSUER=https://auth.elementamon.com

# AI Services
OPENAI_API_KEY=${OPENAI_API_KEY}
ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}

# Cloud Services
AWS_REGION=us-east-1
AWS_S3_BUCKET=elementamon-prod-assets
AZURE_BLOB_CONNECTION_STRING=${AZURE_BLOB_CONNECTION_STRING}

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
APPLICATION_INSIGHTS_KEY=${APPLICATION_INSIGHTS_KEY}
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Main CI/CD Pipeline (`.github/workflows/docker-ci.yml`)

**Triggers**: Push to `main` or `develop`, Pull Requests

**Jobs**:

1. **Build Angular** - Matrix build all 8 apps
2. **Build Docker** - Create and push Docker images
3. **Integration Tests** - E2E tests with Docker Compose
4. **Security Scan** - Trivy + npm audit
5. **Deploy Staging** - Auto-deploy to staging on main
6. **Performance Tests** - Lighthouse CI + k6 load tests

#### 2. Simple CI (`.github/workflows/ci.yml`)

**Triggers**: Push, Pull Requests

**Jobs**:

- Build affected apps with Nx
- Test affected apps
- Lint affected code

### Secrets Required

Add these to GitHub Repository Secrets:

```
GITHUB_TOKEN (auto-provided)
CODECOV_TOKEN
SLACK_WEBHOOK
OPENAI_API_KEY
ELEVENLABS_API_KEY
AZURE_BLOB_CONNECTION_STRING
SENTRY_DSN
```

### Workflow Examples

```powershell
# Manual workflow dispatch
gh workflow run docker-ci.yml

# View workflow runs
gh run list

# View logs
gh run view <run-id> --log

# Cancel running workflow
gh run cancel <run-id>
```

### Container Registry

Images are pushed to **GitHub Container Registry** (ghcr.io):

```bash
# Pull latest image
docker pull ghcr.io/magas-xlr/elementamon/shell:latest

# Pull specific commit
docker pull ghcr.io/magas-xlr/elementamon/shell:abc123

# Login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

---

## 6. Kubernetes Deployment

### Kubernetes Manifests (Coming Soon)

```yaml
# k8s/shell-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elementamon-shell
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shell
  template:
    metadata:
      labels:
        app: shell
    spec:
      containers:
        - name: shell
          image: ghcr.io/magas-xlr/elementamon/shell:latest
          ports:
            - containerPort: 80
          resources:
            limits:
              cpu: '1'
              memory: 512Mi
            requests:
              cpu: 500m
              memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: shell-service
spec:
  selector:
    app: shell
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

### Helm Chart (Planned)

```bash
# Install with Helm
helm install elementamon ./helm-chart

# Upgrade
helm upgrade elementamon ./helm-chart

# Rollback
helm rollback elementamon 1
```

---

## 7. Monitoring & Logging

### Application Monitoring

**Sentry** (Error Tracking):

```typescript
// apps/shell/src/main.ts
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 1.0,
});
```

**Azure Application Insights**:

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: environment.appInsightsKey,
  },
});
appInsights.loadAppInsights();
```

### Docker Monitoring

```powershell
# View resource usage
docker stats

# View logs
docker-compose -f docker-compose.dev.yml logs -f --tail=100

# Export logs
docker-compose -f docker-compose.dev.yml logs > logs.txt

# Check health
docker inspect --format='{{.State.Health.Status}}' elementamon-shell
```

### Prometheus + Grafana (Optional)

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3000:3000'
    volumes:
      - grafana_data:/var/lib/grafana
```

---

## 8. Troubleshooting

### Common Issues

#### Docker Build Fails

```powershell
# Clear build cache
docker builder prune -a

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache

# Check logs
docker-compose -f docker-compose.dev.yml logs
```

#### Services Won't Start

```powershell
# Check ports
netstat -ano | findstr :4200

# Check Docker resources
docker system df

# Clean up
docker system prune -a
```

#### Module Resolution Errors

```powershell
# Rebuild ui-components
npx nx build ui-components --skip-nx-cache

# Clear Nx cache
npx nx reset

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Performance Issues

1. **Increase Docker Resources**:
   - Docker Desktop → Settings → Resources
   - CPU: 4+ cores
   - Memory: 8GB+
   - Swap: 2GB

2. **Use Named Volumes**:

   ```yaml
   volumes:
     - node_modules:/app/node_modules
   ```

3. **Disable Services**:
   ```powershell
   # Start only essential services
   docker-compose -f docker-compose.dev.yml up shell home postgres
   ```

---

## Quick Reference

### Development Commands

```powershell
# Start everything
.\docker-start.ps1

# View all logs
.\docker-logs.ps1

# Check status
.\docker-status.ps1

# Stop everything
.\docker-stop.ps1

# Restart service
docker-compose -f docker-compose.dev.yml restart shell

# Rebuild service
docker-compose -f docker-compose.dev.yml up -d --build shell
```

### Production Commands

```powershell
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml scale shell=3 home=2

# Update single service
docker-compose -f docker-compose.prod.yml up -d --no-deps shell
```

### Monitoring Commands

```powershell
# Resource usage
docker stats

# Health checks
docker ps --filter health=unhealthy

# Logs
docker-compose -f docker-compose.dev.yml logs -f --tail=100 shell

# Inspect container
docker inspect elementamon-shell

# Execute command
docker exec -it elementamon-shell sh
```

---

## Support

For additional help:

- **Docker Issues**: [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Module Federation**: [MODULE_FEDERATION.md](MODULE_FEDERATION.md)
- **GitHub Issues**: https://github.com/magas-xlr/elementa-mon/issues

---

**🎮 ElementaMon - Collect, Build, Battle!**
