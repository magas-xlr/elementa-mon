# ElementaMon Docker - Check Status

Write-Host "📊 ElementaMon Services Status" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    exit 1
}

# Show container status
Write-Host "🐳 Container Status:" -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml ps

Write-Host ""
Write-Host "📈 Resource Usage:" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | Select-Object -First 12

Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Cyan
$services = @(
    @{Name="Shell (Host)"; Port=4200},
    @{Name="Home"; Port=4201},
    @{Name="Deck Builder"; Port=4202},
    @{Name="Battle"; Port=4203},
    @{Name="World Map"; Port=4204},
    @{Name="Inventory"; Port=4205},
    @{Name="Avatar Customization"; Port=4206},
    @{Name="Game Over"; Port=4207}
)

foreach ($service in $services) {
    $url = "http://localhost:$($service.Port)"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $($service.Name.PadRight(25)) $url" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⏳ $($service.Name.PadRight(25)) $url (starting...)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "💾 Database Status:" -ForegroundColor Cyan

# Check PostgreSQL
try {
    docker exec elementamon-postgres pg_isready -U elementamon 2>&1 | Out-Null
    Write-Host "   ✅ PostgreSQL:    localhost:5432" -ForegroundColor Green
} catch {
    Write-Host "   ❌ PostgreSQL:    localhost:5432 (not ready)" -ForegroundColor Red
}

# Check MongoDB
try {
    docker exec elementamon-mongodb mongosh --quiet --eval "db.adminCommand('ping')" 2>&1 | Out-Null
    Write-Host "   ✅ MongoDB:       localhost:27017" -ForegroundColor Green
} catch {
    Write-Host "   ❌ MongoDB:       localhost:27017 (not ready)" -ForegroundColor Red
}

# Check Redis
try {
    docker exec elementamon-redis redis-cli -a elementamon_dev_pass ping 2>&1 | Out-Null
    Write-Host "   ✅ Redis:         localhost:6379" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Redis:         localhost:6379 (not ready)" -ForegroundColor Red
}

Write-Host ""
