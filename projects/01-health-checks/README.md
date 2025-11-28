# 01. Multi-Stage Health Check System

**Domain:** Observability & Reliability  
**Problem:** Need comprehensive health checks that differentiate between liveness, readiness, and startup states.

## 🎯 Overview

This project implements a production-ready health check system following Domain-Driven Design (DDD) and Test-Driven Development (TDD) principles. It provides three distinct health check endpoints:

- `/health/live` - Liveness probe (is the app running?)
- `/health/ready` - Readiness probe (is the app ready to serve traffic?)
- `/health/startup` - Startup probe (has the app finished initializing?)

## 🏗️ Architecture (DDD)

### Domain Layer
- **Entities:** `HealthStatusEntity` - Represents application health status
- **Value Objects:** `HealthCheckResult` - Immutable health check result
- **Domain Services:** `HealthCheckDomainService` - Core health check logic

### Application Layer
- **Use Cases:**
  - `CheckLivenessUseCase` - Liveness check use case
  - `CheckReadinessUseCase` - Readiness check use case
  - `CheckStartupUseCase` - Startup check use case

### Infrastructure Layer
- (To be implemented: Database checks, external service checks)

### Presentation Layer
- **Controllers:** `HealthController` - REST API endpoints
- **DTOs:** `HealthResponseDto` - API response structure

## 🧪 Testing (TDD)

### Test Coverage
- **Unit Tests:** Domain entities, value objects, domain services
- **Integration Tests:** Controller endpoints
- **E2E Tests:** Full application flow

### Running Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage
npm run test:cov
```

## 🚀 Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build
npm run build

# Start production
npm run start:prod
```

### API Documentation
Once running, visit: http://localhost:3000/api

## 🐳 Docker

### Build
```bash
docker build -t health-checks:latest -f docker/Dockerfile .
```

### Run
```bash
docker run -p 3000:3000 health-checks:latest
```

## ☸️ Kubernetes Deployment

### With Helm (Recommended)
```bash
# Deploy
make deploy

# Undeploy
make undeploy

# View resources
make kubectl:get:all

# View logs
make kubectl:logs
```

### With kubectl + Kustomize
```bash
# Apply base manifests
kubectl apply -k k8s/base/

# Apply with environment overlay
kubectl apply -k k8s/overlays/dev/
kubectl apply -k k8s/overlays/staging/
kubectl apply -k k8s/overlays/prod/
```

### With kubectl (direct)
```bash
kubectl apply -f k8s/base/deployment.yaml
kubectl apply -f k8s/base/service.yaml
```

## 📊 Health Check Endpoints

### Liveness Probe
```bash
curl http://localhost:3000/health/live
```

Response:
```json
{
  "status": "healthy",
  "message": "Application is alive",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Readiness Probe
```bash
curl http://localhost:3000/health/ready
```

### Startup Probe
```bash
curl http://localhost:3000/health/startup
```

### Complete Health Check
```bash
curl http://localhost:3000/health
```

### Health Check History
```bash
curl http://localhost:3000/health/history?limit=10
```

Response:
```json
{
  "history": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "liveness": { "status": "healthy", "message": "Alive" },
      "readiness": { "status": "ready", "message": "Ready" },
      "startup": { "status": "started", "message": "Started" },
      "overallStatus": "healthy"
    }
  ],
  "stats": {
    "totalChecks": 100,
    "healthyCount": 95,
    "degradedCount": 3,
    "unhealthyCount": 2,
    "uptimePercentage": 95.0
  }
}
```

### Circuit Breaker States
```bash
curl http://localhost:3000/health/circuits
```

Response:
```json
{
  "circuits": [
    {
      "circuitName": "system-resources",
      "state": "closed",
      "failureCount": 0,
      "lastFailureTime": null,
      "nextAttemptTime": null
    }
  ]
}
```

## 🎓 Skills Demonstrated

- ✅ Domain-Driven Design (DDD)
- ✅ Test-Driven Development (TDD)
- ✅ Clean Architecture
- ✅ Kubernetes Probes (Liveness, Readiness, Startup)
- ✅ **Circuit Breaker Pattern** - Advanced resilience pattern
- ✅ **Health Check History** - Observability and uptime tracking
- ✅ Prometheus metrics
- ✅ Structured logging (Winston)
- ✅ NestJS Best Practices
- ✅ Docker Multi-stage Builds
- ✅ Helm Charts

## 🚀 Advanced Features

### Circuit Breaker Pattern
- Protects against cascading failures
- States: CLOSED → OPEN → HALF_OPEN
- Auto-recovery after timeout
- Configurable failure thresholds
- Applied to dependency health checks

### Health Check History
- Tracks all health check results
- Calculates uptime statistics
- Provides historical data for analysis
- Configurable history size (default: 100 records)

