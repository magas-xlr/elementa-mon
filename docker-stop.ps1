# ElementaMon Docker - Stop All Services

Write-Host "🛑 Stopping ElementaMon Docker Environment..." -ForegroundColor Cyan
Write-Host ""

docker-compose -f docker-compose.dev.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Note: Database volumes are preserved." -ForegroundColor Yellow
    Write-Host "   To remove volumes (⚠️ deletes all data):" -ForegroundColor Yellow
    Write-Host "   docker-compose -f docker-compose.dev.yml down -v" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error stopping services!" -ForegroundColor Red
    exit 1
}
