#!/bin/bash

# 1. Update System
echo "Updating system packages..."
apt update && apt upgrade -y

# 2. Install Essentials
echo "Installing essential tools..."
apt install -y git curl wget software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Install Docker & Docker Compose
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Backup for legacy docker-compose support if needed (alias)
echo 'alias docker-compose="docker compose"' >> ~/.bashrc
source ~/.bashrc

# 4. Install Nginx (Host Level - for Reverse Proxy)
echo "Installing Nginx..."
apt install -y nginx

# 5. Install Certbot (SSL)
echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# 6. Setup Firewall (UFW)
echo "Configuring Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
# ufw enable # Uncomment to enable immediately, but confirm SSH access first!

# 7. Create Project Directory
mkdir -p /var/www/jom-solution

echo "------------------------------------------------"
echo "✅ Setup Complete!"
echo "Docker Version: $(docker --version)"
echo "You are ready to deploy."
echo "------------------------------------------------"
