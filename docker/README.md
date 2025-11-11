# 🐳 Docker - Container Infrastructure

Docker Compose configuration and container setup for ElementaMon development environment.

## 📖 Overview

Containerized infrastructure for:

- **PostgreSQL** - Authentication and backoffice data
- **MongoDB** - Game data (pets, battles, cards)
- **Redis** - Caching and sessions
- **8 Microservices** - Backend services
- **Development environment** - Consistent local setup

---

## 🏗️ Services

### Database Services

#### PostgreSQL

- **Container**: `postgres:16-alpine`
- **Port**: 5432
- **Database**: `elementamon_auth`
- **Username**: `postgres`
- **Password**: `postgres`
- **Volume**: `postgres_data`
- **Used by**: Auth service, Backoffice

#### MongoDB

- **Container**: `mongo:7`
- **Port**: 27017
- **Database**: `elementamon_game`
- **Volume**: `mongo_data`
- **Used by**: Pets, Battle, Inventory, Progression services

#### Redis

- **Container**: `redis:7-alpine`
- **Port**: 6379
- **Volume**: `redis_data`
- **Used by**: Caching, sessions, rate limiting

---

## 🚀 Quick Start

### Start All Services

```powershell
# Start all databases
docker-compose up -d postgres mongodb redis

# Start all microservices
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Start Specific Service

```powershell
# Start only PostgreSQL
docker-compose up -d postgres

# Start only microservices
docker-compose up -d auth-service pets-service battle-service
```

---

## 📁 Directory Structure

```
docker/
├── init-db/                        # PostgreSQL init scripts
│   ├── 01-create-databases.sql
│   └── 02-seed-data.sql
├── mongo-init/                     # MongoDB init scripts
│   ├── 01-init-collections.js
│   └── 02-seed-data.js
├── nginx/                          # Nginx reverse proxy config
│   └── nginx.conf
├── Dockerfile.auth                 # Auth service Dockerfile
├── Dockerfile.pets                 # Pets service Dockerfile
├── Dockerfile.battle               # Battle service Dockerfile
├── Dockerfile.inventory            # Inventory service Dockerfile
├── Dockerfile.progression          # Progression service Dockerfile
├── Dockerfile.social               # Social service Dockerfile
├── Dockerfile.monetization         # Monetization service Dockerfile
└── Dockerfile.analytics            # Analytics service Dockerfile
```

---

## 🔧 Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: elementamon-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: elementamon_auth
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB Database
  mongodb:
    image: mongo:7
    container_name: elementamon-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
      MONGO_INITDB_DATABASE: elementamon_game
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: elementamon-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # Auth Service
  auth-service:
    build:
      context: ../services/auth
      dockerfile: ../../docker/Dockerfile.auth
    container_name: elementamon-auth
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=development
      - PORT=3001
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/elementamon_auth
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Pets Service
  pets-service:
    build:
      context: ../services/pets
      dockerfile: ../../docker/Dockerfile.pets
    container_name: elementamon-pets
    ports:
      - '3002:3002'
    environment:
      - NODE_ENV=development
      - PORT=3002
      - MONGODB_URI=mongodb://root:root@mongodb:27017/elementamon_game?authSource=admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  # Battle Service
  battle-service:
    build:
      context: ../services/battle
      dockerfile: ../../docker/Dockerfile.battle
    container_name: elementamon-battle
    ports:
      - '3003:3003'
    environment:
      - NODE_ENV=development
      - PORT=3003
      - MONGODB_URI=mongodb://root:root@mongodb:27017/elementamon_game?authSource=admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: elementamon-nginx
    ports:
      - '80:80'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - auth-service
      - pets-service
      - battle-service
    restart: unless-stopped

volumes:
  postgres_data:
  mongo_data:
  redis_data:
```

---

## 📝 Initialization Scripts

### PostgreSQL Init Script

```sql
-- docker/init-db/01-create-databases.sql

-- Create backoffice database
CREATE DATABASE elementamon_backoffice;

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_username ON auth.users(username);
```

### MongoDB Init Script

```javascript
// docker/mongo-init/01-init-collections.js

db = db.getSiblingDB('elementamon_game');

// Create collections
db.createCollection('pets');
db.createCollection('cards');
db.createCollection('battles');
db.createCollection('inventory');

// Create indexes
db.pets.createIndex({ name: 1 });
db.pets.createIndex({ elementalType: 1 });
db.pets.createIndex({ rarity: 1 });

db.cards.createIndex({ name: 1 });
db.cards.createIndex({ type: 1 });

db.battles.createIndex({ playerId: 1 });
db.battles.createIndex({ status: 1 });

db.inventory.createIndex({ playerId: 1 });
```

