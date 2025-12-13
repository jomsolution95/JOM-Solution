# JOM Backend API

A comprehensive NestJS backend for a freelance marketplace platform with real-time messaging, payments, and advanced features.

## Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control (RBAC)
- **User Management**: Profiles, roles (freelancer, client, admin)
- **Job Marketplace**: Job postings, applications, status tracking
- **Service Listings**: Freelancer services with packages and pricing
- **Orders & Payments**: Escrow system, payment processing, transaction management
- **Real-time Messaging**: WebSocket-based chat with conversation management
- **Notifications**: Multi-channel (in-app, email, push) with Redis queuing

### Advanced Features
- **Caching**: Redis-based global caching for performance
- **Security**: Helmet, CORS, rate limiting, input sanitization, audit logging
- **Monitoring**: Winston logging, Prometheus metrics, health checks
- **Testing**: Unit tests (Jest) and E2E tests (Supertest)
- **Containerization**: Docker and Docker Compose ready
- **CI/CD**: GitHub Actions pipeline for automated deployment

## Tech Stack

- **Framework**: NestJS 11
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Queue**: BullMQ
- **Authentication**: Passport JWT
- **WebSockets**: Socket.io
- **Logging**: Winston (with Loki integration)
- **Monitoring**: Prometheus, Terminus
- **Testing**: Jest, Supertest
- **Container**: Docker, Docker Compose
- **Process Manager**: PM2

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.development.template .env.development

# Update environment variables
nano .env.development
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode (with PM2)
```bash
npm run build
pm2 start ecosystem.config.js --env production
```

#### Docker Mode
```bash
docker-compose up -d
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://yourdomain.com/api`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token

#### Users & Profiles
- `GET /api/users/me` - Get current user
- `GET /api/profiles` - List profiles
- `GET /api/profiles/:id` - Get profile details
- `PATCH /api/profiles/:id` - Update profile

#### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job details
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

#### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `GET /api/services/:id` - Get service details

#### Orders & Payments
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/webhook` - Payment webhook

#### Messaging
- `GET /api/messaging/conversations` - List conversations
- `POST /api/messaging/conversations` - Create conversation
- `GET /api/messaging/conversations/:id/messages` - Get messages
- WebSocket: `ws://localhost:3001` - Real-time messaging

#### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- WebSocket: Connect for real-time notifications

#### Monitoring
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Project Structure

```
backend/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── profiles/
│   │   ├── jobs/
│   │   ├── services/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── escrow/
│   │   ├── messaging/
│   │   ├── notifications/
│   │   ├── admin/
│   │   ├── health/
│   │   └── metrics/
│   ├── common/           # Shared utilities
│   │   ├── cache/
│   │   ├── logger/
│   │   ├── audit/
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── dto/
│   ├── app.module.ts
│   └── main.ts
├── test/                 # E2E tests
├── scripts/              # Utility scripts
├── nginx/                # Nginx configuration
├── .github/workflows/    # CI/CD pipelines
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js   # PM2 configuration
└── DEPLOYMENT.md         # Deployment guide
```

## Environment Variables

See `.env.development.template` and `.env.production.template` for all available configuration options.

### Essential Variables
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST` / `REDIS_PORT` - Redis configuration
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:
- Production environment setup
- Docker deployment
- PM2 process management
- Database backups
- SSL/TLS configuration
- CI/CD pipeline setup
- Monitoring and logging

## Security

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Throttler guard (10 requests/minute)
- **Input Validation**: Class-validator DTOs
- **Sanitization**: MongoDB injection prevention
- **Headers**: Helmet security headers
- **Audit**: Request logging middleware
- **CORS**: Strict origin policy

## Performance

- **Caching**: Redis caching for frequently accessed data (5-minute TTL)
- **Database**: Indexed queries, connection pooling
- **Clustering**: PM2 cluster mode for multi-core utilization
- **Compression**: Gzip compression via Nginx
- **CDN**: Ready for S3/CloudFront integration

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure tests pass: `npm run test`
5. Submit a pull request

## License

Private - All rights reserved
