$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'
$remotePath = '/var/www/jom-solution/backend/src/common/logger'

Write-Host '--- PATCHING BACKEND LOGGING ---' -ForegroundColor Cyan

# 1. Upload modified interceptor
Write-Host '1. Uploading LoggingInterceptor...'
# Ensure remote directory exists (it should, but safety first)
# ssh $target "mkdir -p $remotePath"
$scpCmd = "backend/src/common/logger/logging.interceptor.ts {0}:{1}/logging.interceptor.ts" -f $target, $remotePath
scp "backend/src/common/logger/logging.interceptor.ts" "$target`:$remotePath/logging.interceptor.ts"

# 2. Rebuild Backend
Write-Host '2. Rebuilding Backend Container (this may take a minute)...'
ssh $target 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml build backend'

# 3. Restart Backend
Write-Host '3. Restarting Backend Service...'
ssh $target 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml up -d backend'

Write-Host '✅ Patch Applied. Please retry registration.' -ForegroundColor Green
