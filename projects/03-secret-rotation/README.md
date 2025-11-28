# 03. Secret Rotation Automation

**Domain:** Security & Compliance  
**Problem:** Automatically rotate secrets without service interruption.

## 🎯 Overview

This project implements an automated secret rotation system for Kubernetes that rotates secrets periodically without service interruption. It follows Domain-Driven Design (DDD) and Test-Driven Development (TDD) principles.

## 🏗️ Architecture (DDD)

### Domain Layer
- **Entities:** `SecretRotationEntity` - Represents a secret rotation operation
- **Value Objects:** 
  - `SecretKeyVO` - Secret identifier (name + namespace)
  - `RotationStatusVO` - Rotation status (pending, in_progress, success, failed)

### Application Layer
- **Use Cases:**
  - `RotateSecretUseCase` - Rotate a specific secret
  - `GetRotationStatusUseCase` - Get rotation status
  - `RotateAllDueUseCase` - Rotate all secrets that are due

### Infrastructure Layer
- **External Services:**
  - `KubernetesSecretService` - Interacts with Kubernetes Secrets API
  - `AppLoggerService` - Structured logging

### Presentation Layer
- **Controllers:** `RotationController` - REST API endpoints
- **DTOs:** `RotationResponseDto`, `RotateAllResponseDto` - API response structures

## 🧪 Testing (TDD)

### Test Coverage
- **Unit Tests:** Domain entities, value objects, domain services
- **Integration Tests:** Controller endpoints

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
- Kubernetes cluster access (or minikube/kind)

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
docker build -t secret-rotation:latest -f docker/Dockerfile .
```

### Run
```bash
docker run -p 3000:3000 \
  -v ~/.kube/config:/root/.kube/config \
  secret-rotation:latest
```

## ☸️ Kubernetes Deployment

### With Helm (Recommended)
```bash
# Deploy
make deploy

# View resources
make kubectl:get:all

# View logs
make kubectl:logs

# Rotate a secret manually
make kubectl:rotate-secret
```

### With kubectl + Kustomize
```bash
# Apply base manifests
kubectl apply -k k8s/base/

# Check CronJob
kubectl get cronjob secret-rotation-job

# Check Pod Disruption Budget
kubectl get pdb secret-rotation

# Check RBAC
kubectl get role,rolebinding secret-rotation
```

### Demonstrating Secret Rotation

1. **Deploy the application:**
```bash
kubectl apply -k k8s/base/
```

2. **Register a secret for rotation:**
```bash
kubectl port-forward svc/secret-rotation 3000:80
curl -X POST http://localhost:3000/rotation/secret/default/my-secret
```

3. **Check rotation status:**
```bash
curl http://localhost:3000/rotation/secret/default/my-secret
```

4. **Rotate all due secrets:**
```bash
curl -X POST http://localhost:3000/rotation/rotate-all
```

5. **Verify secret was rotated:**
```bash
kubectl get secret my-secret -o jsonpath='{.data.password}' | base64 -d
```

## 📊 API Endpoints

### POST /rotation/secret/:namespace/:name
Rotate a specific secret.

**Response:**
```json
{
  "success": true,
  "message": "Secret rotated successfully",
  "rotation": {
    "secretName": "my-secret",
    "namespace": "default",
    "status": "success",
    "message": "Rotation completed successfully",
    "rotationCount": 1,
    "lastRotationTime": "2024-01-01T00:00:00.000Z",
    "nextRotationTime": "2024-01-02T00:00:00.000Z",
    "isHealthy": true
  }
}
```

### GET /rotation/secret/:namespace/:name
Get rotation status for a secret.

**Response:**
```json
{
  "success": true,
  "message": "Rotation status retrieved",
  "rotation": {
    "secretName": "my-secret",
    "namespace": "default",
    "status": "success",
    "rotationCount": 5,
    "lastRotationTime": "2024-01-01T00:00:00.000Z",
    "nextRotationTime": "2024-01-02T00:00:00.000Z",
    "isHealthy": true
  }
}
```

### POST /rotation/rotate-all
Rotate all secrets that are due.

**Response:**
```json
{
  "totalDue": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "secretName": "secret1",
      "namespace": "default",
      "status": "success",
      "rotationCount": 1
    }
  ]
}
```

### GET /rotation/status
Get status of all registered rotations.

**Response:**
```json
[
  {
    "secretName": "my-secret",
    "namespace": "default",
    "status": "success",
    "rotationCount": 5,
    "isHealthy": true
  }
]
```

## 🔐 Security Features

### RBAC (Role-Based Access Control)
- ServiceAccount with minimal required permissions
- Role with access to secrets and pods
- RoleBinding connecting ServiceAccount to Role

### Pod Disruption Budget
- Ensures minimum availability during rotations
- Prevents all pods from being disrupted simultaneously
- Configurable `minAvailable` or `maxUnavailable`

### CronJob
- Automated rotation on schedule (default: every 6 hours)
- Configurable schedule via Helm values
- Job history limits for cleanup

## 🎓 Skills Demonstrated

- ✅ Secret management in Kubernetes
- ✅ Pod Disruption Budgets (PDB)
- ✅ CronJobs for automation
- ✅ RBAC (Role-Based Access Control)
- ✅ Security automation
- ✅ Domain-Driven Design (DDD)
- ✅ Test-Driven Development (TDD)
- ✅ Kubernetes API client integration
- ✅ Helm charts with RBAC templates
- ✅ Structured logging

## 🔧 Configuration

### Environment Variables
- `PORT` - Application port (default: `3000`)
- `LOG_LEVEL` - Logging level (default: `info`)
- `ROTATION_INTERVAL_HOURS` - Hours between rotations (default: `24`)

### Helm Values
- `cronJob.schedule` - Cron schedule for automatic rotation (default: `"0 */6 * * *"`)
- `podDisruptionBudget.minAvailable` - Minimum pods available during disruption
- `rbac.rules` - RBAC rules for secret access

## 📚 Next Steps

1. Add secret rotation notifications (webhooks)
2. Add rotation history and audit logging
3. Add support for External Secrets Operator
4. Add metrics for rotation events
5. Add health checks endpoint

---

**Built with ❤️ following DDD and TDD principles**

