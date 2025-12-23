$ErrorActionPreference = "Stop"
$vpsHost = "72.62.7.249"
$vpsUser = "root"

Write-Host "🔧 Correction des permissions sur le VPS..." -ForegroundColor Yellow

# 1. Lister les fichiers pour voir le status actuel (debug)
Write-Host "📂 État actuel :"
ssh "$vpsUser@$vpsHost" "ls -la /var/www/jom-solution/dist | head -n 5"

# 2. Appliquer les permissions 755 (Lecture/Exécution pour tous)
Write-Host "🛠️ Application de chmod 755..."
ssh "$vpsUser@$vpsHost" "chmod -R 755 /var/www/jom-solution/dist"

# 3. Vérification
Write-Host "✅ Permissions appliquées."
