# Project 09: GitOps Deployment Pipeline

## Overview

This project demonstrates **GitOps Deployment Pipeline** using **ArgoCD** for automated deployments across multiple environments (dev, staging, prod). It implements a NestJS application that manages ArgoCD Applications and follows the App of Apps pattern.

## 🎯 Domain: CI/CD & DevOps

**Problem Solved:** Implement GitOps workflow for automated deployments with multi-environment support and automated sync policies.

## 🏗️ Architecture

### Domain-Driven Design (DDD)

```
src/
├── domain/
│   ├── entities/
│   │   └── deployment-entity.ts          # Deployment business entity
│   ├── value-objects/
│   │   ├── sync-status.vo.ts            # Sync status VO
│   │   └── deployment-config.vo.ts     # Deployment config VO
│   └── domain-services/
│       └── gitops.service.ts           # Core GitOps logic
├── application/
│   └── use-cases/
│       ├── create-deployment.use-case.ts
│       ├── sync-deployment.use-case.ts
│       ├── get-deployment-status.use-case.ts
│       └── list-deployments.use-case.ts
├── infrastructure/
│   └── external/
│       ├── argocd-application.service.ts  # ArgoCD Application API client
│       └── logger.service.ts
└── presentation/
    ├── controllers/
    │   ├── deployment.controller.ts    # Deployment API endpoints
    │   └── health.controller.ts       # Health check endpoints
    └── dto/
        └── deployment.dto.ts
```

## ✨ Features

### 1. **GitOps Principles**
- Git as single source of truth
- Declarative configuration
- Automated synchronization
- Self-healing capabilities

### 2. **App of Apps Pattern**
- Root application manages all environments
- Hierarchical application structure
- Centralized configuration management

### 3. **Multi-Environment Support**
- **Dev**: Automated sync, self-heal, prune enabled
- **Staging**: Manual sync, prune enabled
- **Prod**: Manual sync, tagged releases only

### 4. **Sync Policies**
- Automated sync for dev environment
- Manual approval for staging/prod
- Self-healing for dev
- Prune policies per environment

### 5. **Health Checks**
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`
- Startup probe: `/health/startup`

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Kubernetes cluster
- ArgoCD installed
- Helm 3.x
- kubectl configured

### Install ArgoCD

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

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
docker build -t gitops-deployment:latest -f docker/Dockerfile .
```

### Kubernetes Deployment

#### Using Kustomize

```bash
# Deploy ArgoCD Applications
kubectl apply -k k8s/base/

# Verify applications
kubectl get applications -n argocd
```

## 📊 GitOps Workflow

### Repository Structure

```
gitops-repo/
├── apps/
│   ├── app-of-apps.yaml          # Root application
│   └── my-app/
│       ├── dev/
│       │   ├── kustomization.yaml
│       │   └── values.yaml
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── values.yaml
│       └── prod/
│           ├── kustomization.yaml
│           └── values.yaml
└── README.md
```

### Deployment Flow

1. **Developer pushes code** → Git repository
2. **CI/CD pipeline** → Builds and tests
3. **Git commit** → Updates GitOps repository
4. **ArgoCD detects changes** → Compares Git vs cluster
5. **Sync policy** → Determines if auto-sync or manual
6. **Deployment** → Applies changes to cluster

### Example: Create Deployment

```bash
# Create dev deployment
curl -X POST http://localhost:3000/deployments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app-dev",
    "environment": "dev",
    "gitRepo": "https://github.com/user/gitops-repo",
    "gitPath": "apps/my-app/dev",
    "namespace": "dev",
    "syncPolicy": {
      "automated": true,
      "prune": true,
      "selfHeal": true
    }
  }'
```

### Example: Manual Sync

