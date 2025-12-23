$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"

Write-Host "🕵️ Fetching Backend Logs..." -ForegroundColor Cyan

# Fetch last 200 lines of logs from the backend API container
$cmd = 'docker logs --tail 200 backend-backend-1'

ssh $target $cmd

Write-Host "✅ Logs retrieved." -ForegroundColor Green
