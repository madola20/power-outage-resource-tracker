# Load environment variables from .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Get environment variables with fallbacks
$POSTGRES_DB = $env:POSTGRES_DB
$POSTGRES_USER = $env:POSTGRES_USER
$POSTGRES_PASSWORD = $env:POSTGRES_PASSWORD
$POSTGRES_PORT = $env:POSTGRES_PORT
$SECRET_KEY = $env:SECRET_KEY
$DEBUG = $env:DEBUG

# Validate required environment variables
$requiredVars = @("POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_PORT", "SECRET_KEY", "DEBUG")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Get-Variable -Name $var -ErrorAction SilentlyContinue) -or -not (Get-Variable -Name $var -ValueOnly)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "Error: Missing required environment variables:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "Please check your .env file and ensure all required variables are set." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Docker containers..." -ForegroundColor Green
docker-compose up -d

Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Running database migrations..." -ForegroundColor Green
docker-compose exec backend python manage.py migrate

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Manual task: Remember to create a user!" -ForegroundColor Yellow