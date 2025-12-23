$server = "root@72.62.7.249"
$remote_path = "/var/www/jom-solution/backend"

# Commande pour voir les logs
$cmd = "cd $remote_path && " +
"docker compose -f docker-compose.prod.yml ps && " +
"echo '-----------------------------------' && " +
"docker compose -f docker-compose.prod.yml logs --tail=50 app"

Write-Host "Vérification finale du démarrage..."
ssh $server $cmd
