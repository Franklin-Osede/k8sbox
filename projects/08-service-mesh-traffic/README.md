# Project 08: Service Mesh Traffic Management

## Overview

This project demonstrates **Service Mesh Traffic Management** using **Istio** for advanced traffic routing, **canary deployments**, **circuit breakers**, and **mTLS**. It implements a NestJS application that manages Istio VirtualService and DestinationRule configurations.

## 🎯 Domain: Microservices Architecture

**Problem Solved:** Implement advanced traffic management (canary, circuit breakers, mTLS) for microservices using a service mesh.

## 🏗️ Architecture

### Domain-Driven Design (DDD)

```
src/
├── domain/
│   ├── entities/
│   │   └── traffic-routing-entity.ts      # Traffic routing business entity
│   ├── value-objects/
│   │   ├── traffic-split.vo.ts            # Traffic split VO
│   │   └── circuit-breaker-config.vo.ts  # Circuit breaker config VO
│   └── domain-services/
│       └── routing.service.ts             # Core routing logic
├── application/
│   └── use-cases/
│       ├── apply-routing.use-case.ts
│       └── update-traffic-split.use-case.ts
├── infrastructure/
│   └── external/
│       ├── istio-virtualservice.service.ts    # Istio VirtualService client
│       ├── istio-destinationrule.service.ts  # Istio DestinationRule client
│       └── logger.service.ts
└── presentation/
    ├── controllers/
    │   ├── traffic.controller.ts          # Traffic routing API endpoints
    │   └── health.controller.ts         # Health check endpoints
    └── dto/
        └── traffic.dto.ts
```

## ✨ Features

### 1. **Traffic Splitting**
- Canary deployments with configurable traffic percentages
- Gradual traffic migration from v1 to v2
- Support for 0-100% traffic distribution
- Real-time traffic split updates

### 2. **Circuit Breakers**
- Configurable consecutive error thresholds
- Automatic outlier detection
- Ejection time and percentage limits
- Health percentage monitoring

### 3. **mTLS (Mutual TLS)**
- Automatic mTLS between services
- STRICT mode for secure communication
- PeerAuthentication policies
- Certificate management via Istio

### 4. **Canary Deployment Strategy**
- Start with 0% traffic to v2
- Gradually increase v2 traffic (10%, 25%, 50%, 100%)
- Rollback capability by reducing v2 traffic
- Monitor metrics before full rollout

### 5. **Health Checks**
- Liveness probe: `/health/live`
- Readiness probe: `/health/ready`
- Startup probe: `/health/startup`

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Kubernetes cluster with Istio installed
- Helm 3.x
- kubectl configured

### Install Istio

```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*

# Install Istio
istioctl install --set profile=default -y

# Enable Istio injection in namespace
kubectl label namespace default istio-injection=enabled
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
docker build -t service-mesh-traffic:latest -f docker/Dockerfile .
```

### Kubernetes Deployment

#### Using Kustomize

```bash
# Deploy example services (v1 and v2)
kubectl apply -k k8s/base/

# Verify deployments
kubectl get deployments -l app=example-service
kubectl get pods -l app=example-service
```

## 📊 Traffic Management

### Canary Deployment Example

#### Step 1: Deploy v1 (100% traffic)

```bash
# Create routing with 100% v1 traffic
curl -X POST http://localhost:3000/traffic \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "example-service",
    "namespace": "default",
    "trafficSplit": {
      "v1Weight": 100,
      "v2Weight": 0
    },
    "mTLSEnabled": true
  }'
```

#### Step 2: Deploy v2 and start canary (10% traffic to v2)

```bash
# Update traffic split to 90% v1, 10% v2
curl -X PUT http://localhost:3000/traffic/example-service/traffic-split?namespace=default \
  -H "Content-Type: application/json" \
  -d '{
    "trafficSplit": {
      "v1Weight": 90,
      "v2Weight": 10
    }
  }'
```

#### Step 3: Gradually increase v2 traffic

```bash
# 25% v2
curl -X PUT http://localhost:3000/traffic/example-service/traffic-split \
  -H "Content-Type: application/json" \
  -d '{"trafficSplit": {"v1Weight": 75, "v2Weight": 25}}'

# 50% v2
curl -X PUT http://localhost:3000/traffic/example-service/traffic-split \
  -H "Content-Type: application/json" \
  -d '{"trafficSplit": {"v1Weight": 50, "v2Weight": 50}}'

# 100% v2 (full rollout)
curl -X PUT http://localhost:3000/traffic/example-service/traffic-split \
  -H "Content-Type: application/json" \
  -d '{"trafficSplit": {"v1Weight": 0, "v2Weight": 100}}'
```

### Circuit Breaker Configuration

```bash
curl -X POST http://localhost:3000/traffic \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "example-service",
    "namespace": "default",
    "trafficSplit": {
      "v1Weight": 100,
      "v2Weight": 0
    },
    "circuitBreaker": {
      "consecutiveErrors": 5,
      "intervalSeconds": 30,
      "baseEjectionTimeSeconds": 30,
      "maxEjectionPercent": 50,
      "minHealthPercent": 50
    },
    "mTLSEnabled": true
  }'
```

