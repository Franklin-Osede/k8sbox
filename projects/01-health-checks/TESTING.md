# 🧪 Testing Guide - Project 01: Health Checks

## ✅ Project Status

**The project is READY to test!** All code follows DDD and TDD principles.

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd projects/01-health-checks
npm install
```

### Step 2: Run Tests (TDD Verification)

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:cov
```

### Step 3: Start Development Server

```bash
npm run start:dev
```

The application will start on `http://localhost:3000`

### Step 4: Test Endpoints

Open a new terminal and test the endpoints:

```bash
# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe
curl http://localhost:3000/health/ready

# Startup probe
curl http://localhost:3000/health/startup
```

Or visit in browser:
- http://localhost:3000/health/live
- http://localhost:3000/health/ready
- http://localhost:3000/health/startup
- http://localhost:3000/api (Swagger documentation)

---

## 📋 Detailed Testing Steps

### 1. Verify Project Structure

```bash
# Check DDD structure exists
ls -la src/domain/
ls -la src/application/
ls -la src/infrastructure/
ls -la src/presentation/

# Check TDD tests exist
ls -la tests/unit/
ls -la tests/integration/
```

### 2. Run Tests First (TDD Approach)

```bash
# This should pass - tests are already written
npm test
```

Expected output:
```
PASS  tests/unit/health-check-result.vo.spec.ts
PASS  tests/unit/health-status.entity.spec.ts
PASS  tests/unit/health-check.service.spec.ts
PASS  tests/integration/health.controller.spec.ts

Test Suites: 4 passed, 4 total
Tests:       X passed, X total
```

### 3. Check Test Coverage

```bash
npm run test:cov
```

Open `coverage/index.html` in browser to see detailed coverage report.

### 4. Build the Application

```bash
npm run build
```

This creates the `dist/` folder with compiled JavaScript.

### 5. Run Production Build

```bash
npm run start:prod
```

### 6. Test API Endpoints

#### Using curl:

```bash
# Liveness
curl -X GET http://localhost:3000/health/live

# Expected response:
# {
#   "status": "healthy",
#   "message": "Application is alive",
#   "timestamp": "2024-..."
# }

# Readiness
curl -X GET http://localhost:3000/health/ready

# Startup
curl -X GET http://localhost:3000/health/startup
```

#### Using Swagger UI:

1. Start the application: `npm run start:dev`
2. Visit: http://localhost:3000/api
3. Try the endpoints interactively

---

## 🐳 Docker Testing

### Build Docker Image

```bash
docker build -t health-checks:latest -f docker/Dockerfile .
```

### Run Docker Container

```bash
docker run -p 3000:3000 health-checks:latest
```

### Test Docker Container

```bash
curl http://localhost:3000/health/live
```

---

## ☸️ Kubernetes Testing

### Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- `kubectl` configured
- `helm` 3.x installed

### Deploy with Helm

```bash
# Build and push image first (or use local image)
docker build -t health-checks:latest -f docker/Dockerfile .

# If using minikube, load image:
minikube image load health-checks:latest

# Deploy with Helm
make deploy

# Or manually:
helm install health-checks ./helm/01-health-checks
```

### Verify Deployment

```bash
# Check pods
kubectl get pods -l app.kubernetes.io/name=health-checks

# Check service
kubectl get svc health-checks

# Port forward to test
kubectl port-forward svc/health-checks 3000:80

# Test endpoints
curl http://localhost:3000/health/live
```

### Check Logs

```bash
kubectl logs -l app.kubernetes.io/name=health-checks -f
```

### Verify Probes

```bash
# Describe pod to see probe configuration
kubectl describe pod -l app.kubernetes.io/name=health-checks
```

You should see:
- `Liveness: http-get http://:http/health/live delay=30s timeout=5s period=10s`
- `Readiness: http-get http://:http/health/ready delay=5s timeout=3s period=5s`
- `Startup: http-get http://:http/health/startup delay=0s timeout=3s period=10s`

---

## ✅ Expected Test Results

### Unit Tests

All unit tests should pass:
- ✅ `HealthCheckResult` value object tests
- ✅ `HealthStatusEntity` entity tests
- ✅ `HealthCheckDomainService` domain service tests

### Integration Tests

Integration tests should pass:
- ✅ `HealthController` endpoint tests
- ✅ All three endpoints return correct status codes
- ✅ Response format matches DTOs

---

## 🔧 Troubleshooting

### Issue: Tests fail with module not found

**Solution:**
```bash
# Make sure you're in the project directory
cd projects/01-health-checks

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Application won't start

**Solution:**
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Or change port in src/main.ts
```

### Issue: Docker build fails

**Solution:**
```bash
# Make sure you're building from project root
cd projects/01-health-checks
docker build -t health-checks:latest -f docker/Dockerfile .
```

### Issue: Helm deployment fails

**Solution:**
```bash
# Check Helm chart syntax
helm lint ./helm/01-health-checks

# Dry-run first
helm install health-checks ./helm/01-health-checks --dry-run --debug
```

---

## 📊 Success Criteria

The project is working correctly if:

- ✅ All tests pass (`npm test`)
- ✅ Application starts without errors (`npm run start:dev`)
- ✅ All three health endpoints return 200 OK
- ✅ Swagger documentation is accessible at `/api`
- ✅ Docker image builds successfully
- ✅ Helm chart deploys to Kubernetes
- ✅ Kubernetes probes are configured correctly

---

## 🎯 Next Steps After Testing

Once you've verified everything works:

1. **Add more tests** - Increase coverage
2. **Implement real dependency checks** - Replace mocks in `checkDependencies()`
3. **Add Prometheus metrics** - Implement `/metrics` endpoint
4. **Add database checks** - Real readiness checks
5. **Move to Project 02** - ConfigMap Hot-Reload

---

**Ready to test! Start with `npm install` and `npm test` 🚀**

