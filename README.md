# 🚀 k8sbox - Advanced Kubernetes Projects

**Production-ready Kubernetes projects demonstrating senior-level skills for technical interviews.**

[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28+-326CE5?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-3.x-0F1689?style=flat&logo=helm&logoColor=white)](https://helm.sh/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 Overview

This repository contains **10 advanced Kubernetes projects** designed to demonstrate production-level skills. Each project follows:

- ✅ **Domain-Driven Design (DDD)** principles
- ✅ **Test-Driven Development (TDD)** methodology
- ✅ **Best practices** and design patterns
- ✅ **Helm charts** for deployment
- ✅ **Production-ready** configurations

---

## 📋 Projects

### 🔥 Core Infrastructure Projects

#### 01. **Multi-Stage Health Check System**
**Domain:** Observability & Reliability  
**Skills:** Liveness/Readiness/Startup Probes, Health Endpoints, Monitoring  
**Tech:** NestJS, Kubernetes Probes, Prometheus Metrics  
**Time:** 6-8 hours

#### 02. **ConfigMap Hot-Reload Service**
**Domain:** Configuration Management  
**Skills:** Zero-downtime Config Updates, File Watching, Volume Mounts  
**Tech:** NestJS, ConfigMap Volumes, File Watchers  
**Time:** 8-10 hours

#### 03. **Secret Rotation Automation**
**Domain:** Security & Compliance  
**Skills:** Secret Management, Pod Disruption Budgets, Automation  
**Tech:** External Secrets Operator, CronJobs, RBAC  
**Time:** 10-12 hours

#### 04. **Horizontal Pod Autoscaler with Custom Metrics**
**Domain:** Scalability & Performance  
**Skills:** HPA, Prometheus Adapter, Custom Metrics, Cost Optimization  
**Tech:** Prometheus, Custom Metrics API, HPA v2  
**Time:** 12-14 hours

#### 05. **Pod Disruption Budget Manager**
**Domain:** High Availability  
**Skills:** PDB, Rolling Updates, SLA Guarantees  
**Tech:** Kubernetes PDB, Deployment Strategies  
**Time:** 6-8 hours

---

### 🏗️ Advanced Architecture Projects

#### 06. **StatefulSet Database with Automated Backups**
**Domain:** Data Persistence  
**Skills:** StatefulSets, Volume Snapshots, Backup/Restore  
**Tech:** PostgreSQL, Volume Snapshots, CronJobs  
**Time:** 14-16 hours

#### 07. **Custom Kubernetes Operator (CRD + Controller)**
**Domain:** Platform Engineering  
**Skills:** CRDs, Controllers, Operator Pattern, Kubernetes API  
**Tech:** Kubebuilder/Operator SDK, Go, Custom Resources  
**Time:** 16-20 hours

#### 08. **Service Mesh Traffic Management**
**Domain:** Microservices Architecture  
**Skills:** Istio/Linkerd, Canary Deployments, Circuit Breakers, mTLS  
**Tech:** Istio, VirtualServices, DestinationRules  
**Time:** 14-16 hours

#### 09. **GitOps Deployment Pipeline**
**Domain:** CI/CD & DevOps  
**Skills:** ArgoCD/Flux, Declarative Deployments, Multi-Environment  
**Tech:** ArgoCD, GitOps, Helm Charts  
**Time:** 12-14 hours

#### 10. **Zero-Trust Network Security**
**Domain:** Security & Compliance  
**Skills:** Network Policies, RBAC, Pod Security Standards  
**Tech:** NetworkPolicy, RBAC, PSS, Admission Controllers  
**Time:** 10-12 hours

---

## 🏗️ Project Structure

Each project follows this structure:

```
project-XX-name/
├── src/                    # Application source code (DDD structure)
│   ├── domain/            # Domain entities, value objects
│   ├── application/       # Use cases, services
│   ├── infrastructure/    # Repositories, external services
│   └── presentation/      # Controllers, DTOs
├── tests/                 # TDD tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── k8s/                   # Kubernetes manifests
│   ├── base/              # Kustomize base
│   └── overlays/          # Environment overlays
├── helm/                  # Helm charts
│   └── chart-name/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docs/                  # Documentation
│   ├── architecture.md
│   ├── deployment.md
│   └── api.md
├── docker/                # Dockerfiles
│   └── Dockerfile
├── .github/               # CI/CD workflows
│   └── workflows/
├── README.md              # Project-specific README
└── Makefile              # Common tasks

```

---

## 🎯 Design Principles

### Domain-Driven Design (DDD)
- **Domain Layer:** Core business logic, entities, value objects
- **Application Layer:** Use cases, application services
- **Infrastructure Layer:** External integrations, repositories
- **Presentation Layer:** Controllers, DTOs, API definitions

### Test-Driven Development (TDD)
- Write tests first (Red)
- Implement minimal code (Green)
- Refactor (Refactor)
- Unit tests for domain logic
- Integration tests for services
- E2E tests for complete flows

### Best Practices
- **Clean Architecture:** Separation of concerns
- **SOLID Principles:** Maintainable, extensible code
- **12-Factor App:** Cloud-native principles
- **Kubernetes Best Practices:** Resource limits, probes, security contexts
- **Helm Best Practices:** Reusable charts, values management

---

## 🚀 Getting Started

### Prerequisites
- Kubernetes cluster (minikube, kind, or managed)
- `kubectl` configured
- `helm` 3.x installed
- Docker installed
- Node.js 20+ (for NestJS projects)
- Go 1.21+ (for operator projects)

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/k8sbox.git
cd k8sbox

# Navigate to a project
cd projects/01-health-checks

# Install dependencies
npm install

# Run tests (TDD)
npm test

# Build Docker image
docker build -t health-checks:latest -f docker/Dockerfile .

# Deploy with Helm
helm install health-checks ./helm/health-checks

# Verify deployment
kubectl get pods,svc
```

---

## 📚 Learning Path

### Start Here (First 5 Projects)
1. **Health Checks** - Foundation of observability
2. **ConfigMap Reload** - Configuration management
3. **HPA** - Scalability fundamentals
4. **PDB** - High availability
5. **StatefulSet** - Data persistence

### Advanced Projects (Next 5)
6. **Custom Operator** - Platform engineering
7. **Service Mesh** - Microservices architecture
8. **GitOps** - Modern DevOps
9. **Network Security** - Security hardening
10. **Secret Rotation** - Security automation

---

## 🎯 Skills Demonstrated

### Technical Skills
- ✅ Kubernetes advanced concepts (HPA, StatefulSets, Operators)
- ✅ Helm chart development
- ✅ Domain-Driven Design
- ✅ Test-Driven Development
- ✅ Microservices architecture
- ✅ Service mesh (Istio)
- ✅ GitOps (ArgoCD)
- ✅ Security (RBAC, Network Policies, Secrets)

### DevOps Skills
- ✅ CI/CD pipelines
- ✅ Infrastructure as Code
- ✅ Observability (metrics, logs, traces)
- ✅ Disaster recovery
- ✅ Multi-environment deployments

---

## 📖 Documentation

Each project includes:
- **Architecture documentation** (DDD structure)
- **API documentation** (Swagger/OpenAPI)
- **Deployment guide** (Helm values, K8s manifests)
- **Testing guide** (TDD approach)
- **Troubleshooting guide**

---

## 🤝 Contributing

This is a personal learning repository, but suggestions and improvements are welcome!

---

## 📄 License

MIT License - Feel free to use these projects for learning and interviews.

---

## 🎓 How to Use in Interviews

### Example Response:

> "I've built several production-ready Kubernetes projects following DDD and TDD principles. For example, I implemented a custom Kubernetes operator that manages database resources, with full Helm charts for deployment. The project includes comprehensive tests, follows clean architecture principles, and demonstrates advanced K8s concepts like CRDs and controllers."

---

**Built with ❤️ to demonstrate advanced Kubernetes skills**

