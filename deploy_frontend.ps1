$ErrorActionPreference = "Stop"

# Configuration
$vpsUser = "root"
$vpsHost = "72.62.7.249"
$remotePath = "/var/www/jom-solution"

Write-Host "--- Demarrage du deploiement Frontend ---" -ForegroundColor Cyan

# Usage of format operator to avoid PowerShell parsing errors with colon
$targetStr = "{0}@{1}:{2}" -f $vpsUser, $vpsHost, $remotePath
Write-Host "Cible: $targetStr"

# 1. Build
Write-Host "1. Construction de l'application React..." -ForegroundColor Yellow
try {
    # On utilise cmd /c pour s'assurer que npm est bien trouve
    # Force environment variables for production build
    $env:VITE_API_URL = "https://jom-solution.com/api"
    $env:VITE_APP_URL = "https://jom-solution.com"
    $env:VITE_WEBSOCKET_URL = "wss://jom-solution.com"
    
    cmd /c "npm run build"
    if ($LASTEXITCODE -ne 0) { throw "Erreur lors du build." }
}
catch {
    Write-Error "Echec du build."
    exit 1
}
Write-Host "Build termine." -ForegroundColor Green

# 2. Upload
Write-Host "2. Envoi des fichiers..." -ForegroundColor Yellow

# Creer le dossier
Write-Host "Creation du dossier distant..."
$sshTarget = "{0}@{1}" -f $vpsUser, $vpsHost
ssh $sshTarget "mkdir -p $remotePath"

# SCP
$destination = "{0}@{1}:{2}/" -f $vpsUser, $vpsHost, $remotePath
Write-Host "Destination SCP: $destination"

# On met le chemin local en premier, puis le distant.
scp -r dist "$destination"
# Upload updated Nginx config
scp "backend/nginx/nginx.prod.conf" "$destination/backend/nginx/nginx.prod.conf"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Fichiers transferes." -ForegroundColor Green
}
else {
    Write-Error "Erreur lors du transfert SCP."
    exit 1
}

# 3. Restart Nginx
Write-Host "3. Redemarrage Nginx..." -ForegroundColor Yellow
ssh $sshTarget "chmod -R 755 /var/www/jom-solution/dist"
ssh $sshTarget "chmod 755 /var/www/jom-solution/dist"
ssh $sshTarget "cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml restart nginx"

Write-Host "--- Deploiement Termine ! ---" -ForegroundColor Cyan
Write-Host "Site accessible sur: http://$vpsHost"
