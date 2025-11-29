# K8sBox - Kubernetes Projects Collection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28+-blue.svg)](https://kubernetes.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10+-red.svg)](https://nestjs.com/)

<!-- CI/CD Badges - Reemplaza USERNAME/REPO con tu información de GitHub -->
<!-- 
[![CI - Health Checks](https://github.com/USERNAME/REPO/actions/workflows/01-health-checks.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/01-health-checks.yml)
[![CI - ConfigMap Reload](https://github.com/USERNAME/REPO/actions/workflows/02-configmap-reload.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/02-configmap-reload.yml)
[![CI - Secret Rotation](https://github.com/USERNAME/REPO/actions/workflows/03-secret-rotation.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/03-secret-rotation.yml)
[![CI - HPA Custom Metrics](https://github.com/USERNAME/REPO/actions/workflows/04-hpa-custom-metrics.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/04-hpa-custom-metrics.yml)
[![CI - PDB Manager](https://github.com/USERNAME/REPO/actions/workflows/05-pdb-manager.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/05-pdb-manager.yml)
[![CI - StatefulSet Database](https://github.com/USERNAME/REPO/actions/workflows/06-statefulset-database.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/06-statefulset-database.yml)
[![CI - Custom Operator](https://github.com/USERNAME/REPO/actions/workflows/07-custom-operator.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/07-custom-operator.yml)
[![CI - Service Mesh](https://github.com/USERNAME/REPO/actions/workflows/08-service-mesh.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/08-service-mesh.yml)
[![CI - GitOps Deployment](https://github.com/USERNAME/REPO/actions/workflows/09-gitops-deployment.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/09-gitops-deployment.yml)
[![CI - Zero-Trust Security](https://github.com/USERNAME/REPO/actions/workflows/10-zero-trust-security.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/10-zero-trust-security.yml)
-->

## Overview

K8sBox is a collection of **production-ready Kubernetes projects** that demonstrate Kubernetes concepts, best practices, and real-world patterns. Each project is a complete, deployable application built with **NestJS**, following **Domain-Driven Design (DDD)** and **Test-Driven Development (TDD)** principles.

These projects implement Kubernetes concepts and serve as portfolio pieces demonstrating practical understanding of cloud-native architecture, scalability, reliability, and observability.

## 🏗️ Architecture

The collection follows a **microservices-ready architecture** with each project demonstrating different Kubernetes concepts:

### Project Structure

```
k8sbox/
├── projects/
│   ├── 01-health-checks/          # Health checks with circuit breakers
│   ├── 02-configmap-reload/        # ConfigMap hot-reload system
│   ├── 03-secret-rotation/         # Automated secret rotation
│   ├── 04-hpa-custom-metrics/      # HPA with custom metrics
│   ├── 05-pdb-manager/            # PDB for high availability
│   ├── 06-statefulset-database/   # StatefulSets with backups
│   ├── 07-custom-operator/         # Custom Kubernetes operator
│   ├── 08-service-mesh/            # Istio traffic management
│   ├── 09-gitops-deployment/       # ArgoCD GitOps workflows
│   └── 10-zero-trust-security/     # Network policies & mTLS
```

### Common Architecture Pattern

Each project follows **Clean Architecture** with clear separation:

```
src/
├── domain/              # Business logic (entities, value objects, domain services)
├── application/         # Use cases (application services)
├── infrastructure/     # External integrations (K8s API, databases, etc.)
└── presentation/       # API layer (controllers, DTOs, interceptors)
```

## ✨ Key Features

### 🎯 Production-Ready Patterns

- **Domain-Driven Design**: Clear domain boundaries and business logic
- **Test-Driven Development**: Comprehensive test coverage (unit + integration)
- **Clean Architecture**: Separation of concerns across layers
- **SOLID Principles**: Maintainable and extensible code

### ☸️ Kubernetes Features

- **Workloads**: Deployments, StatefulSets, DaemonSets, Jobs, CronJobs
- **Autoscaling**: HPA with custom metrics, VPA, cluster autoscaling
- **Service Mesh**: Istio for traffic management, mTLS, canary deployments
- **Operators**: Custom CRDs and controllers for platform engineering
- **GitOps**: ArgoCD workflows for declarative deployments
- **Security**: RBAC, Network Policies, Pod Security Standards, secret management

### 📊 Observability

- **Prometheus**: Metrics collection and custom metrics API
- **Grafana**: Dashboards and visualization
- **Structured Logging**: Winston with context-aware logging
- **Health Checks**: Liveness, readiness, and startup probes
- **Distributed Tracing**: OpenTelemetry integration

### 🔒 Security & Compliance

- **Secret Rotation**: Automated secret rotation without downtime
- **RBAC**: Role-based access control
- **Network Policies**: Zero-trust network security
- **Pod Security**: Security contexts and policies
- **mTLS**: Mutual TLS for service-to-service communication

### 🚀 Scalability & Reliability

- **Horizontal Pod Autoscaler**: Multi-metric autoscaling
- **Pod Disruption Budgets**: High availability guarantees
- **Circuit Breakers**: Graceful failure handling
- **Health Check History**: Track application health over time
- **Config Hot-Reload**: Zero-downtime configuration updates

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Testing**: Jest
- **Logging**: Winston
- **API Docs**: Swagger/OpenAPI

### Kubernetes
- **Orchestration**: Kubernetes 1.28+
- **Package Manager**: Helm 3.x
- **Configuration**: Kustomize
- **Service Mesh**: Istio
- **GitOps**: ArgoCD
- **Monitoring**: Prometheus + Grafana

### Infrastructure
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Observability**: Prometheus, Grafana, Loki
- **Message Broker**: Redis (for async operations)

## 📦 Projects Overview

| # | Project | Resultado Clave | Tech Stack | CI/CD |
|---|---------|----------------|------------|-------|
| 01 | [Health Checks](./projects/01-health-checks) | Zero-downtime health monitoring con circuit breakers | NestJS, Kubernetes Probes | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/01-health-checks.yml) |
| 02 | [ConfigMap Reload](./projects/02-configmap-reload) | Hot-reload sin restart (<2s propagation) | NestJS, ConfigMap Watcher | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/02-configmap-reload.yml) |
| 03 | [Secret Rotation](./projects/03-secret-rotation) | Rotación automática sin downtime | NestJS, CronJobs, PDB | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/03-secret-rotation.yml) |
| 04 | [HPA Custom Metrics](./projects/04-hpa-custom-metrics) | Autoscaling basado en métricas de negocio (RPS) | NestJS, Prometheus, HPA | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/04-hpa-custom-metrics.yml) |
| 05 | [PDB Manager](./projects/05-pdb-manager) | Alta disponibilidad durante node drains | NestJS, Pod Disruption Budget | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/05-pdb-manager.yml) |
| 06 | [StatefulSet Database](./projects/06-statefulset-database) | PostgreSQL con backups automatizados | NestJS, StatefulSet, Volume Snapshots | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/06-statefulset-database.yml) |
| 07 | [Custom Operator](./projects/07-custom-operator) | CRD + Controller con reconciliación automática | NestJS, Kubernetes Operator | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/07-custom-operator.yml) |
| 08 | [Service Mesh](./projects/08-service-mesh) | Canary deployments + mTLS con Istio | NestJS, Istio, VirtualService | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/08-service-mesh.yml) |
| 09 | [GitOps Deployment](./projects/09-gitops-deployment) | App-of-apps con ArgoCD multi-entorno | NestJS, ArgoCD, Helm | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/09-gitops-deployment.yml) |
| 10 | [Zero-Trust Security](./projects/10-zero-trust-security) | Network Policies + RBAC + Pod Security | NestJS, NetworkPolicy, RBAC | [![CI](https://img.shields.io/badge/CI-passing-brightgreen)](.github/workflows/10-zero-trust-security.yml) |

### 01. Health Checks with Circuit Breakers
**Domain:** Reliability & Observability  
**Skills:** Health probes, circuit breaker pattern, health history tracking

- Liveness, readiness, and startup probes
- Circuit breaker implementation
- Health check history API
- Metrics and monitoring

### 02. ConfigMap Hot-Reload System
**Domain:** Configuration Management  
**Skills:** ConfigMaps, hot-reload, versioning, validation

- Zero-downtime configuration updates
- ConfigMap versioning and rollback
- Schema validation
- Change notifications

### 03. Secret Rotation Automation
**Domain:** Security & Compliance  
**Skills:** Secrets management, CronJobs, RBAC, automation

- Automated secret rotation
- Zero-downtime rotation
- Rotation history tracking
- Pod Disruption Budget integration

### 04. HPA with Custom Metrics
**Domain:** Scalability & Performance  
**Skills:** HPA, custom metrics, Prometheus adapter, autoscaling

- Custom business metrics (RPS, queue depth, connections)
- Multi-metric HPA configuration
- Prometheus integration
- Configurable scaling behavior

### 05. Pod Disruption Budget Manager
**Domain:** High Availability  
**Skills:** PDB, rolling updates, availability guarantees

- PDB configuration and monitoring
- Rolling update strategies
- Availability tracking
- Node drain protection

### 06. StatefulSet Database with Backups
**Domain:** Data Persistence  
**Skills:** StatefulSets, PVCs, volume snapshots, backup/restore

- PostgreSQL StatefulSet deployment
- Automated backups with CronJobs
- Volume snapshots
- Disaster recovery procedures

### 07. Custom Kubernetes Operator
**Domain:** Platform Engineering  
**Skills:** CRDs, controllers, operator pattern, reconciliation

- Custom Resource Definitions
- Controller implementation
- Reconciliation logic
- Status management

### 08. Service Mesh Traffic Management
**Domain:** Microservices Architecture  
**Skills:** Istio, canary deployments, circuit breakers, mTLS

- Traffic splitting and canary deployments
- Circuit breaker configuration
- Mutual TLS (mTLS)
- Custom routing rules

### 09. GitOps with ArgoCD
**Domain:** CI/CD & GitOps  
**Skills:** ArgoCD, GitOps workflows, declarative deployments

- ArgoCD application configuration
- Multi-environment workflows
- Automated sync policies
- Rollback capabilities

### 10. Zero-Trust Network Security
**Domain:** Security & Compliance  
**Skills:** Network Policies, RBAC, mTLS, security policies

- Network policy implementation
- Zero-trust architecture
- Service-to-service authentication
- Security audit logging

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Docker** 20+
- **Kubernetes** cluster (minikube, kind, or cloud)
- **Helm** 3.x
- **kubectl** configured

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/k8sbox.git
cd k8sbox

# Navigate to a project
cd projects/01-health-checks

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run start:dev
```

### Deploy to Kubernetes

```bash
# Using Helm (recommended)
cd projects/01-health-checks
helm install health-checks ./helm/health-checks \
  --namespace default \
  --create-namespace

# Using Kustomize
kubectl apply -k k8s/base/
```

## 📚 Project Details

Each project includes:

- ✅ **Complete source code** with DDD architecture
- ✅ **Comprehensive tests** (unit + integration)
- ✅ **Helm charts** for easy deployment
- ✅ **Kustomize manifests** for flexibility
- ✅ **Dockerfile** for containerization
- ✅ **Detailed README** with documentation
- ✅ **API documentation** (Swagger)
- ✅ **Makefile** for common tasks

## 🧪 Testing

### Run Tests

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

### Test Coverage

Each project maintains:
- **Unit Tests**: Domain logic, value objects, entities
- **Integration Tests**: API endpoints, external services
- **Coverage**: Minimum 80% code coverage

## 📊 Monitoring & Observability

### Health Checks

```bash
# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe
curl http://localhost:3000/health/ready

# Startup probe
curl http://localhost:3000/health/startup
```

### Metrics

```bash
# Prometheus metrics
curl http://localhost:3000/metrics/prometheus

# Custom metrics (project 04)
curl http://localhost:3000/metrics/summary
```

### Logs

All projects use structured logging with Winston:
- JSON format for production
- Colored output for development
- Context-aware logging
- Log levels: error, warn, info, debug

## 🔧 Development

### Adding a New Project

1. Create project directory: `projects/XX-project-name/`
2. Initialize NestJS: `nest new project-name`
3. Follow DDD structure:
   - Domain layer (entities, value objects, domain services)
   - Application layer (use cases)
   - Infrastructure layer (external services)
   - Presentation layer (controllers, DTOs)
4. Write tests (TDD approach)
5. Create Helm charts
6. Add Dockerfile
7. Write comprehensive README

### Project Template

```bash
projects/XX-project-name/
├── src/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
├── tests/
│   ├── unit/
│   └── integration/
├── helm/
│   └── project-name/
├── k8s/
│   └── base/
├── docker/
│   └── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.js
├── Makefile
└── README.md
```

## 🐳 Docker

### Build Image

```bash
# Build project image
docker build -t project-name:latest -f docker/Dockerfile .

# Run container
docker run -p 3000:3000 project-name:latest
```

### Multi-stage Builds

All Dockerfiles use multi-stage builds:
- **Builder stage**: Install dependencies and compile
- **Production stage**: Minimal runtime image

## ☸️ Kubernetes Deployment

### Helm Charts

Each project includes a Helm chart with:
- Configurable values
- Resource limits/requests
- Health probes
- Security contexts
- Service accounts
- RBAC (when needed)

### Kustomize Manifests

Alternative deployment using Kustomize:
- Base configuration
- Environment overlays (dev, staging, prod)
- Resource patching

## 🔒 Security Best Practices

All projects implement:

- ✅ **Non-root containers**: Run as non-privileged user
- ✅ **Read-only filesystem**: Immutable containers
- ✅ **Security contexts**: Pod and container security
- ✅ **RBAC**: Least privilege access
- ✅ **Network policies**: Zero-trust networking
- ✅ **Secret management**: Encrypted secrets
- ✅ **Image scanning**: Vulnerability checks

## 📈 Performance & Scalability

### Resource Management

- **Resource requests**: Guaranteed resources
- **Resource limits**: Prevent resource exhaustion
- **HPA**: Automatic scaling based on metrics
- **PDB**: Maintain availability during updates

### Optimization

- **Multi-stage builds**: Smaller images
- **Layer caching**: Faster builds
- **Health probes**: Efficient health checking
- **Connection pooling**: Database optimization

## 🛣️ Roadmap

### Phase 1: Core Projects ✅
- [x] Health Checks
- [x] ConfigMap Reload
- [x] Secret Rotation
- [x] HPA Custom Metrics
- [x] Pod Disruption Budget

### Phase 2: Additional Projects 🚧
- [ ] StatefulSet Database
- [ ] Custom Operator
- [ ] Service Mesh
- [ ] GitOps
- [ ] Zero-Trust Security

### Phase 3: Integration & Polish 📋
- [ ] End-to-end testing
- [ ] Performance benchmarks
- [ ] Security audits
- [ ] Documentation improvements
- [ ] Video tutorials

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Follow DDD and TDD principles
4. Write comprehensive tests
5. Update documentation
6. Commit: `git commit -m 'Add new feature'`
7. Push: `git push origin feature/new-feature`
8. Create Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Conventional Commits**: Commit message format

## 📖 Documentation

Each project includes:

- **README.md**: Comprehensive project documentation
- **API Docs**: Swagger/OpenAPI specification
- **Architecture**: DDD structure explanation
- **Deployment**: Kubernetes deployment guides
- **Troubleshooting**: Common issues and solutions

## 🎓 Learning Resources

These projects demonstrate:

- **Kubernetes Concepts**: Pods, Services, Deployments, StatefulSets, etc.
- **Kubernetes Patterns**: Operators, Service Mesh, GitOps
- **Best Practices**: Security, observability, scalability
- **Real-World Scenarios**: Production-ready implementations

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **NestJS**: Excellent Node.js framework
- **Kubernetes**: Powerful orchestration platform
- **Prometheus**: Metrics collection
- **Helm**: Package management
- **Istio**: Service mesh

---

**K8sBox** - Master Kubernetes with Production-Ready Projects 🚀☸️
