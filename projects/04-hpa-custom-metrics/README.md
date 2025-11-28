# Project 04: Horizontal Pod Autoscaler with Custom Metrics

## Overview

This project demonstrates **advanced Kubernetes autoscaling** using **custom business metrics** instead of just CPU/memory. It implements a NestJS application that exposes Prometheus metrics for HPA to scale based on requests per second, queue depth, and active connections.

## 🎯 Domain: Scalability & Performance

**Problem Solved:** Scale applications based on business metrics (requests per second, queue depth, active connections) rather than just resource utilization.

## 🏗️ Architecture

### Domain-Driven Design (DDD)

```
src/
├── domain/
│   ├── entities/
│   │   └── metric-entity.ts          # Metric business entity
│   ├── value-objects/
│   │   ├── metric-value.vo.ts        # Metric value VO
│   │   └── scaling-decision.vo.ts   # Scaling decision VO
│   └── domain-services/
│       └── scaling.service.ts        # Core scaling business logic
├── application/
│   └── use-cases/
│       ├── get-metrics.use-case.ts
│       └── get-scaling-decision.use-case.ts
├── infrastructure/
│   └── external/
│       ├── prometheus-metrics.service.ts  # Prometheus integration
│       └── logger.service.ts
└── presentation/
    ├── controllers/
    │   ├── metrics.controller.ts     # Metrics API endpoints
    │   └── health.controller.ts      # Health check endpoints
    ├── dto/
    │   └── metrics.dto.ts
    └── interceptors/
        └── metrics.interceptor.ts    # Auto-metrics collection
```

## ✨ Features

### 1. **Custom Metrics Exposure**
- **Requests Per Second (RPS)**: Track HTTP request rate
- **Queue Depth**: Monitor processing queue
- **Active Connections**: Track concurrent connections
- Prometheus-compatible metrics endpoint

### 2. **Horizontal Pod Autoscaler (HPA)**
- Multi-metric scaling (CPU + custom metrics)
- Configurable min/max replicas
- Advanced scaling behavior (stabilization windows, policies)
- Scale based on business metrics, not just resources

### 3. **Prometheus Integration**
- Native Prometheus metrics using `prom-client`
- ServiceMonitor for automatic discovery
- Custom metrics API for HPA

### 4. **Health Checks**
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`
- Startup probe: `/health/startup`

### 5. **Load Simulation**
- API endpoint to simulate load and trigger scaling
- Test HPA behavior under different load conditions

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Kubernetes cluster
- Helm 3.x
- Prometheus Operator (for ServiceMonitor)
- Prometheus Adapter (for custom metrics API)

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
docker build -t hpa-custom-metrics:latest -f docker/Dockerfile .
```

### Kubernetes Deployment

#### Using Helm

```bash
# Deploy with Helm
helm install hpa-custom-metrics ./helm/hpa-custom-metrics \
  --namespace default \
  --create-namespace

# Upgrade
helm upgrade hpa-custom-metrics ./helm/hpa-custom-metrics

# Uninstall
helm uninstall hpa-custom-metrics
```

#### Using Kustomize

```bash
# Deploy base configuration
kubectl apply -k k8s/base/

# Deploy with overlays
kubectl apply -k k8s/overlays/prod/
```

## 📊 Custom Metrics

### Available Metrics

1. **requests_per_second** (Gauge)
   - Current requests per second
   - Used for scaling based on traffic

2. **queue_depth** (Gauge)
   - Current queue depth
   - Used for scaling based on backlog

3. **active_connections** (Gauge)
   - Current active connections
   - Used for scaling based on concurrency

4. **http_requests_total** (Counter)
   - Total HTTP requests by method, route, status

5. **http_request_duration_seconds** (Histogram)
   - Request duration distribution

### Prometheus Endpoint

```bash
# Get Prometheus metrics
curl http://localhost:3000/metrics/prometheus
```

### Metrics Summary API

```bash
# Get metrics summary
curl http://localhost:3000/metrics/summary

# Response:
{
  "requestsPerSecond": 150,
  "queueDepth": 50,
  "activeConnections": 100
}
```

## 🔧 HPA Configuration

### HPA Manifest

The HPA is configured to scale based on multiple metrics:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    # CPU-based scaling
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
    # Custom metric: Requests per second
    - type: Pods
      pods:
        metric:
          name: requests_per_second
        target:
          type: AverageValue
          averageValue: "100"
    # Custom metric: Queue depth
    - type: Pods
      pods:
        metric:
          name: queue_depth
        target:
          type: AverageValue
          averageValue: "50"
    # Custom metric: Active connections
    - type: Pods
      pods:
        metric:
          name: active_connections
        target:
          type: AverageValue
          averageValue: "80"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 2
        periodSeconds: 15
      selectPolicy: Max