```bash
# Trigger manual sync
curl -X POST http://localhost:3000/deployments/my-app-staging/sync?namespace=argocd
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Domain entities and value objects
- Domain services (GitOps logic)
- Use cases

### Integration Tests

```bash
npm run test:integration
```

Tests cover:
- API endpoints
- Deployment operations
- ArgoCD Application creation

### Test Coverage

```bash
npm run test:cov
```

## 📈 Monitoring

### Check Deployment Status

```bash
# Get deployment status
curl http://localhost:3000/deployments/my-app-dev?namespace=argocd

# List all deployments
curl http://localhost:3000/deployments

# Check ArgoCD Applications
kubectl get applications -n argocd

# View application details
kubectl describe application my-app-dev -n argocd
```

### ArgoCD UI

```bash
# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open browser
open https://localhost:8080
# Username: admin
# Password: (from secret)
```

## 🔧 API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api
- Production: https://your-domain/api

### Key Endpoints

- `POST /deployments` - Create a GitOps deployment
- `GET /deployments` - List all deployments
- `GET /deployments/:name` - Get deployment status
- `POST /deployments/:name/sync` - Manually trigger sync
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/startup` - Startup probe

## 🛠️ Configuration

### Environment Variables

```bash
PORT=3000                          # Application port
LOG_LEVEL=info                     # Logging level
```

### Sync Policies

#### Dev Environment
```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

#### Staging Environment
```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: false
```

#### Prod Environment
```yaml
syncPolicy:
  automated: false
  syncOptions:
    - CreateNamespace=true
```

## 🎓 Skills Demonstrated

### Kubernetes
- ✅ GitOps principles
- ✅ ArgoCD Applications
- ✅ App of Apps pattern
- ✅ Multi-environment deployments
- ✅ Sync policies

### Architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture layers
- ✅ Test-Driven Development (TDD)
- ✅ SOLID principles

### DevOps
- ✅ CI/CD pipelines
- ✅ GitOps workflows
- ✅ Automated deployments
- ✅ Environment management

### GitOps
- ✅ Git as source of truth
- ✅ Declarative configuration
- ✅ Automated synchronization
- ✅ Self-healing

## 📚 Best Practices Implemented

1. **DDD Structure**: Clear domain boundaries
2. **TDD**: Tests written first, comprehensive coverage
3. **GitOps**: Git as single source of truth
4. **Multi-Environment**: Separate configs per environment
5. **Sync Policies**: Appropriate automation per environment
6. **App of Apps**: Hierarchical application management
7. **Documentation**: Complete API docs and README

## 🐛 Troubleshooting

### Application Not Syncing

1. Check ArgoCD Application status:
   ```bash
   kubectl get application my-app-dev -n argocd
   kubectl describe application my-app-dev -n argocd
   ```

2. Check Git repository access:
   ```bash
   # Verify repo URL and credentials
   kubectl get secret -n argocd | grep repo
   ```

3. Check sync policy:
   ```bash
   kubectl get application my-app-dev -n argocd -o yaml | grep syncPolicy
   ```

### Sync Errors

1. Check application events:
   ```bash
   kubectl get events -n argocd --field-selector involvedObject.name=my-app-dev
   ```

2. Check ArgoCD logs:
   ```bash
   kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller
   ```

3. Verify Git repository:
   ```bash
   # Ensure Git repo is accessible
   git ls-remote <repo-url>
   ```

### Health Check Failures

1. Check application health:
   ```bash
   kubectl get application my-app-dev -n argocd -o jsonpath='{.status.health}'
   ```

2. Check sync status:
   ```bash
   kubectl get application my-app-dev -n argocd -o jsonpath='{.status.sync}'
   ```

## 📖 References

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://www.gitops.tech/)
- [App of Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/)
- [ArgoCD Applications](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)

## 📄 License

MIT

---

**Project Status**: ✅ Complete  
**Tests**: ✅ 18/18 passing  
**Coverage**: ✅ Domain, Application, Infrastructure, Presentation layers  
**Documentation**: ✅ Complete with GitOps workflow guide

