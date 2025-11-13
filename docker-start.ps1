# ElementaMon Docker Development Environment
# Start all services with a single command

Write-Host "🐳 Starting ElementaMon Docker Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Build and start all services
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes on first run..." -ForegroundColor Yellow
Write-Host ""

docker-compose -f docker-compose.dev.yml up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Angular Applications:" -ForegroundColor Cyan
    Write-Host "   Shell (Host):            http://localhost:4200" -ForegroundColor White
    Write-Host "   Home:                    http://localhost:4201" -ForegroundColor White
    Write-Host "   Deck Builder:            http://localhost:4202" -ForegroundColor White
    Write-Host "   Battle:                  http://localhost:4203" -ForegroundColor White
    Write-Host "   World Map:               http://localhost:4204" -ForegroundColor White
    Write-Host "   Inventory:               http://localhost:4205" -ForegroundColor White
    Write-Host "   Avatar Customization:    http://localhost:4206" -ForegroundColor White
    Write-Host "   Game Over:               http://localhost:4207" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Databases:" -ForegroundColor Cyan
    Write-Host "   PostgreSQL:              localhost:5432" -ForegroundColor White
    Write-Host "   MongoDB:                 localhost:27017" -ForegroundColor White
    Write-Host "   Redis:                   localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   View logs:               docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
    Write-Host "   Check status:            docker-compose -f docker-compose.dev.yml ps" -ForegroundColor White
    Write-Host "   Stop services:           docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
    Write-Host "   Restart service:         docker-compose -f docker-compose.dev.yml restart <service>" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Services are starting... Please wait 30-60 seconds for all apps to be ready." -ForegroundColor Yellow
    Write-Host ""
    
    # Wait a bit and show status
    Start-Sleep -Seconds 10
    Write-Host "📊 Current Status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.dev.yml ps
    
} else {
    Write-Host ""
    Write-Host "❌ Error starting services!" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    exit 1
}
