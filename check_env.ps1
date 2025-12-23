$server = "root@72.62.7.249"
$remote_path = "/var/www/jom-solution/backend/.env"

Write-Host "Vérification du fichier .env sur le VPS..."
# On utilise grep pour ne pas afficher toutes les valeurs secrètes, juste vérifier les clés
$cmd = "ls -la $remote_path && echo '--- Contenu (clés uniquement) ---' && grep -o '^[^=]*' $remote_path"

ssh $server $cmd
