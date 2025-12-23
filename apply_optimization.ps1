$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'
$remotePath = '/var/www/jom-solution/backend'
$nginxRemotePath = "$remotePath/nginx"

Write-Host '--- Applying Production Optimizations (Fixed) ---' -ForegroundColor Cyan

# 1. Upload Docker Compose
Write-Host '1. Uploading Docker Config (CORS & Volumes)...'
$scpDestCompose = "{0}:{1}/docker-compose.prod.yml" -f $target, $remotePath
scp "backend/docker-compose.prod.yml" $scpDestCompose

# 2. Upload Nginx Config
Write-Host '2. Uploading Nginx Config (Upload Limits & Routing)...'
ssh $target "mkdir -p $nginxRemotePath"
$scpDestNginx = "{0}:{1}/nginx.prod.conf" -f $target, $nginxRemotePath
scp "backend/nginx/nginx.prod.conf" $scpDestNginx

# 3. Apply Changes (Restart)
Write-Host '3. Restarting Backend Services...'
$cmdRestart = "cd $remotePath && docker compose -f docker-compose.prod.yml up -d --force-recreate nginx backend"
ssh $target $cmdRestart

Write-Host '✅ Optimizations Applied. Ready for Frontend Deployment.' -ForegroundColor Green
