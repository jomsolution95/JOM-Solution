$server = "root@72.62.7.249"
$remote_path = "/var/www/jom-solution/backend"

Write-Host "Vérification des variables d'environnement DANS le conteneur..."
$cmd = "cd $remote_path && docker compose -f docker-compose.prod.yml exec app env | grep DATABASE_URL"

ssh $server $cmd