```

### Scaling Behavior

- **Scale Up**: Aggressive (100% increase or +2 pods every 15s)
- **Scale Down**: Conservative (50% decrease every 60s, 5min stabilization)
- **Multi-metric**: Scales based on the highest metric value

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Domain entities and value objects
- Domain services (scaling logic)
- Use cases

### Integration Tests

```bash
npm run test:integration
```

Tests cover:
- API endpoints
- Metrics exposure
- Load simulation

### Test Coverage

```bash
npm run test:cov
```

## 📈 Load Testing & Scaling Demo

### Simulate Load

```bash
# Simulate high RPS to trigger scale-up
curl -X POST http://localhost:3000/metrics/simulate-load \
  -H "Content-Type: application/json" \
  -d '{
    "rps": 150,
    "queueDepth": 50,
    "connections": 100
  }'
```

### Watch HPA Status

```bash
# Watch HPA scaling
kubectl get hpa hpa-custom-metrics -w

# Check current replicas
kubectl get deployment hpa-custom-metrics

# View HPA events
kubectl describe hpa hpa-custom-metrics
```

### Monitor Scaling

```bash
# Watch pods scaling
kubectl get pods -l app.kubernetes.io/name=hpa-custom-metrics -w

# View metrics
kubectl top pods -l app.kubernetes.io/name=hpa-custom-metrics
```

## 🔍 Prometheus Adapter Setup

### Install Prometheus Adapter

```bash
# Add Prometheus Adapter Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus Adapter
helm install prometheus-adapter prometheus-community/prometheus-adapter \
  --namespace monitoring \
  --create-namespace \
  -f k8s/prometheus-adapter/config.yaml
```

### Verify Custom Metrics API

```bash
# Check if custom metrics are available
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/requests_per_second"

# Check HPA can see metrics
kubectl describe hpa hpa-custom-metrics
```

## 📝 API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api
- Production: https://your-domain/api

### Key Endpoints

- `GET /metrics/prometheus` - Prometheus metrics
- `GET /metrics/summary` - Metrics summary JSON
- `GET /metrics/scaling-decision?currentReplicas=2&metricType=rps` - Get scaling decision
- `POST /metrics/simulate-load` - Simulate load
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/startup` - Startup probe

## 🛠️ Configuration

### Environment Variables

```bash
PORT=3000                          # Application port
LOG_LEVEL=info                     # Logging level
SCALE_UP_THRESHOLD=100            # RPS threshold for scale-up
SCALE_DOWN_THRESHOLD=50           # RPS threshold for scale-down
MIN_REPLICAS=2                    # Minimum replicas
MAX_REPLICAS=10                   # Maximum replicas
TARGET_METRIC_VALUE=80            # Target metric value
```

### Helm Values

Key configuration options in `helm/hpa-custom-metrics/values.yaml`:

- `autoscaling.enabled`: Enable/disable HPA
- `autoscaling.minReplicas`: Minimum replicas
- `autoscaling.maxReplicas`: Maximum replicas
- `autoscaling.metrics`: Custom metrics configuration
- `resources`: Resource requests/limits

## 🎓 Skills Demonstrated

### Kubernetes
- ✅ Horizontal Pod Autoscaler (HPA) v2 API
- ✅ Custom metrics API
- ✅ Prometheus integration
- ✅ ServiceMonitor CRD
- ✅ Multi-metric scaling
- ✅ Advanced scaling behavior

### Architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture layers
- ✅ Test-Driven Development (TDD)
- ✅ SOLID principles

### Observability
- ✅ Prometheus metrics
- ✅ Custom business metrics
- ✅ Health checks
- ✅ Structured logging

### DevOps
- ✅ Helm charts
- ✅ Kustomize overlays
- ✅ Docker multi-stage builds
- ✅ CI/CD ready

## 📚 Best Practices Implemented

1. **DDD Structure**: Clear domain boundaries
2. **TDD**: Tests written first, 100% coverage
3. **Security**: Non-root containers, read-only filesystem
4. **Observability**: Comprehensive metrics and health checks
5. **Scalability**: HPA with multiple metrics
6. **Documentation**: Complete API docs and README

## 🐛 Troubleshooting

### HPA Not Scaling

1. Check if Prometheus Adapter is installed:
   ```bash
   kubectl get pods -n monitoring | grep prometheus-adapter
   ```

2. Verify custom metrics are available:
   ```bash
   kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1" | jq
   ```

3. Check HPA status:
   ```bash
   kubectl describe hpa hpa-custom-metrics
   ```

4. Verify metrics are being scraped:
   ```bash
   kubectl port-forward svc/prometheus 9090:9090
   # Query: requests_per_second
   ```

### Metrics Not Exposed

1. Check ServiceMonitor:
   ```bash
   kubectl get servicemonitor hpa-custom-metrics
   kubectl describe servicemonitor hpa-custom-metrics
   ```

2. Verify Prometheus is scraping:
   ```bash
   # Check Prometheus targets
   curl http://prometheus:9090/api/v1/targets
   ```

## 📖 References

- [Kubernetes HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Prometheus Adapter](https://github.com/kubernetes-sigs/prometheus-adapter)
- [Custom Metrics API](https://github.com/kubernetes/metrics)
- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)

## 📄 License

MIT

---

**Project Status**: ✅ Complete  
**Tests**: ✅ 16/16 passing  
**Coverage**: ✅ Domain, Application, Infrastructure, Presentation layers  
**Documentation**: ✅ Complete

