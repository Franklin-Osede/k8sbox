# Project 07: Custom Kubernetes Operator (CRD + Controller)

## Overview

This project demonstrates **Custom Kubernetes Operator** development with **Custom Resource Definitions (CRD)** and **Controller** implementation. It implements a NestJS-based operator that manages custom `Application` resources and automatically creates/updates Deployments and Services.

## 🎯 Domain: Platform Engineering

**Problem Solved:** Create custom Kubernetes resources for managing application-specific resources with automated reconciliation logic.

## 🏗️ Architecture

### Domain-Driven Design (DDD)

```
src/
├── domain/
│   ├── entities/
│   │   └── custom-resource-entity.ts      # Custom resource business entity
│   ├── value-objects/
│   │   ├── resource-status.vo.ts          # Resource status VO
│   │   └── resource-spec.vo.ts            # Resource spec VO
│   └── domain-services/
│       └── reconciliation.service.ts      # Core reconciliation logic
├── application/
│   └── use-cases/
│       ├── reconcile-resource.use-case.ts
│       ├── list-resources.use-case.ts
│       └── get-resource.use-case.ts
├── infrastructure/
│   └── external/
│       ├── kubernetes-crd.service.ts      # Kubernetes CRD API client
│       └── logger.service.ts
└── presentation/
    ├── controllers/
    │   ├── resource.controller.ts         # Resource API endpoints
    │   ├── operator.controller.ts        # Operator controller (reconciliation)
    │   └── health.controller.ts          # Health check endpoints
    └── dto/
        └── resource.dto.ts
```

## ✨ Features

### 1. **Custom Resource Definition (CRD)**
- `Application` CRD with spec and status
- OpenAPI schema validation
- Status subresource support
- Short names for easy access

### 2. **Operator Controller**
- Watches custom resources
- Automatic reconciliation loop
- Periodic reconciliation (every minute)
- Status updates

### 3. **Reconciliation Logic**
- Creates Deployment from Application spec
- Creates Service for the Deployment
- Updates resources when spec changes
- Handles resource deletion
- Tracks observed generation

### 4. **REST API**
- Create and reconcile resources
- List all resources
- Get resource details
- Manual reconciliation trigger

### 5. **Health Checks**
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`
- Startup probe: `/health/startup`

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Kubernetes cluster
- Helm 3.x
- kubectl configured

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run start:dev

# Build
npm run build
```

### Docker Build

```bash
docker build -t custom-operator:latest -f docker/Dockerfile .
```

### Kubernetes Deployment

#### Install CRD

```bash
# Install CRD
kubectl apply -f k8s/base/crd.yaml

# Verify CRD
kubectl get crd applications.platform.k8sbox.io
```

#### Using Helm

```bash
# Deploy operator with Helm
helm install custom-operator ./helm/custom-operator \
  --namespace default \
  --create-namespace

# Upgrade
helm upgrade custom-operator ./helm/custom-operator

# Uninstall
helm uninstall custom-operator
```

#### Using Kustomize

```bash
# Deploy base configuration
kubectl apply -k k8s/base/

# Deploy with overlays
kubectl apply -k k8s/overlays/prod/
```

## 📊 Custom Resource Definition

### Application CRD

```yaml
apiVersion: platform.k8sbox.io/v1
kind: Application
metadata:
  name: my-app
  namespace: default
spec:
  replicas: 3
  image: nginx:latest
  port: 80
  env:
    ENVIRONMENT: production
    LOG_LEVEL: info
```

### CRD Schema

- **spec.replicas**: Number of replicas (default: 1)
- **spec.image**: Container image (required)
- **spec.port**: Container port (required, 1-65535)
- **spec.env**: Environment variables (optional)

### Status Subresource

The CRD includes a status subresource that tracks:
- **status.status**: Current status (Pending, Reconciling, Ready, Failed)
- **status.message**: Status message
- **status.lastReconciledAt**: Last reconciliation timestamp
- **status.observedGeneration**: Observed generation

## 🔄 Reconciliation

### How It Works

1. **Watch**: Operator watches for `Application` resources
2. **Reconcile**: When a resource is created/updated, reconciliation starts
3. **Create/Update**: Creates or updates Deployment and Service
4. **Status Update**: Updates resource status with reconciliation result

### Reconciliation Triggers

- Resource creation
- Resource spec changes
- Periodic reconciliation (every minute)
- Manual reconciliation via API

### Example: Create Application

