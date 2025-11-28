# Project 05: Pod Disruption Budget Manager

## Overview

This project demonstrates **Pod Disruption Budget (PDB) management** for ensuring high availability during cluster maintenance, updates, and node drains. It implements a NestJS application that manages PDBs and monitors availability guarantees.

## 🎯 Domain: High Availability

**Problem Solved:** Ensure minimum availability during cluster maintenance, rolling updates, and node drains by managing Pod Disruption Budgets.

## 🏗️ Architecture

### Domain-Driven Design (DDD)

```
src/
├── domain/
│   ├── entities/
│   │   └── pdb-entity.ts              # PDB business entity
│   ├── value-objects/
│   │   ├── availability-level.vo.ts   # Availability level VO
│   │   └── pdb-status.vo.ts           # PDB status VO
│   └── domain-services/
│       └── availability.service.ts   # Core availability logic
├── application/
│   └── use-cases/
│       ├── create-pdb.use-case.ts
│       ├── get-pdb-status.use-case.ts
│       ├── list-pdbs.use-case.ts
│       └── get-availability-summary.use-case.ts
├── infrastructure/
│   └── external/
│       ├── kubernetes-pdb.service.ts  # Kubernetes PDB API client
│       └── logger.service.ts
└── presentation/
    ├── controllers/
    │   ├── pdb.controller.ts          # PDB API endpoints
    │   └── health.controller.ts       # Health check endpoints
    └── dto/
        └── pdb.dto.ts
```

## ✨ Features

### 1. **Pod Disruption Budget Management**
- Create and update PDBs via API
- Monitor PDB status and violations
- List all PDBs in a namespace
- Delete PDBs when no longer needed

### 2. **Availability Monitoring**
- Track current healthy pods
- Monitor disrupted pods
- Calculate availability percentage
- Detect PDB violations

### 3. **High Availability Guarantees**
- Configure minAvailable or maxUnavailable
- Ensure minimum pods during disruptions
- Protect against node drains
- Maintain availability during rolling updates

### 4. **Health Checks**
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`
- Startup probe: `/health/startup`

### 5. **RBAC Integration**
- ServiceAccount with proper permissions
- Role and RoleBinding for PDB management
- Least privilege access

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
docker build -t pdb-manager:latest -f docker/Dockerfile .
```

### Kubernetes Deployment

#### Using Helm

```bash
# Deploy with Helm
helm install pdb-manager ./helm/pdb-manager \
  --namespace default \
  --create-namespace

# Upgrade
helm upgrade pdb-manager ./helm/pdb-manager

# Uninstall
helm uninstall pdb-manager
```

#### Using Kustomize

```bash
# Deploy base configuration
kubectl apply -k k8s/base/

# Deploy with overlays
kubectl apply -k k8s/overlays/prod/
```

## 📊 Pod Disruption Budget

### PDB Configuration

The PDB ensures that at least a minimum number of pods remain available during voluntary disruptions:

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: pdb-manager
spec:
  selector:
    matchLabels:
      app: pdb-manager
  minAvailable: 2  # At least 2 pods must be available
  # OR
  # maxUnavailable: 1  # Maximum 1 pod can be unavailable
```

### PDB Behavior

- **Voluntary Disruptions**: Node drains, rolling updates, pod deletions
- **Involuntary Disruptions**: Node failures (not protected by PDB)
- **Enforcement**: Kubernetes prevents voluntary disruptions that would violate PDB

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Domain entities and value objects
- Domain services (availability logic)
- Use cases

### Integration Tests

```bash
npm run test:integration
```

Tests cover:
- API endpoints
- PDB management operations
- Availability monitoring

### Test Coverage

```bash
npm run test:cov
```

## 📈 Availability Monitoring

### Get PDB Status

```bash
# Get specific PDB status
curl http://localhost:3000/pdb/my-pdb?namespace=default

