$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"
$localNginxConf = "c:\Users\HP\Downloads\jom-solution (3)\backend\nginx\nginx.prod.conf"
$remoteNginxConf = "/var/www/jom-solution/backend/nginx/nginx.conf"

# Formatage de la cible SCP pour eviter le bug de variable (:)
$scpTarget = "{0}:{1}" -f $target, $remoteNginxConf

Write-Host ">>> Demarrage de la configuration SSL..." -ForegroundColor Cyan

# 1. Install Certbot
Write-Host "1. Installation de Certbot..."
$cmdInstall = 'if ! command -v certbot > /dev/null 2>&1; then apt-get update && apt-get install -y certbot; fi'
ssh $target $cmdInstall

# 2. Stop Nginx
Write-Host "2. Arret de Nginx..."
$cmdStop = 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml stop nginx'
ssh $target $cmdStop

# 3. Generate Cert
Write-Host "3. Generation du certificat..."
$cmdCert = 'certbot certonly --standalone -d jom-solution.com -d www.jom-solution.com --non-interactive --agree-tos -m admin@jom-solution.com --keep-until-expiring'
ssh $target $cmdCert

# 4. Check Cert
Write-Host "4. Verification..."
$cmdCheck = 'test -f /etc/letsencrypt/live/jom-solution.com/fullchain.pem && echo "YES" || echo "NO"'
$exists = ssh $target $cmdCheck

if ($exists -ne $null -and $exists.Trim() -eq "YES") {
    Write-Host "SUCCESS: Certificat OK !" -ForegroundColor Green
}
else {
    Write-Error "ERROR: Echec de la generation. Le certificat est introuvable."
    exit 1
}

# 5. Update Docker Compose (sed)
Write-Host "5. Mise a jour de Docker Compose..."
$cmdSed = "sed -i 's|\./ssl:/etc/nginx/ssl:ro|/etc/letsencrypt:/etc/letsencrypt:ro|g' /var/www/jom-solution/backend/docker-compose.prod.yml"
ssh $target $cmdSed

# 6. Upload Nginx Config
Write-Host "6. Envoi de la configuration Nginx SSL..."
scp $localNginxConf $scpTarget

# 7. Restart
Write-Host "7. Redemarrage..."
$cmdRestart = 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d'
ssh $target $cmdRestart

Write-Host "TERMINE ! https://jom-solution.com" -ForegroundColor Cyan
