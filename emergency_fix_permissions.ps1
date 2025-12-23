$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'

Write-Host '--- APPLYING EMERGENCY PERMISSION FIX ---' -ForegroundColor Cyan

# Force directory permissions to be open for Nginx
Write-Host '1. Opening directory permissions...'
ssh $target 'chmod 755 /var/www/jom-solution'
ssh $target 'chmod 755 /var/www/jom-solution/dist'

# Force file permissions
Write-Host '2. Opening file permissions...'
ssh $target 'chmod -R 755 /var/www/jom-solution/dist'

# Verify
Write-Host '3. Verifying new permissions...'
ssh $target 'ls -ld /var/www/jom-solution/dist'

# Restart Nginx
Write-Host '4. Restarting Nginx...'
ssh $target 'docker compose -f /var/www/jom-solution/backend/docker-compose.prod.yml restart nginx'

Write-Host '✅ Permissions Fixed. Try accessing the site now.' -ForegroundColor Green
