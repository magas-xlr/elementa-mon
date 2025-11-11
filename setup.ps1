#!/usr/bin/env pwsh
# ElementaMon Development Setup Script
# This script automates the initial project setup

Write-Host "🎮 ElementaMon - Development Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking prerequisites..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js >= 22.11.0" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check pnpm
$pnpmVersion = pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  pnpm is not installed. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm@9.12.0
    $pnpmVersion = pnpm --version
}
Write-Host "✅ pnpm version: $pnpmVersion" -ForegroundColor Green

# Check Docker
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Docker is not installed. Please install Docker Desktop." -ForegroundColor Yellow
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
} else {
    Write-Host "✅ Docker version: $dockerVersion" -ForegroundColor Green
}

Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "⚙️  Setting up environment..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env and add your configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Initialize Husky
Write-Host ""
Write-Host "🪝 Setting up Git hooks..." -ForegroundColor Yellow
if (Test-Path ".git") {
    pnpm husky install
    Write-Host "✅ Git hooks installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not a git repository. Skipping Git hooks setup." -ForegroundColor Yellow
}

# Ask if user wants to start Docker
Write-Host ""
$startDocker = Read-Host "Do you want to start Docker containers (PostgreSQL, MongoDB, Redis)? (y/n)"
if ($startDocker -eq "y" -or $startDocker -eq "Y") {
    Write-Host ""
    Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
    docker-compose up -d postgres mongodb redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker containers started successfully" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "⏳ Waiting for databases to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "✅ Databases are ready" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Docker containers" -ForegroundColor Red
        Write-Host "   Make sure Docker Desktop is running" -ForegroundColor Yellow
    }
}

# Print next steps
Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "   2. Start development server:" -ForegroundColor White
Write-Host "      pnpm dev:shell" -ForegroundColor Yellow
Write-Host "   3. Access the application at http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "📚 Useful commands:" -ForegroundColor Cyan
Write-Host "   pnpm test          - Run tests" -ForegroundColor White
Write-Host "   pnpm lint          - Run linter" -ForegroundColor White
Write-Host "   pnpm format        - Format code" -ForegroundColor White
Write-Host "   pnpm storybook     - Start Storybook" -ForegroundColor White
Write-Host "   docker-compose up  - Start all services" -ForegroundColor White
Write-Host ""
Write-Host "📖 Read GETTING_STARTED.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎮 Happy coding!" -ForegroundColor Magenta
