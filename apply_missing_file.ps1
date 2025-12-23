$server = "root@72.62.7.249"
$local_file = "upload.controller.ts"
$remote_path = "/var/www/jom-solution/backend/src/modules/premium/upload.controller.ts"

Write-Host "1. Envoi du fichier upload.controller.ts manquant via SCP..."
scp $local_file ${server}:${remote_path}

if ($LASTEXITCODE -eq 0) {
    Write-Host "2. Fichier envoyé. Connexion SSH pour reconstruire..."
    ssh -t $server "cd /var/www/jom-solution/backend && echo 'Reconstruction...' && docker compose -f docker-compose.prod.yml up -d --build && echo 'Attente du démarrage (15s)...' && sleep 15 && docker compose logs --tail=50 app"
}
else {
    Write-Host "Erreur lors de la copie SCP."
}
