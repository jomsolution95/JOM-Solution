# Production Deployment Checklist

## Pre-Deployment Checklist

### 🔐 Security

#### Authentication & Authorization
- [ ] All JWT secrets (`JWT_SECRET`, `AT_SECRET`, `RT_SECRET`) are strong random strings (min 32 characters)
- [ ] Secrets are stored in environment variables, not hardcoded
- [ ] Refresh token rotation is working correctly
- [ ] Password hashing uses bcrypt with appropriate rounds (10+)
- [ ] Role-based access control (RBAC) is properly configured
- [ ] Admin routes are protected with `RolesGuard`

#### API Security
- [ ] CORS is configured with specific origins (not `*`)
- [ ] Helmet security headers are enabled
- [ ] Rate limiting is active (Throttler: 10 req/min default)
- [ ] Input validation is enforced on all endpoints (DTOs)
- [ ] MongoDB injection protection is enabled (`express-mongo-sanitize`)
- [ ] XSS protection is active
- [ ] CSRF protection is considered (if using cookies)

#### Network Security
- [ ] SSL/TLS certificates are installed and valid
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate auto-renewal is configured (Let's Encrypt)
- [ ] Firewall rules are set (only ports 80, 443, 22 open)
- [ ] SSH is key-based only (password auth disabled)
- [ ] Fail2ban or similar is configured for SSH protection

#### Data Security
- [ ] Sensitive data is encrypted at rest (if applicable)
- [ ] Database connections use authentication
- [ ] Redis is password-protected (if exposed)
- [ ] Audit logging is enabled for critical operations
- [ ] PII data handling complies with regulations (GDPR, etc.)

---

### 🗄️ Database

#### MongoDB Configuration
- [ ] Production database is separate from development
- [ ] Database credentials are strong and unique
- [ ] Connection string uses authentication
- [ ] Database indexes are created for performance:
  ```javascript
  db.users.createIndex({ email: 1 }, { unique: true })
  db.profiles.createIndex({ userId: 1 })
  db.jobs.createIndex({ status: 1, createdAt: -1 })
  db.services.createIndex({ provider: 1, status: 1 })
  db.orders.createIndex({ buyer: 1, seller: 1 })
  db.messages.createIndex({ conversationId: 1, createdAt: -1 })
  ```
- [ ] Database backup strategy is implemented
- [ ] Backup script is tested and working
- [ ] Automated daily backups are scheduled (cron)
- [ ] Backup restoration has been tested
- [ ] Database monitoring is configured

#### Migrations
- [ ] All schema changes are documented
- [ ] Migration scripts are prepared (if needed)
- [ ] Rollback plan is ready
- [ ] Migrations are tested in staging environment
- [ ] Data integrity checks are in place

---

### 🧪 Testing

#### Automated Tests
- [ ] All unit tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Test coverage is adequate (>80% for critical paths)
- [ ] Load testing has been performed
- [ ] Security testing/scanning completed

#### Manual Testing
- [ ] Authentication flow works (register, login, logout, refresh)
- [ ] All critical user journeys tested
- [ ] WebSocket connections work (messaging, notifications)
- [ ] Payment flow is tested (with test credentials)
- [ ] File uploads work correctly
- [ ] Email notifications are sent
- [ ] Error handling is graceful

---

### 🚀 Performance & Optimization

#### Caching
- [ ] Redis is configured and running
- [ ] Cache invalidation strategy is implemented
- [ ] Cache hit rates are monitored
- [ ] Cache TTL values are appropriate
- [ ] Cache warming strategy (if needed)

#### CDN & Assets
- [ ] Static assets are served via CDN (or planned)
- [ ] S3/CloudFront is configured for uploads (if applicable)
- [ ] Image optimization is implemented
- [ ] Asset versioning/cache busting is configured

#### Nginx Optimization
- [ ] Gzip compression is enabled
- [ ] Client-side caching headers are set
- [ ] Connection timeouts are optimized
- [ ] Buffer sizes are tuned
- [ ] Access logs are configured (but not excessive)

#### Application Performance
- [ ] Database queries are optimized (no N+1 queries)
- [ ] Pagination is implemented for large datasets
- [ ] Heavy operations are queued (BullMQ)
- [ ] PM2 cluster mode is configured
- [ ] Memory leaks have been checked

---

### 📊 Monitoring & Logging

#### Logging
- [ ] Winston logger is configured for production
- [ ] Log levels are appropriate (info/warn/error)
- [ ] Sensitive data is not logged (passwords, tokens)
- [ ] Log rotation is configured (daily rotate)
- [ ] Logs are structured (JSON format)
- [ ] Loki integration is configured (if using Grafana)

#### Monitoring
- [ ] Health check endpoint is working: `/health`
- [ ] Metrics endpoint is exposed: `/metrics`
- [ ] Prometheus is configured to scrape metrics
- [ ] Grafana dashboards are set up (optional)
- [ ] Uptime monitoring is configured (UptimeRobot, etc.)
- [ ] Error tracking is set up (Sentry, etc.)
- [ ] Performance monitoring is active (APM)

#### Alerts
- [ ] Critical error alerts are configured
- [ ] High memory/CPU alerts are set
- [ ] Database connection failure alerts
- [ ] Disk space alerts
- [ ] SSL certificate expiry alerts

---

### 🔄 CI/CD Pipeline

#### GitHub Actions
- [ ] Workflow file is configured: `.github/workflows/deploy.yml`
- [ ] All required secrets are added to GitHub:
  - [ ] `SSH_HOST`
  - [ ] `SSH_USER`
  - [ ] `SSH_KEY`
  - [ ] `GITHUB_TOKEN` (auto-provided)
- [ ] Pipeline runs successfully on push to `main`
- [ ] Tests run before deployment
- [ ] Docker image builds and pushes to registry
- [ ] Deployment to server works
- [ ] Rollback procedure is documented

---

### 🐳 Docker & Containerization

#### Docker Configuration
- [ ] Dockerfile is optimized (multi-stage build)
- [ ] Image size is reasonable (<500MB)
- [ ] `.dockerignore` is configured
- [ ] Health checks are defined in Dockerfile
- [ ] Non-root user is used in container

#### Docker Compose
- [ ] All services are defined (backend, mongo, redis, nginx)
- [ ] Environment variables are properly passed
- [ ] Volumes are configured for persistence:
  - [ ] MongoDB data: `mongo_data`
  - [ ] Redis data (if persistence needed)
  - [ ] Application logs
- [ ] Networks are properly configured
- [ ] Resource limits are set (if needed)

---

### 🌍 Environment & Configuration

#### Environment Variables
- [ ] `.env.production` is created from template
- [ ] All required variables are set
- [ ] No development/test values in production
- [ ] Secrets are properly secured
- [ ] Environment-specific configs are correct

#### Server Configuration
- [ ] Server OS is updated: `apt update && apt upgrade`
- [ ] Required software is installed (Docker, Node, PM2)
- [ ] Timezone is set correctly
- [ ] NTP is configured for time sync
- [ ] Swap space is configured (if needed)
- [ ] File descriptor limits are increased (if needed)

---

### 💾 Backup & Recovery

#### Backup Strategy
- [ ] Automated daily backups are scheduled
- [ ] Backup script is tested: `scripts/backup_mongo.sh`
- [ ] Backups are stored off-site (S3, etc.)
- [ ] Backup retention policy is defined (e.g., 30 days)
- [ ] Backup encryption is configured (if needed)

#### Disaster Recovery
- [ ] Recovery procedure is documented
- [ ] Recovery has been tested in staging
- [ ] RTO (Recovery Time Objective) is defined
- [ ] RPO (Recovery Point Objective) is defined
- [ ] Backup restoration is tested regularly

---

### 📈 Scaling & High Availability

#### Horizontal Scaling
- [ ] Application is stateless (sessions in Redis)
- [ ] Load balancer is configured (if multi-instance)
- [ ] Session affinity is handled correctly
- [ ] Database connection pooling is optimized
- [ ] File uploads go to shared storage (S3)

#### Vertical Scaling
- [ ] Server resources are adequate (CPU, RAM, Disk)
- [ ] Resource monitoring is in place
- [ ] Scaling triggers are defined
- [ ] Auto-scaling is configured (if cloud)

---

### 📝 Documentation

#### Technical Documentation
- [ ] README.md is complete and accurate
- [ ] DEPLOYMENT.md covers all deployment steps
- [ ] API documentation is up to date
- [ ] Architecture diagrams are created (optional)
- [ ] Runbooks are prepared for common issues

#### Operational Documentation
- [ ] Deployment procedure is documented
- [ ] Rollback procedure is documented
- [ ] Incident response plan is ready
- [ ] On-call rotation is defined (if applicable)
- [ ] Contact information is current

---

### ✅ Final Verification

#### Pre-Launch
- [ ] Staging environment matches production
- [ ] Full end-to-end test in staging
- [ ] Performance testing completed
- [ ] Security audit/scan completed
- [ ] All team members are informed
- [ ] Launch checklist is reviewed

#### Launch Day
- [ ] Database migrations run successfully
- [ ] Application starts without errors
- [ ] Health checks pass
- [ ] Monitoring dashboards show green
- [ ] Critical user flows tested in production
- [ ] DNS is updated (if applicable)
- [ ] SSL certificate is valid
- [ ] No errors in logs

#### Post-Launch
- [ ] Monitor logs for errors (first 24 hours)
- [ ] Check performance metrics
- [ ] Verify backup ran successfully
- [ ] Test critical features
- [ ] Gather user feedback
- [ ] Document any issues and resolutions

---

## Emergency Contacts

- **DevOps Lead**: [Name/Contact]
- **Backend Lead**: [Name/Contact]
- **Database Admin**: [Name/Contact]
- **On-Call Engineer**: [Name/Contact]

## Rollback Procedure

If critical issues are discovered:

1. **Immediate**: Revert to previous Docker image
   ```bash
   docker-compose down
   docker pull ghcr.io/your-repo/backend:previous-tag
   docker-compose up -d
   ```

2. **Database**: Restore from latest backup if needed
   ```bash
   mongorestore --uri="mongodb://..." /path/to/backup
   ```

3. **Notify**: Alert team and stakeholders
4. **Investigate**: Review logs and metrics
5. **Fix**: Address issues in development
6. **Redeploy**: After thorough testing

---

## Sign-Off

- [ ] Technical Lead Approval: _________________ Date: _______
- [ ] Security Review: _________________ Date: _______
- [ ] DevOps Approval: _________________ Date: _______
- [ ] Product Owner Approval: _________________ Date: _______

---

**Last Updated**: 2025-12-09
**Version**: 1.0
**Next Review**: Before each major deployment
