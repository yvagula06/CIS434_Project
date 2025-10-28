# Docker Quick Start Script for Windows PowerShell
# Run this script to start the application with Docker

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Chat Application - Docker Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please edit .env and add your OpenRouter API key!" -ForegroundColor Red
    Write-Host "   OPENROUTER_API_KEY=your_api_key_here" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Have you added your API key? (y/n)"
    if ($response -ne 'y') {
        Write-Host "Please add your API key to .env and run this script again." -ForegroundColor Yellow
        exit 0
    }
}

# Check if API key is set
$apiKey = Get-Content .env | Select-String "OPENROUTER_API_KEY" | ForEach-Object { $_.ToString().Split('=')[1] }
if ($apiKey -eq "your_api_key_here" -or [string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ OpenRouter API key not configured!" -ForegroundColor Red
    Write-Host "Please edit .env and add your actual API key." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ API key configured" -ForegroundColor Green
Write-Host ""

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✓ Cleaned up" -ForegroundColor Green
Write-Host ""

# Build and start services
Write-Host "Building and starting services..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes on first run)" -ForegroundColor Cyan
Write-Host ""
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  ✓ Application Started!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application:" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
    Write-Host "  Backend:   http://localhost:8001" -ForegroundColor White
    Write-Host "  API Docs:  http://localhost:8001/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  View logs:        docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop services:    docker-compose down" -ForegroundColor White
    Write-Host "  Restart:          docker-compose restart" -ForegroundColor White
    Write-Host ""
    
    # Wait a few seconds for services to be ready
    Start-Sleep -Seconds 3
    
    # Check service health
    Write-Host "Checking service health..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ Backend is healthy" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Backend health check failed (may still be starting)" -ForegroundColor Yellow
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
        Write-Host "✓ Frontend is serving" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Frontend health check failed (may still be starting)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:5173"
    
} else {
    Write-Host ""
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host "Run 'docker-compose logs' to see error details" -ForegroundColor Yellow
    exit 1
}
