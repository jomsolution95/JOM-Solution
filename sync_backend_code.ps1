$ErrorActionPreference = 'Stop'
$target = 'root@72.62.7.249'
$remoteBase = '/var/www/jom-solution/backend'

Write-Host '--- SYNCING BACKEND CODE TO PROD ---' -ForegroundColor Cyan

# 1. Archive src directory (requires tar on windows, usually available in modern ps)
Write-Host '1. Packing local source code...'
# We use a temporary file for the archive
$tarFile = "$env:TEMP\backend_src.tar"
if (Test-Path $tarFile) { Remove-Item $tarFile }

# Create tar of src directory.  We change location to backend first so path in tar is relative
Push-Location "backend"
try {
    tar -cvf $tarFile src
}
finally {
    Pop-Location
}

# 2. Upload Archive
Write-Host "2. Uploading code archive to $target..."
scp $tarFile "$target`:$remoteBase/src.tar"

# 3. Extract and Rebuild on Server
Write-Host '3. Extracting and Rebuilding on Server...'
$commands = @(
    "cd $remoteBase",
    "rm -rf src_backup",
    "mv src src_backup", # Backup just in case
    "tar -xvf src.tar", # Extract new src
    "rm src.tar",
    "docker compose -f docker-compose.prod.yml build backend",
    "docker compose -f docker-compose.prod.yml up -d backend"
) -join " && "

ssh $target $commands

Write-Host '✅ Backend Code Synced & Rebuilt!' -ForegroundColor Green
