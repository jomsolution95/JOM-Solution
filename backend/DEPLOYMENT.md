# Production Deployment Guide

## Overview
This guide covers deploying the JOM Backend to a production environment with best practices for security, performance, and reliability.

## Prerequisites
- Ubuntu/Debian VPS with Docker and Docker Compose installed
- Domain name configured (optional but recommended)
- GitHub repository access
- SSH access to the server

## Environment Setup

### 1. Environment Variables
Copy `.env.production.template` to `.env.production` and update all values:

```bash
cp .env.production.template .env.production
nano .env.production
```

**Critical values to change:**
- `JWT_SECRET`, `AT_SECRET`, `RT_SECRET`: Generate strong random strings (min 32 chars)
- `MONGODB_URI`: Update with production database credentials
- `CORS_ORIGIN`: Set to your frontend domain
- `LOKI_HOST`: Configure if using Grafana Loki

### 2. Docker Deployment

```bash
# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f backend

# Verify health
curl http://localhost/api/health
```

### 3. PM2 Process Management (Alternative to Docker)

If running directly on the server without Docker:

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Database Backups

### Automated Daily Backups

1. Make the backup script executable:
```bash
chmod +x scripts/backup_mongo.sh
```

2. Configure AWS CLI (if using S3):
```bash
aws configure
```

3. Add to crontab for daily backups at 2 AM:
```bash
crontab -e
# Add this line:
0 2 * * * /path/to/backend/scripts/backup_mongo.sh >> /var/log/mongo-backup.log 2>&1
```

## Nginx Configuration

### SSL/TLS Setup (Production)

For production, replace the basic Nginx config with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Include the optimized config from nginx/nginx.conf
    include /etc/nginx/conf.d/jom-backend.conf;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Let's Encrypt SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com
```

## CI/CD with GitHub Actions

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

- `SSH_HOST`: Your server IP/hostname
- `SSH_USER`: SSH username (e.g., `ubuntu`)
- `SSH_KEY`: Private SSH key for authentication

### Deployment Flow

1. Push to `main` branch triggers the workflow
2. Tests run automatically
3. Docker image builds and pushes to GHCR
4. SSH deployment executes on the server
5. Services restart with zero downtime

## Monitoring

### Health Checks
- **Endpoint**: `GET /health`
- **Expected Response**: `{"status":"ok","info":{...}}`

### Metrics
- **Endpoint**: `GET /metrics`
- **Format**: Prometheus-compatible

### Logs
- **Location**: `./logs/application-YYYY-MM-DD.log`
- **Format**: JSON (structured)
- **Loki Integration**: Configure `LOKI_HOST` in environment

## Performance Optimization

### Database Indexes
Ensure MongoDB indexes are created for frequently queried fields:

```javascript
// Run in MongoDB shell
db.users.createIndex({ email: 1 }, { unique: true });
db.profiles.createIndex({ userId: 1 });
db.jobs.createIndex({ status: 1, createdAt: -1 });
db.services.createIndex({ provider: 1, status: 1 });
```

### Redis Configuration
For production, configure Redis persistence:

```yaml
# In docker-compose.yml
redis:
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
```

## Security Checklist

- [ ] All secrets are environment variables (not hardcoded)
- [ ] CORS is restricted to your domain
- [ ] Rate limiting is enabled (Throttler)
- [ ] Helmet security headers are active
- [ ] MongoDB sanitization is enabled
- [ ] SSL/TLS is configured
- [ ] Firewall rules are set (only ports 80, 443, 22)
- [ ] SSH key-based authentication (no passwords)
- [ ] Regular security updates (`apt update && apt upgrade`)

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose down && docker-compose up -d
```

### Database connection issues
```bash
# Check MongoDB is running
docker-compose ps mongo

# Test connection
docker exec -it jom_mongo mongosh
```

### High memory usage
```bash
# Check PM2 processes
pm2 monit

# Restart if needed
pm2 restart jom-backend
```

## Scaling Considerations

### Horizontal Scaling
- Use Docker Swarm or Kubernetes for multi-instance deployment
- Configure session storage in Redis (not in-memory)
- Use a load balancer (Nginx, HAProxy, or cloud LB)

### Database Scaling
- Consider MongoDB Atlas for managed scaling
- Implement read replicas for read-heavy workloads
- Use sharding for very large datasets

## Maintenance

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Or with PM2
npm run build
pm2 reload ecosystem.config.js
```

### Database Migrations
```bash
# Run migrations (when implemented)
npm run migrate
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review health endpoint: `/health`
- Check metrics: `/metrics`
