$ErrorActionPreference = "Stop"

# Configuration
$vpsUser = "root"
$vpsHost = "72.62.7.249"
$remoteScriptPath = "/usr/local/bin/jom-backup.sh"

Write-Host "--- Installation du systeme de sauvegarde ---" -ForegroundColor Cyan

# 1. Upload Script
Write-Host "Envoi du script de sauvegarde..."
scp "backup.sh" "${vpsUser}@${vpsHost}:/tmp/backup.sh"

# 2. Configure on Server
Write-Host "Configuration sur le serveur..."
$commands = @(
    # Move script to bin
    "mv /tmp/backup.sh $remoteScriptPath",
    "chmod +x $remoteScriptPath",
    
    # Create backup directory
    "mkdir -p /var/backups/jom-solution",
    
    # Add Cron Job (Every day at 3am)
    # Check if job exists to avoid duplicate
    "grep -q 'jom-backup.sh' /var/spool/cron/crontabs/root 2>/dev/null || echo '0 3 * * * $remoteScriptPath >> /var/log/jom-backup.log 2>&1' >> /var/spool/cron/crontabs/root",
    
    # Ensure cron service is running
    "service cron restart || systemctl restart cron"
)

$commandStr = $commands -join " && "
ssh "${vpsUser}@${vpsHost}" $commandStr

Write-Host "--- Sauvegardes Automatiques Configurees ! ---" -ForegroundColor Green
Write-Host "Une sauvegarde sera effectuee chaque jour a 03h00."
Write-Host "Logs disponibles sur le serveur: /var/log/jom-backup.log"
