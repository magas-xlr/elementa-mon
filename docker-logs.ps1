# ElementaMon Docker - View Logs

param(
    [string]$Service = ""
)

Write-Host "📋 Viewing ElementaMon Logs..." -ForegroundColor Cyan
Write-Host ""

if ($Service) {
    Write-Host "Showing logs for: $Service" -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml logs -f $Service
} else {
    Write-Host "Showing all logs (Ctrl+C to exit)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Tip: To view specific service logs:" -ForegroundColor Cyan
    Write-Host "   .\docker-logs.ps1 shell" -ForegroundColor White
    Write-Host "   .\docker-logs.ps1 home" -ForegroundColor White
    Write-Host "   .\docker-logs.ps1 postgres" -ForegroundColor White
    Write-Host ""
    Start-Sleep -Seconds 2
    docker-compose -f docker-compose.dev.yml logs -f
}
