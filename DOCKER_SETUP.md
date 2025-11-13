# 🐳 Docker Setup for ElementaMon

## Overview

This Docker setup allows you to run **all 8 Angular applications** (shell + 7 remotes) and **3 databases** simultaneously with a single command.

## Architecture

```
Docker Compose Stack
├── Databases (3)
│   ├── PostgreSQL (port 5432)
│   ├── MongoDB (port 27017)
│   └── Redis (port 6379)
└── Angular Apps (8)
    ├── Shell (Host) - port 4200
    ├── Home - port 4201
    ├── Deck Builder - port 4202
    ├── Battle - port 4203
    ├── World Map - port 4204
    ├── Inventory - port 4205
    ├── Avatar Customization - port 4206
    └── Game Over - port 4207
```

## Prerequisites

- **Docker Desktop**: Version 24.0+ with Docker Compose v2.40+
- **Git**: To clone the repository
- **8GB+ RAM**: Recommended for running all containers
- **WSL2** (Windows): Enable WSL2 backend in Docker Desktop

## Quick Start

### 1. Start All Services

```powershell
# Start all containers (builds on first run)
docker-compose -f docker-compose.dev.yml up

# Start in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d

# Build from scratch
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Access Applications

| Service              | URL                   | Description                  |
| -------------------- | --------------------- | ---------------------------- |
| **Shell**            | http://localhost:4200 | Module Federation Host       |
| Home                 | http://localhost:4201 | Home remote with UI showcase |
| Deck Builder         | http://localhost:4202 | Deck building interface      |
| Battle               | http://localhost:4203 | Battle arena                 |
| World Map            | http://localhost:4204 | World exploration            |
| Inventory            | http://localhost:4205 | Inventory management         |
| Avatar Customization | http://localhost:4206 | Character customization      |
| Game Over            | http://localhost:4207 | Game over screen             |

### 3. Access Databases

| Database       | Connection String                         | Credentials                                         |
| -------------- | ----------------------------------------- | --------------------------------------------------- |
| **PostgreSQL** | `postgresql://localhost:5432/elementamon` | User: `elementamon`<br>Pass: `elementamon_dev_pass` |
| **MongoDB**    | `mongodb://localhost:27017/elementamon`   | User: `elementamon`<br>Pass: `elementamon_dev_pass` |
| **Redis**      | `redis://localhost:6379`                  | Pass: `elementamon_dev_pass`                        |

### 4. Stop All Services

```powershell
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose -f docker-compose.dev.yml down -v

# Stop and remove images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Development Workflow

### Watch Mode

All Angular apps run in **development mode** with **hot reload enabled**:

- Edit files on your host machine
- Changes are automatically detected via Docker volumes
- Browser auto-refreshes on save

### View Logs

```powershell
# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f shell
docker-compose -f docker-compose.dev.yml logs -f home
docker-compose -f docker-compose.dev.yml logs -f postgres

# View last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 -f
```

### Restart Specific Service

```powershell
# Restart a single service
docker-compose -f docker-compose.dev.yml restart shell
docker-compose -f docker-compose.dev.yml restart home

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build shell
```

### Execute Commands in Container

```powershell
# Open shell in container
docker exec -it elementamon-shell sh

# Run Nx commands
docker exec -it elementamon-shell npx nx build ui-components
docker exec -it elementamon-shell npx nx test home
docker exec -it elementamon-shell npx nx lint

# Check running processes
docker exec -it elementamon-shell ps aux
```

### Check Service Health

```powershell
# Check all container statuses
docker-compose -f docker-compose.dev.yml ps

# Check specific service
docker inspect elementamon-shell

# Check database health
docker exec -it elementamon-postgres pg_isready -U elementamon
docker exec -it elementamon-mongodb mongosh --eval "db.adminCommand('ping')"
docker exec -it elementamon-redis redis-cli -a elementamon_dev_pass ping
```

## Configuration

### Environment Variables

Edit `docker-compose.dev.yml` to customize:

```yaml
environment:
  - NODE_ENV=development
  - NX_DAEMON=false # Disable Nx daemon in container
  - API_URL=http://localhost:3001
```

### Port Mapping

To change ports, edit `docker-compose.dev.yml`:

```yaml
ports:
  - '8080:4200' # Map host port 8080 to container port 4200
```

### Memory Limits

Add resource constraints:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 2G
    reservations:
      memory: 1G
```

## Troubleshooting

### Build Failures

```powershell
# Clear Docker build cache
docker builder prune -a

# Remove all containers and rebuild
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Port Already in Use

```powershell
# Find process using port 4200
netstat -ano | findstr :4200

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.dev.yml
```

### Slow Performance

1. **Increase Docker Resources**:
   - Docker Desktop → Settings → Resources
   - Increase CPU: 4+ cores
   - Increase Memory: 8GB+
   - Increase Swap: 2GB

2. **Use Named Volumes** (faster than bind mounts on Windows):

   ```yaml
   volumes:
     - node_modules:/app/node_modules # Named volume
     - .:/app # Bind mount for source code
   ```

3. **Disable Unnecessary Services**:
   ```powershell
   # Start only shell and home
   docker-compose -f docker-compose.dev.yml up shell home
   ```

### Container Keeps Restarting

```powershell
# Check logs for errors
docker-compose -f docker-compose.dev.yml logs shell

