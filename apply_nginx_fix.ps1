$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"
$backendPath = "c:\Users\HP\Downloads\jom-solution (3)\backend"

Write-Host "🚀 Applying Final SSL/Nginx Fix (Complete)..." -ForegroundColor Cyan

# Define paths
$localCompose = "$backendPath\docker-compose.prod.yml"
$remoteCompose = "/var/www/jom-solution/backend/docker-compose.prod.yml"
$scpCompose = "${target}:${remoteCompose}"

$localNginx = "$backendPath\nginx\nginx.prod.conf"
$remoteNginx = "/var/www/jom-solution/backend/nginx/nginx.prod.conf"
$scpNginx = "${target}:${remoteNginx}"

# 1. Upload docker-compose
Write-Host "1. Uploading docker-compose..."
scp $localCompose $scpCompose

# 2. Upload nginx.prod.conf (Fixes the mount error)
Write-Host "2. Uploading nginx.prod.conf..."
# Ensure directory exists just in case
ssh $target "mkdir -p /var/www/jom-solution/backend/nginx"
# Remove if it was wrongly created as a directory by Docker
ssh $target "if [ -d /var/www/jom-solution/backend/nginx/nginx.prod.conf ]; then rm -rf /var/www/jom-solution/backend/nginx/nginx.prod.conf; fi"
scp $localNginx $scpNginx

# 3. Restart Docker
Write-Host "3. Restarting containers..."
$cmdRestart = 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml up -d --force-recreate nginx backend'
ssh $target $cmdRestart

Write-Host "✅ DONE. Site should work." -ForegroundColor Green
