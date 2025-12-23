# Guide de Déploiement en Production

## Vue d'ensemble
Ce guide couvre le déploiement du Backend JOM dans un environnement de production, avec les meilleures pratiques en matière de sécurité, performance et fiabilité.

## Prérequis
- VPS Ubuntu/Debian avec Docker et Docker Compose installés
- Nom de domaine configuré (optionnel mais recommandé)
- Accès au dépôt GitHub
- Accès SSH au serveur

## Configuration de l'Environnement

### 1. Variables d'Environnement
Copiez `.env.production.template` vers `.env.production` et mettez à jour toutes les valeurs :

```bash
cp .env.production.template .env.production
nano .env.production
```

**Valeurs critiques à modifier :**
- `JWT_SECRET`, `AT_SECRET`, `RT_SECRET` : Générez des chaînes aléatoires fortes (min 32 caractères)
- `MONGODB_URI` : Mettez à jour avec les identifiants de la base de données de production
- `CORS_ORIGIN` : Définissez votre domaine frontend
- `LOKI_HOST` : Configurez si vous utilisez Grafana Loki

### 2. Déploiement Docker

```bash
# Construire et démarrer les services
docker-compose up -d --build

# Vérifier les logs
docker-compose logs -f backend

# Vérifier la santé du service
curl http://localhost/api/health
```

### 3. Gestion des Processus PM2 (Alternative à Docker)

Si vous exécutez directement sur le serveur sans Docker :

```bash
# Installer PM2 globalement
npm install -g pm2

# Construire l'application
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

## Sauvegardes de Base de Données

### Sauvegardes Quotidiennes Automatisées

1. Rendez le script de sauvegarde exécutable :
```bash
chmod +x scripts/backup_mongo.sh
```

2. Configurez AWS CLI (si utilisation de S3) :
```bash
aws configure
```

3. Ajoutez au crontab pour des sauvegardes quotidiennes à 2h du matin :
```bash
crontab -e
# Ajoutez cette ligne :
0 2 * * * /path/to/backend/scripts/backup_mongo.sh >> /var/log/mongo-backup.log 2>&1
```

## Configuration Nginx

### Configuration SSL/TLS (Production)

Pour la production, remplacez la config Nginx basique par SSL :

```nginx
server {
    listen 443 ssl http2;
    server_name votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;
    
    # Inclure la config optimisée depuis nginx/nginx.conf
    include /etc/nginx/conf.d/jom-backend.conf;
}

server {
    listen 80;
    server_name votredomaine.com;
    return 301 https://$server_name$request_uri;
}
```

### SSL Let's Encrypt

```bash
# Installer certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d votredomaine.com
```

## CI/CD avec GitHub Actions

### Secrets GitHub Requis

Ajoutez ces secrets dans les paramètres de votre dépôt GitHub :

- `SSH_HOST` : IP/Hostname de votre serveur
- `SSH_USER` : Nom d'utilisateur SSH (ex: `ubuntu`)
- `SSH_KEY` : Clé privée SSH pour l'authentification

### Flux de Déploiement

1. Un push sur la branche `main` déclenche le workflow
2. Les tests s'exécutent automatiquement
3. L'image Docker est construite et poussée sur GHCR
4. Le déploiement SSH s'exécute sur le serveur
5. Les services redémarrent sans temps d'arrêt

## Surveillance (Monitoring)

### Vérifications de Santé (Health Checks)
- **Endpoint**: `GET /health`
- **Réponse Attendue**: `{"status":"ok","info":{...}}`

### Métriques
- **Endpoint**: `GET /metrics`
- **Format**: Compatible Prometheus

### Logs
- **Emplacement**: `./logs/application-YYYY-MM-DD.log`
- **Format**: JSON (structuré)
- **Intégration Loki**: Configurez `LOKI_HOST` dans l'environnement

## Optimisation des Performances

### Index Base de Données
Assurez-vous que les index MongoDB sont créés pour les champs fréquemment interrogés :

```javascript
// Exécuter dans le shell MongoDB
db.users.createIndex({ email: 1 }, { unique: true });
db.profiles.createIndex({ userId: 1 });
db.jobs.createIndex({ status: 1, createdAt: -1 });
db.services.createIndex({ provider: 1, status: 1 });
```

### Configuration Redis
Pour la production, configurez la persistance Redis :

```yaml
# Dans docker-compose.yml
redis:
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
```

## Checklist de Sécurité

- [ ] Tous les secrets sont des variables d'environnement (non codés en dur)
- [ ] CORS est restreint à votre domaine
- [ ] La limitation de débit (Rate limiting) est activée (Throttler)
- [ ] Les en-têtes de sécurité Helmet sont actifs
- [ ] La sanitization MongoDB est activée
- [ ] SSL/TLS est configuré
- [ ] Les règles de pare-feu sont définies (ports 80, 443, 22 uniquement)
- [ ] Authentification SSH par clé uniquement (pas de mot de passe)
- [ ] Mises à jour de sécurité régulières (`apt update && apt upgrade`)

## Dépannage (Troubleshooting)

### Le conteneur ne démarre pas
```bash
docker-compose logs backend
docker-compose down && docker-compose up -d
```

### Problèmes de connexion à la base de données
```bash
# Vérifier que MongoDB tourne
docker-compose ps mongo

# Tester la connexion
docker exec -it jom_mongo mongosh
```

### Utilisation mémoire élevée
```bash
# Vérifier les processus PM2
pm2 monit

# Redémarrer si nécessaire
pm2 restart jom-backend
```

## Maintenance

### Mises à jour
```bash
# Récupérer le dernier code
git pull origin main

# Reconstruire et redémarrer
docker-compose up -d --build

# Ou avec PM2
npm run build
pm2 reload ecosystem.config.js
```

### Migrations de Base de Données
```bash
# Exécuter les migrations (si implémentées)
npm run migrate
```

## Support

Pour tout problème ou question :
- Vérifiez les logs : `docker-compose logs -f`
- Consultez l'endpoint de santé : `/health`
- Vérifiez les métriques : `/metrics`
