# Start all services for Smart Travel Planner (Windows)
Write-Host "Starting Smart Travel Planner services..." -ForegroundColor Green

$nodePath = "$PSScriptRoot\.tools\node"
if (Test-Path $nodePath) { $env:Path = "$nodePath;$env:Path" }

# 1. Python Flask backend — Weather Risk Analysis (port 5001)
Write-Host "`n[1/3] Starting Python Flask Backend (port 5001)..." -ForegroundColor Cyan
Write-Host "      Files: backend/app.py, routes.py, weather_analysis.py" -ForegroundColor DarkGray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python app.py"

Start-Sleep -Seconds 3

# 2. Node.js REST API — auth, bookings, destinations (port 5000)
Write-Host "[2/3] Starting Node.js API (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

Start-Sleep -Seconds 2

# 3. React frontend (port 5173)
Write-Host "[3/3] Starting Frontend (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Start-Sleep -Seconds 3
Write-Host "`nAll services starting! Open http://localhost:5173" -ForegroundColor Green
Write-Host "Python Flask MUST be running for weather analysis." -ForegroundColor Yellow
Start-Process "msedge" "http://localhost:5173"