# Response:
{
  "name": "my-pdb",
  "namespace": "default",
  "status": "healthy",
  "currentHealthy": 3,
  "desiredHealthy": 3,
  "disruptedPods": 0,
  "allowedDisruptions": 1,
  "availabilityPercentage": 100,
  "isHealthy": true,
  "isViolated": false
}
```

### List All PDBs

```bash
# List all PDBs in namespace
curl http://localhost:3000/pdb?namespace=default
```

### Get Availability Summary

```bash
# Get availability summary
curl http://localhost:3000/pdb/summary/availability?namespace=default

# Response:
{
  "totalPDBs": 5,
  "healthyPDBs": 4,
  "violatedPDBs": 1,
  "averageAvailability": 85.5
}
```

## 🔧 API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api
- Production: https://your-domain/api

### Key Endpoints

- `POST /pdb` - Create or update PDB
- `GET /pdb/:name` - Get PDB status
- `GET /pdb` - List all PDBs
- `GET /pdb/summary/availability` - Get availability summary
- `DELETE /pdb/:name` - Delete PDB
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/startup` - Startup probe

## 🛠️ Configuration

### Environment Variables

```bash
PORT=3000                          # Application port
LOG_LEVEL=info                     # Logging level
AVAILABILITY_THRESHOLD=80          # Minimum availability percentage
```

### Helm Values

Key configuration options in `helm/pdb-manager/values.yaml`:

- `replicaCount`: Number of replicas (default: 3)
- `podDisruptionBudget.enabled`: Enable/disable PDB
- `podDisruptionBudget.minAvailable`: Minimum available pods
- `podDisruptionBudget.maxUnavailable`: Maximum unavailable pods
- `rbac.create`: Create RBAC resources

## 🎓 Skills Demonstrated

### Kubernetes
- ✅ Pod Disruption Budgets (PDB)
- ✅ High availability patterns
- ✅ Rolling update strategies
- ✅ Node drain protection
- ✅ RBAC configuration

### Architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture layers
- ✅ Test-Driven Development (TDD)
- ✅ SOLID principles

### Observability
- ✅ Health checks
- ✅ Structured logging
- ✅ Availability monitoring

### DevOps
- ✅ Helm charts
- ✅ Kustomize overlays
- ✅ Docker multi-stage builds
- ✅ RBAC best practices

## 📚 Best Practices Implemented

1. **DDD Structure**: Clear domain boundaries
2. **TDD**: Tests written first, comprehensive coverage
3. **Security**: Non-root containers, RBAC, least privilege
4. **Observability**: Health checks and logging
5. **High Availability**: PDB configuration and monitoring
6. **Documentation**: Complete API docs and README

## 🐛 Troubleshooting

### PDB Not Enforcing

1. Check PDB status:
   ```bash
   kubectl describe pdb pdb-manager
   ```

2. Verify selector matches pods:
   ```bash
   kubectl get pods -l app=pdb-manager
   kubectl get pdb pdb-manager -o yaml
   ```

3. Check for violations:
   ```bash
   kubectl get pdb -o wide
   ```

### Pods Not Protected During Drain

1. Verify PDB is created:
   ```bash
   kubectl get pdb
   ```

2. Check PDB allows disruptions:
   ```bash
   kubectl get pdb pdb-manager -o jsonpath='{.status.disruptionsAllowed}'
   ```

3. Ensure enough replicas:
   ```bash
   kubectl get deployment pdb-manager
   ```

### RBAC Issues

1. Check ServiceAccount:
   ```bash
   kubectl get serviceaccount pdb-manager
   ```

2. Verify RoleBinding:
   ```bash
   kubectl get rolebinding pdb-manager
   ```

3. Check permissions:
   ```bash
   kubectl auth can-i create poddisruptionbudgets --as=system:serviceaccount:default:pdb-manager
   ```

## 📖 References

- [Kubernetes PDB Documentation](https://kubernetes.io/docs/tasks/run-application/configure-pod-disruption-budget/)
- [PDB Best Practices](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/)
- [High Availability Patterns](https://kubernetes.io/docs/tasks/run-application/high-availability/)

## 📄 License

MIT

---

**Project Status**: ✅ Complete  
**Tests**: ✅ 28/28 passing  
**Coverage**: ✅ Domain, Application, Infrastructure, Presentation layers  
**Documentation**: ✅ Complete

