$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'

Write-Host '--- Fixing Permissions (Safe Mode) ---' -ForegroundColor Cyan

# 1. Fix Permissions
Write-Host '1. Setting 755 permissions on dist folder...'
ssh $target 'chmod -R 755 /var/www/jom-solution/dist'

# 2. Check files
Write-Host '2. Verifying files...'
ssh $target 'ls -la /var/www/jom-solution/dist | head -n 5'

# 3. Restart Nginx
Write-Host '3. Restarting Nginx...'
$cmdRestart = 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml restart nginx'
ssh $target $cmdRestart

Write-Host '--- DONE. Refresh your browser using Ctrl+F5 ---' -ForegroundColor Green