# Common issues:
# - Port already in use
# - Build failed
# - Missing dependencies
# - Nx cache issues
```

### Hot Reload Not Working

1. **Check file permissions** (WSL2):

   ```bash
   chmod -R 755 .
   ```

2. **Increase file watchers** (Linux):

   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

3. **Use polling** (add to angular.json):
   ```json
   {
     "serve": {
       "options": {
         "poll": 2000
       }
     }
   }
   ```

## Performance Optimization

### Use Multi-stage Builds

The Dockerfile uses multi-stage builds to:

- Share base dependencies across all services
- Build ui-components library once
- Keep images small

### Volume Caching

```yaml
volumes:
  - .:/app
  - /app/node_modules # Anonymous volume (faster)
  - /app/.nx # Cache Nx workspace data
```

### Nx Cloud (Optional)

Enable distributed caching:

```yaml
environment:
  - NX_CLOUD_ACCESS_TOKEN=your-token
```

## Production Build

For production, create a separate docker-compose file:

```yaml
# docker-compose.prod.yml
services:
  shell:
    build:
      context: .
      dockerfile: Dockerfile.angular
      target: shell-prod
    environment:
      - NODE_ENV=production
```

Build production images:

```powershell
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Cleanup

### Remove Containers

```powershell
# Stop and remove all containers
docker-compose -f docker-compose.dev.yml down

# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Remove Images

```powershell
# Remove images built by docker-compose
docker-compose -f docker-compose.dev.yml down --rmi all

# Remove all unused images
docker image prune -a
```

### Full Cleanup

```powershell
# Remove everything (containers, volumes, images, networks)
docker-compose -f docker-compose.dev.yml down -v --rmi all
docker system prune -a --volumes
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Docker Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker-compose -f docker-compose.dev.yml build
      - name: Start services
        run: docker-compose -f docker-compose.dev.yml up -d
      - name: Wait for services
        run: sleep 30
      - name: Test shell app
        run: curl http://localhost:4200
```

## Monitoring

### Docker Stats

```powershell
# View resource usage
docker stats

# View specific containers
docker stats elementamon-shell elementamon-home
```

### Health Checks

All services include health checks:

```yaml
healthcheck:
  test: ['CMD-SHELL', 'curl -f http://localhost:4200 || exit 1']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check health status:

```powershell
docker inspect --format='{{.State.Health.Status}}' elementamon-shell
```

## Best Practices

1. **Use .dockerignore**: Exclude unnecessary files (already configured)
2. **Layer caching**: Order Dockerfile instructions from least to most frequently changing
3. **Named volumes**: Use for node_modules and build cache
4. **Health checks**: Monitor service availability
5. **Resource limits**: Prevent containers from consuming all resources
6. **Logging**: Use docker-compose logs for debugging
7. **Networks**: Isolate services with custom networks (already configured)

## Useful Commands Cheatsheet

```powershell
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Check status
docker-compose -f docker-compose.dev.yml ps

# Restart service
docker-compose -f docker-compose.dev.yml restart shell

# Rebuild single service
docker-compose -f docker-compose.dev.yml up -d --build shell

# Execute command
docker exec -it elementamon-shell npx nx build ui-components

# Stop all
docker-compose -f docker-compose.dev.yml down

# Clean everything
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

## Comparison: Docker vs Local

| Aspect          | Docker                       | Local (Current Setup)       |
| --------------- | ---------------------------- | --------------------------- |
| **Setup**       | Single command               | Manual start of 8 terminals |
| **Isolation**   | Full isolation               | Shared system resources     |
| **Portability** | Works anywhere               | Requires Node.js, pnpm      |
| **Performance** | Slight overhead              | Native speed                |
| **Hot Reload**  | Supported                    | Native                      |
| **Resources**   | Configurable limits          | Unlimited                   |
| **Cleanup**     | Easy (`docker-compose down`) | Manual process kill         |

## Next Steps

1. ✅ **Test Docker Setup**: `docker-compose -f docker-compose.dev.yml up`
2. 🔄 **Add Microservices**: Include backend services in compose file
3. 📊 **Add Monitoring**: Integrate Prometheus + Grafana
4. 🚀 **Production Config**: Create optimized production Dockerfile
5. 🔐 **Secrets Management**: Use Docker secrets for credentials
6. 📦 **Registry**: Push images to Docker Hub or private registry

## Support

For issues with Docker setup:

- Check logs: `docker-compose -f docker-compose.dev.yml logs`
- Verify Docker is running: `docker ps`
- Check Docker Desktop settings
- Ensure ports are available: `netstat -ano | findstr :4200`
