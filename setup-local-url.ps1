# One-time setup: map a friendly local name to your PC (requires Run as Administrator)
$hostName = 'mysystemtravelbook.local'
$siteUrl = "http://${hostName}:5173"
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entry = "127.0.0.1`t$hostName"

Write-Host "`nSmart Travel Book — local website name setup" -ForegroundColor Green
Write-Host "Target URL: $siteUrl`n" -ForegroundColor Cyan

$existing = Get-Content $hostsPath -ErrorAction SilentlyContinue | Select-String -Pattern $hostName -SimpleMatch
if ($existing) {
  Write-Host "Already configured in hosts file:" -ForegroundColor Yellow
  Write-Host "  $existing"
  Write-Host "`nOpen your site: $siteUrl" -ForegroundColor Green
  exit 0
}

try {
  Add-Content -Path $hostsPath -Value "`n# Smart Travel Planner local site" -ErrorAction Stop
  Add-Content -Path $hostsPath -Value $entry -ErrorAction Stop
  Write-Host "Added to hosts file:" -ForegroundColor Green
  Write-Host "  $entry"
  Write-Host "`nYour website link: $siteUrl" -ForegroundColor Green
  Write-Host "Run .\start.ps1 to start the app.`n" -ForegroundColor Cyan
} catch {
  Write-Host "Could not edit hosts file (need Administrator)." -ForegroundColor Red
  Write-Host "`nManual steps:" -ForegroundColor Yellow
  Write-Host "1. Open Notepad as Administrator"
  Write-Host "2. Open: $hostsPath"
  Write-Host "3. Add this line at the bottom:"
  Write-Host "   $entry" -ForegroundColor White
  Write-Host "4. Save, then open: $siteUrl`n"
}
