$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"

Write-Host "🛡️ Correction du Pare-feu (UFW)..." -ForegroundColor Cyan

# 1. Allow HTTP/HTTPS
$cmdAllow = 'ufw allow 80/tcp && ufw allow 443/tcp && ufw reload'
ssh $target $cmdAllow

# 2. Check Status
$cmdStatus = 'ufw status verbose'
ssh $target $cmdStatus

Write-Host "✅ Pare-feu mis à jour." -ForegroundColor Green
