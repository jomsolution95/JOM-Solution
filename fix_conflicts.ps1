$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"

Write-Host "🕵️ Recherche de conflits (Nginx/Apache)..." -ForegroundColor Cyan

# Commande pour arrêter les services hôtes qui volent les ports 80/443
# On arrête nginx et apache2 sur l'hôte, car tout est géré par Docker
$cmdFix = 'systemctl stop nginx apache2; systemctl disable nginx apache2; pkill -f nginx; pkill -f apache2'

# On relance Docker
$cmdRestartDocker = 'cd /var/www/jom-solution/backend && docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d --force-recreate'

Write-Host "1. Nettoyage des processus concurrents..."
ssh $target $cmdFix

Write-Host "2. Redémarrage propre de l'application..."
ssh $target $cmdRestartDocker

Write-Host "✅ Terminé. Réessayez le site dans 30 secondes." -ForegroundColor Green
