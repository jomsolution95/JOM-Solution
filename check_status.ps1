$ErrorActionPreference = "Stop"
$target = "root@72.62.7.249"

Write-Host "🕵️ Checking Server Internals..." -ForegroundColor Cyan

# Define the remote command
$cmd = '
echo "--- DOCKER PROCESSES ---"
docker ps -a
echo ""
echo "--- LISTENING PORTS ---"
netstat -tlpn
echo ""
echo "--- INTERNAL HTTP TEST ---"
curl -I -k https://localhost || echo "Curl failed"
echo ""
echo "--- INTERNAL HTTP (Port 80) TEST ---"
curl -I http://localhost || echo "Curl 80 failed"
'

# Execute via SSH
ssh $target $cmd