---

## 🔍 Monitoring

### Health Checks

All services include health check endpoints:

```powershell
# Check PostgreSQL
docker exec elementamon-postgres pg_isready

# Check MongoDB
docker exec elementamon-mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker exec elementamon-redis redis-cli ping

# Check service health
curl http://localhost:3001/health    # Auth service
curl http://localhost:3002/health    # Pets service
curl http://localhost:3003/health    # Battle service
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 -f
```

---

## 🛠️ Development Workflow

### 1. Start Infrastructure

```powershell
# Start databases only
docker-compose up -d postgres mongodb redis

# Verify databases are running
docker ps
```

### 2. Run Services Locally (Not Containerized)

```powershell
# Run auth service locally
cd services/auth
pnpm dev

# Run pets service locally
cd services/pets
pnpm dev
```

### 3. Use Containerized Services

```powershell
# Start all services in containers
docker-compose up -d

# Rebuild after code changes
docker-compose up -d --build auth-service
```

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: PostgreSQL connection refused

```powershell
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

**Problem**: MongoDB authentication failed

```powershell
# Reset MongoDB
docker-compose down -v mongodb
docker-compose up -d mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

**Problem**: Redis connection timeout

```powershell
# Restart Redis
docker-compose restart redis

# Check Redis connection
docker exec elementamon-redis redis-cli ping
```

**Problem**: Port already in use

```powershell
# Find process using port
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /F /PID <PID>
```

---

## 🧹 Cleanup

### Remove Containers

```powershell
# Stop and remove containers
docker-compose down

# Remove containers and volumes (clean slate)
docker-compose down -v

# Remove all unused containers and images
docker system prune -a
```

### Reset Database

```powershell
# Remove only database volumes
docker volume rm elementa-mon_postgres_data
docker volume rm elementa-mon_mongo_data

# Recreate databases
docker-compose up -d postgres mongodb
```

---

## 📊 Database GUI Tools

### PostgreSQL

**pgAdmin**:

```powershell
# Run pgAdmin in Docker
docker run -p 8080:80 `
  -e PGADMIN_DEFAULT_EMAIL=admin@elementamon.com `
  -e PGADMIN_DEFAULT_PASSWORD=admin `
  -d dpage/pgadmin4
```

Access: http://localhost:8080

**Connection Details**:

- Host: `localhost` or `host.docker.internal`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `elementamon_auth`

### MongoDB

**MongoDB Compass**:

- Connection String: `mongodb://root:root@localhost:27017/?authSource=admin`

**Mongo Express** (Web UI):

```powershell
# Run Mongo Express in Docker
docker run -p 8081:8081 `
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=root `
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=root `
  -e ME_CONFIG_MONGODB_URL=mongodb://root:root@mongodb:27017/ `
  -d mongo-express
```

Access: http://localhost:8081

### Redis

**RedisInsight**:

```powershell
# Run RedisInsight in Docker
docker run -p 8001:8001 -d redis/redisinsight
```

Access: http://localhost:8001

**Connection Details**:

- Host: `localhost`
- Port: `6379`

---

## 🎯 Best Practices

1. **Use volumes** for persistent data
2. **Health checks** for all services
3. **Environment variables** for configuration
4. **Restart policies** for production
5. **Resource limits** to prevent resource exhaustion
6. **Multi-stage builds** to reduce image size
7. **Security scanning** with Trivy or Snyk
8. **Log aggregation** with ELK or Loki
9. **Backup strategies** for databases
10. **Docker Compose profiles** for different environments

---

## 🚀 Production

### Production Considerations

1. **Use Docker Swarm or Kubernetes** for orchestration
2. **Implement proper secrets management** (Vault, AWS Secrets Manager)
3. **Set up monitoring** (Prometheus, Grafana)
4. **Configure log aggregation** (ELK stack)
5. **Implement backup strategy** (automated daily backups)
6. **Use managed databases** (AWS RDS, MongoDB Atlas)
7. **Set resource limits** (CPU, memory)
8. **Enable auto-scaling**
9. **Implement health checks**
10. **Use HTTPS** with SSL certificates

---

## 📚 Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **PostgreSQL**: https://www.postgresql.org/docs
- **MongoDB**: https://docs.mongodb.com
- **Redis**: https://redis.io/documentation
