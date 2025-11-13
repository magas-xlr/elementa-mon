# 🚀 ElementaMon - Quick Start Guide

## Choose Your Setup Method

### 🐳 Docker (Recommended - Easiest)

**Run ALL services with ONE command:**

```powershell
.\docker-start.ps1
```

**What you get:**

- ✅ 8 Angular apps (shell + 7 remotes)
- ✅ 3 Databases (PostgreSQL, MongoDB, Redis)
- ✅ Hot reload enabled
- ✅ All ports configured automatically

**Access:**

- Shell: http://localhost:4200
- All remotes: ports 4201-4207
- Databases: localhost:5432, 27017, 6379

**Useful commands:**

```powershell
.\docker-status.ps1    # Check all services
.\docker-logs.ps1      # View logs
.\docker-stop.ps1      # Stop everything
```

📚 **Full guide:** [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### 💻 Manual Setup (8 Terminals)

**Step 1: Install dependencies**

```powershell
pnpm install
npx nx build ui-components
```

**Step 2: Start databases**

```powershell
docker-compose up -d postgres mongodb redis
```

**Step 3: Start apps (8 terminals needed)**

```powershell
# Terminal 1
npx nx serve shell

# Terminal 2
npx nx serve home --port 4201

# Terminal 3
npx nx serve deck-builder --port 4202

# Terminal 4
npx nx serve battle --port 4203

# Terminal 5
npx nx serve world-map --port 4204

# Terminal 6
npx nx serve inventory --port 4205

# Terminal 7
npx nx serve avatar-customization --port 4206

# Terminal 8
npx nx serve game-over --port 4207
```

---

## 🎮 Testing Module Federation

1. Open http://localhost:4200
2. Click navigation links
3. Each route loads a different microfrontend dynamically

### Available Routes:

- `/home` - UI component showcase
- `/deck-builder` - Deck building
- `/battle` - Battle arena
- `/world-map` - World exploration
- `/inventory` - Inventory management
- `/avatar-customization` - Character customization
- `/game-over` - Results screen

---

## 📚 Documentation Index

| Document                                     | Description                |
| -------------------------------------------- | -------------------------- |
| [README.md](README.md)                       | Main project documentation |
| [DOCKER_SETUP.md](DOCKER_SETUP.md)           | Complete Docker guide      |
| [MODULE_FEDERATION.md](MODULE_FEDERATION.md) | Microfrontend architecture |
| [RUNNING_APPS.md](RUNNING_APPS.md)           | Running apps manually      |
| [PROJECT_STATUS.md](PROJECT_STATUS.md)       | Current progress           |
| [BEST_PRACTICES.md](BEST_PRACTICES.md)       | Development guidelines     |

---

## 🛠️ Common Tasks

### Build UI Components Library

```powershell
npx nx build ui-components
```

### Run Tests

```powershell
npx nx test home
npx nx test --all
```

### Lint Code

```powershell
npx nx lint shell
npx nx lint --all
```

### Generate New Component

```powershell
npx nx g @nx/angular:component my-component --project=home
```

### Check Nx Graph

```powershell
npx nx graph
```

---

## 🐛 Troubleshooting

### Docker Issues

**Docker not starting:**

```powershell
# Check if Docker Desktop is running
docker ps

# Restart Docker Desktop
# Then try again
.\docker-start.ps1
```

**Port conflicts:**

```powershell
# Find process using port
netstat -ano | findstr :4200

# Kill process
taskkill /PID <PID> /F
```

**Slow performance:**

- Increase Docker resources (Docker Desktop → Settings → Resources)
- Recommended: 4 CPU cores, 8GB RAM

### Manual Setup Issues

**Module not found errors:**

```powershell
# Rebuild UI components
npx nx build ui-components --skip-nx-cache

# Clear Nx cache
npx nx reset
```

**Port already in use:**

```powershell
# Change port in serve command
npx nx serve home --port 4301
```

**Changes not reflecting:**

- Check if hot reload is working
- Restart the dev server
- Clear browser cache (Ctrl+Shift+R)

---

## 🎯 Next Steps

1. ✅ Choose Docker or Manual setup
2. ✅ Start all services
3. ✅ Test Module Federation navigation
4. 🔄 Add NgRx state management
5. 🔄 Connect to backend microservices
6. 🔄 Implement authentication
7. 🔄 Add more UI components

---

## 📞 Need Help?

- **Module Federation issues**: [MODULE_FEDERATION.md](MODULE_FEDERATION.md)
- **Docker problems**: [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Build errors**: Check [RUNNING_APPS.md](RUNNING_APPS.md) troubleshooting
- **General questions**: Check [README.md](README.md)

---

## ⚡ Pro Tips

1. **Use Docker** for easiest setup (recommended for beginners)
2. **Use Manual setup** for maximum performance (native speed)
3. **Keep ui-components built** before starting apps
4. **Use Nx Console** VSCode extension for easier commands
5. **Check logs** when things don't work: `.\docker-logs.ps1`
6. **Monitor status**: `.\docker-status.ps1` shows everything at a glance

---

**🎮 Happy Coding! Collect, Build, Battle!**
