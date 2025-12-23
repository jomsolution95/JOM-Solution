$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'

Write-Host '--- STARTING DIAGNOSIS ---' -ForegroundColor Cyan

# 1. Check Parent Permissions
Write-Host '1. Checking Directory Permissions...'
ssh $target 'namei -l /var/www/jom-solution/dist/index.html'

# 2. Check File Existence
Write-Host '2. Checking dist/index.html existence...'
ssh $target 'ls -la /var/www/jom-solution/dist/index.html'

# 3. Check Nginx Container View
Write-Host '3. Checking files FROM INSIDE container...'
ssh $target 'docker exec backend-nginx-1 ls -la /usr/share/nginx/html'

# 4. Get Nginx Logs
Write-Host '4. Fetching Nginx Error Logs (Last 50 lines)...'
ssh $target 'docker logs --tail 50 backend-nginx-1'

Write-Host '--- DIAGNOSIS COMPLETE ---' -ForegroundColor Cyan