## 🧪 Testing

### Unit Tests

```bash
npm run test:unit
```

Tests cover:
- Domain entities and value objects
- Domain services (routing logic)
- Use cases

### Integration Tests

```bash
npm run test:integration
```

Tests cover:
- API endpoints
- Traffic routing operations
- VirtualService and DestinationRule creation

### Test Coverage

```bash
npm run test:cov
```

## 📈 Monitoring

### Check Traffic Distribution

```bash
# Get current routing configuration
curl http://localhost:3000/traffic/example-service?namespace=default

# Check VirtualService
kubectl get virtualservice example-service -o yaml

# Check DestinationRule
kubectl get destinationrule example-service -o yaml
```

### Monitor Canary Deployment

```bash
# Watch pods
kubectl get pods -l app=example-service -w

# Check service endpoints
kubectl get endpoints example-service

# View Istio metrics (requires Prometheus)
istioctl dashboard prometheus
```

### Test Traffic Splitting

```bash
# Send requests and check which version responds
for i in {1..10}; do
  kubectl exec -it $(kubectl get pod -l app=example-service,version=v1 -o jsonpath='{.items[0].metadata.name}') \
    -- curl -s http://example-service/ | grep VERSION
done
```

## 🔧 API Documentation

Swagger documentation available at:
- Local: http://localhost:3000/api
- Production: https://your-domain/api

### Key Endpoints

- `POST /traffic` - Create traffic routing configuration
- `GET /traffic/:serviceName` - Get routing configuration
- `PUT /traffic/:serviceName/traffic-split` - Update traffic split
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/startup` - Startup probe

## 🛠️ Configuration

### Environment Variables

```bash
PORT=3000                          # Application port
LOG_LEVEL=info                     # Logging level
```

### Istio Configuration

The project uses Istio resources:
- **VirtualService**: Traffic routing and splitting
- **DestinationRule**: Circuit breaker and mTLS configuration
- **PeerAuthentication**: mTLS policy enforcement

## 🎓 Skills Demonstrated

### Kubernetes
- ✅ Service Mesh (Istio)
- ✅ VirtualService for traffic routing
- ✅ DestinationRule for circuit breakers
- ✅ PeerAuthentication for mTLS
- ✅ Canary deployment strategy

### Architecture
- ✅ Domain-Driven Design (DDD)
- ✅ Clean Architecture layers
- ✅ Test-Driven Development (TDD)
- ✅ SOLID principles

### Microservices
- ✅ Traffic management
- ✅ Circuit breakers
- ✅ mTLS between services
- ✅ Gradual rollouts

### DevOps
- ✅ Kustomize manifests
- ✅ Docker multi-stage builds
- ✅ Service mesh configuration

## 📚 Best Practices Implemented

1. **DDD Structure**: Clear domain boundaries
2. **TDD**: Tests written first, comprehensive coverage
3. **Security**: mTLS for service-to-service communication
4. **Observability**: Health checks and logging
5. **Canary Strategy**: Gradual traffic migration
6. **Circuit Breakers**: Fault tolerance and resilience
7. **Documentation**: Complete API docs and README

## 🐛 Troubleshooting

### VirtualService Not Working

1. Check if Istio is installed:
   ```bash
   kubectl get pods -n istio-system
   ```

2. Verify namespace has Istio injection:
   ```bash
   kubectl get namespace default -o yaml | grep istio-injection
   ```

3. Check VirtualService status:
   ```bash
   kubectl get virtualservice example-service -o yaml
   ```

### Traffic Not Splitting

1. Verify both v1 and v2 pods are running:
   ```bash
   kubectl get pods -l app=example-service
   ```

2. Check VirtualService configuration:
   ```bash
   kubectl describe virtualservice example-service
   ```

3. Verify DestinationRule subsets match pod labels:
   ```bash
   kubectl get pods -l app=example-service --show-labels
   ```

### mTLS Issues

1. Check PeerAuthentication:
   ```bash
   kubectl get peerauthentication default -o yaml
   ```

2. Verify mTLS is enabled:
   ```bash
   istioctl authn tls-check example-service.default.svc.cluster.local
   ```

3. Check DestinationRule TLS mode:
   ```bash
   kubectl get destinationrule example-service -o yaml | grep -A 5 tls
   ```

## 📖 References

- [Istio Documentation](https://istio.io/latest/docs/)
- [VirtualService](https://istio.io/latest/docs/reference/config/networking/virtual-service/)
- [DestinationRule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)
- [Canary Deployments](https://istio.io/latest/docs/tasks/traffic-management/traffic-shifting/)
- [Circuit Breakers](https://istio.io/latest/docs/tasks/traffic-management/circuit-breaker/)

## 📄 License

MIT

---

**Project Status**: ✅ Complete  
**Tests**: ✅ 22/22 passing  
**Coverage**: ✅ Domain, Application, Infrastructure, Presentation layers  
**Documentation**: ✅ Complete with canary deployment demo