```bash
# Create Application resource
kubectl apply -f k8s/base/example-application.yaml

# Check Application status
kubectl get application example-app

# Check created Deployment
kubectl get deployment example-app

# Check created Service
kubectl get service example-app
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Domain entities and value objects
- Domain services (reconciliation logic)
- Use cases

### Integration Tests

```bash
npm run test:integration
```

Tests cover:
- API endpoints
- Resource operations
- Reconciliation flow

### Test Coverage

```bash
npm run test:cov
```

## 📈 Monitoring

### Check Operator Status

```bash
# Check operator pod
kubectl get pods -l app=custom-operator

# Check operator logs
kubectl logs -l app=custom-operator -f
```

### Check Application Resources

```bash
# List all Applications
kubectl get applications

# Get Application details
kubectl get application example-app -o yaml

# Watch Application status
kubectl get application example-app -w
```

### Check Created Resources

```bash
# List Deployments created by operator
kubectl get deployments -l app.kubernetes.io/managed-by=custom-operator

# List Services created by operator
kubectl get services -l app.kubernetes.io/managed-by=custom-operator
```

## 🔧 API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api
- Production: https://your-domain/api

### Key Endpoints

- `POST /resources` - Create and reconcile a resource
- `GET /resources` - List all resources
- `GET /resources/:name` - Get resource details
- `POST /resources/:name/reconcile` - Manually trigger reconciliation
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/startup` - Startup probe

### Example: Create Resource via API

```bash
curl -X POST http://localhost:3000/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-app",
    "namespace": "default",
    "spec": {
      "replicas": 3,
      "image": "nginx:latest",
      "port": 80,
      "env": {
        "ENV": "production"
      }
    }
  }'
```

## 🛠️ Configuration

### Environment Variables

```bash
PORT=3000                          # Application port
LOG_LEVEL=info                     # Logging level
```

### Helm Values

Key configuration options in `helm/custom-operator/values.yaml`:

- `replicas`: Number of operator replicas
- `crd.install`: Install CRD with Helm chart
- `rbac.create`: Create RBAC resources
- `rbac.rules`: RBAC permissions

## 🎓 Skills Demonstrated

### Kubernetes
- ✅ Custom Resource Definitions (CRD)
- ✅ Controller pattern
- ✅ Reconciliation logic
- ✅ Status subresources
- ✅ Owner references
- ✅ RBAC configuration

### Architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture layers
- ✅ Test-Driven Development (TDD)
- ✅ SOLID principles
- ✅ Operator pattern

### Platform Engineering
- ✅ CRD development
- ✅ Controller implementation
- ✅ Resource lifecycle management
- ✅ Status tracking

### DevOps
- ✅ Helm charts
- ✅ Kustomize overlays
- ✅ Docker multi-stage builds
- ✅ RBAC configuration

## 📚 Best Practices Implemented

1. **DDD Structure**: Clear domain boundaries
2. **TDD**: Tests written first, comprehensive coverage
3. **Security**: Non-root containers, RBAC, least privilege
4. **Observability**: Health checks and logging
5. **Operator Pattern**: Watch, reconcile, update status
6. **CRD Design**: Proper schema validation and status subresources
7. **Documentation**: Complete API docs and README

## 🐛 Troubleshooting

### CRD Not Found

1. Check if CRD is installed:
   ```bash
   kubectl get crd applications.platform.k8sbox.io
   ```

2. Install CRD:
   ```bash
   kubectl apply -f k8s/base/crd.yaml
   ```

### Operator Not Reconciling

1. Check operator logs:
   ```bash
   kubectl logs -l app=custom-operator -f
   ```

2. Check RBAC permissions:
   ```bash
   kubectl auth can-i create deployments \
     --as=system:serviceaccount:default:custom-operator
   ```

3. Check Application resource:
   ```bash
   kubectl get application example-app -o yaml
   ```

### Deployment Not Created

1. Check Application status:
   ```bash
   kubectl get application example-app -o jsonpath='{.status}'
   ```

2. Check operator logs for errors:
   ```bash
   kubectl logs -l app=custom-operator | grep -i error
   ```

3. Verify spec is valid:
   ```bash
   kubectl get application example-app -o yaml | grep -A 10 spec
   ```

## 📖 References

- [Kubernetes Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
- [Operator Pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [CRD Best Practices](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
- [Controller Pattern](https://kubernetes.io/docs/concepts/architecture/controller/)

## 📄 License

MIT

---

**Project Status**: ✅ Complete  
**Tests**: ✅ 22/22 passing  
**Coverage**: ✅ Domain, Application, Infrastructure, Presentation layers  
**Documentation**: ✅ Complete

