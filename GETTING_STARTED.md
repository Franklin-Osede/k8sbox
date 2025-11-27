# 🚀 Getting Started Guide

## Quick Start - First 5 Projects

Start with these 5 projects in order. They build foundational skills:

1. **Health Checks** - Observability foundation
2. **ConfigMap Reload** - Configuration management  
3. **HPA** - Scalability
4. **PDB** - High availability
5. **StatefulSet** - Data persistence

---

## Step-by-Step: Creating Your First Project

### 1. Create Project Structure

```bash
cd projects
mkdir -p 01-health-checks/{src/{domain,application,infrastructure,presentation},tests/{unit,integration,e2e},k8s/{base,overlays},helm/health-checks/{templates},docs,docker,.github/workflows}
```

### 2. Initialize NestJS Project

```bash
cd 01-health-checks
npm i -g @nestjs/cli
nest new . --skip-git
```

### 3. Set Up DDD Structure

```bash
mkdir -p src/{domain/{entities,value-objects,domain-services},application/{use-cases,services},infrastructure/{repositories,external},presentation/{controllers,dto,filters}}
```

### 4. Copy Helm Template

```bash
cp -r ../templates/helm-chart-template/* helm/health-checks/
# Edit Chart.yaml and values.yaml to match your project
```

### 5. Write Tests First (TDD)

```bash
# Create test file first
touch tests/unit/health.service.spec.ts
# Write failing test
# Implement code
# Make test pass
# Refactor
```

### 6. Build and Deploy

```bash
# Build
npm run build

# Build Docker image
docker build -t health-checks:latest -f docker/Dockerfile .

# Deploy with Helm
helm install health-checks ./helm/health-checks
```

---

## Project Checklist

For each project, ensure you have:

- [ ] DDD structure (domain, application, infrastructure, presentation)
- [ ] TDD tests (>80% coverage)
- [ ] Helm chart with all necessary templates
- [ ] Kubernetes manifests (deployment, service, configmap, etc.)
- [ ] Documentation (README, architecture, API docs)
- [ ] Dockerfile (multi-stage)
- [ ] CI/CD workflow (.github/workflows)
- [ ] Makefile for common tasks

---

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run in watch mode
npm run start:dev

# Build
npm run build
```

### Docker
```bash
# Build image
docker build -t PROJECT_NAME:latest -f docker/Dockerfile .

# Run locally
docker run -p 3000:3000 PROJECT_NAME:latest
```

### Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Get resources
kubectl get all -l app=PROJECT_NAME

# View logs
kubectl logs -l app=PROJECT_NAME -f

# Port forward
kubectl port-forward svc/PROJECT_NAME 3000:80
```

### Helm
```bash
# Lint chart
helm lint ./helm/PROJECT_NAME

# Template (dry-run)
helm template PROJECT_NAME ./helm/PROJECT_NAME

# Install
helm install PROJECT_NAME ./helm/PROJECT_NAME

# Upgrade
helm upgrade PROJECT_NAME ./helm/PROJECT_NAME

# Uninstall
helm uninstall PROJECT_NAME
```

---

## Next Steps

1. Complete Project 01 (Health Checks)
2. Document what you learned
3. Move to Project 02 (ConfigMap Reload)
4. Continue through all 10 projects
5. Update your portfolio/LinkedIn as you complete each one

---

**Remember:** Quality over speed. Better to do 5 projects really well than 10 projects poorly.

