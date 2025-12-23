$server = "root@72.62.7.249"
$remote_path = "/var/www/jom-solution/backend"

# Commande unique jointe pour une seule connexion SSH
$cmd = "cd $remote_path && " +
"echo '--- 1. CORRECTION NGINX ---' && " +
"sed -i 's/backend:3000/app:3000/g' nginx/nginx.conf && " +
"echo '--- 2. REDEMARRAGE CONTAINER ---' && " +
"docker compose -f docker-compose.prod.yml down && " +
"docker compose -f docker-compose.prod.yml up -d --build && " +
"echo '--- 3. VERIFICATION DIST ---' && " +
"docker run --rm backend-app ls -R /app/dist && " +
"echo '--- 4. DIAGNOSTIC LOGS ---' && " +
"sleep 5 && " +
"docker logs --tail=20 backend-app-1 && " +
"docker logs --tail=20 backend-nginx-1"

Write-Host "Connexion au VPS pour appliquer les correctifs..."
ssh $server $cmd
