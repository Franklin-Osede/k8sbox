# 02. ConfigMap Hot-Reload Service

**Domain:** Configuration Management  
**Problem:** Update application configuration without pod restarts or downtime.

## 🎯 Overview

This project implements a zero-downtime configuration reload system that watches ConfigMap volumes for changes and automatically reloads configuration without restarting the pod. It follows Domain-Driven Design (DDD) and Test-Driven Development (TDD) principles.

## 🏗️ Architecture (DDD)

### Domain Layer
- **Entities:** `ConfigStateEntity` - Represents current configuration state
- **Value Objects:** `ConfigValue` - Immutable configuration value
- **Domain Services:** `ConfigReloadDomainService` - Core configuration reload logic

### Application Layer
- **Use Cases:**
  - `GetConfigUseCase` - Get current configuration
  - `ReloadConfigUseCase` - Reload configuration from volume

### Infrastructure Layer
- **External Services:**
  - `FileWatcherService` - Watches ConfigMap volume using chokidar
  - `AppLoggerService` - Structured logging

### Presentation Layer
- **Controllers:** `ConfigController` - REST API endpoints
- **DTOs:** `ConfigResponseDto` - API response structure

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
docker build -t configmap-reload:latest -f docker/Dockerfile .
```

### Run
```bash
docker run -p 3000:3000 -v /path/to/config:/config configmap-reload:latest
```

## ☸️ Kubernetes Deployment

### With Helm (Recommended)
```bash
# Deploy
make deploy

# Update ConfigMap and watch reload
make kubectl:update-config

# View logs to see reload
make kubectl:logs
```

### With kubectl + Kustomize
```bash
# Apply base manifests
kubectl apply -k k8s/base/

# Update ConfigMap
kubectl patch configmap app-config --patch '{"data":{"app.properties":"app.name=Updated"}}'

# Watch logs for reload
kubectl logs -f deployment/configmap-reload
```

### Demonstrating Hot-Reload

1. **Deploy the application:**
```bash
kubectl apply -k k8s/base/
```

2. **Get current config:**
```bash
kubectl port-forward svc/configmap-reload 3000:80
curl http://localhost:3000/config
```

3. **Update ConfigMap:**
```bash
kubectl patch configmap app-config --patch '{"data":{"app.properties":"app.name=Hot Reloaded Config\napp.version=2.0.0"}}'
```

4. **Verify reload (check logs):**
```bash
kubectl logs -f deployment/configmap-reload
# Should see: "Config file changed: /config/app.properties"
# Should see: "Configuration reloaded successfully"
```

5. **Get updated config:**
```bash
curl http://localhost:3000/config
# Should show updated values
```

## 📊 API Endpoints

### GET /config
Get current configuration state.

**Response:**
```json
{
  "config": {
    "app.properties": "app.name=ConfigMap Reload Service",
    "database.properties": "db.host=localhost"
  },
  "lastReload": "2024-01-01T00:00:00.000Z",
  "reloadCount": 5,
  "configSize": 2
}
```

### POST /config/reload
Manually trigger configuration reload.

**Response:**
```json
{
  "config": {...},
  "lastReload": "2024-01-01T00:00:00.000Z",
  "reloadCount": 6,
  "configSize": 2
}
```

### GET /config/history
Get configuration version history.

**Query Parameters:**
- `limit` (optional): Number of versions to return (default: 10)

**Response:**
```json
{
  "versions": [
    {
      "version": 3,
      "config": {...},
      "timestamp": "2024-01-01T00:00:00.000Z",
      "checksum": "abc123"
    }
  ],
  "currentVersion": 3
}
```

### POST /config/rollback/:version
Rollback configuration to a specific version.

**Path Parameters:**
- `version`: Version number to rollback to

**Response:**
```json
{
  "config": {...},
  "lastReload": "2024-01-01T00:00:00.000Z",
  "reloadCount": 7,
  "configSize": 2
}
```

### GET /config/diff/:version1/:version2
Compare two configuration versions.

**Path Parameters:**
- `version1`: First version number
- `version2`: Second version number

**Response:**
```json
{
  "added": ["new.key"],
  "removed": ["old.key"],
  "changed": [
    {
      "key": "app.name",
      "oldValue": "Old Name",
      "newValue": "New Name"
    }
  ]
}
```

### POST /config/validate
Validate configuration without applying.

**Request Body:**
```json
{
  "app.properties": "app.name=test",
  "database.properties": "db.host=localhost"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

## 🎓 Skills Demonstrated

- ✅ ConfigMap volume mounts
- ✅ File watching patterns (chokidar)
- ✅ Zero-downtime configuration updates
- ✅ **Config Versioning & Rollback** - Advanced configuration management
- ✅ **Config Validation Schema** - Schema-based validation
- ✅ Domain-Driven Design (DDD)
- ✅ Test-Driven Development (TDD)
- ✅ Kubernetes best practices
- ✅ Helm charts
- ✅ Structured logging

## 🚀 Advanced Features

### Config Versioning & Rollback
- Automatic version creation on config changes
- Complete version history
- Rollback to any previous version
- Config diff comparison between versions
- Checksum-based change detection

### Config Validation Schema
- JSON Schema-based validation
- Type checking (string, number, boolean)
- Required field validation
- Pattern matching (regex)
- Length constraints (min/max)
- Prevents invalid configurations

## 🔧 Configuration

### Environment Variables
- `CONFIG_PATH` - Path to ConfigMap volume (default: `/config`)
- `PORT` - Application port (default: `3000`)
- `LOG_LEVEL` - Logging level (default: `info`)

### ConfigMap Structure
ConfigMap files are mounted as individual files in `/config` directory. Each file becomes a key-value pair where:
- Key: filename
- Value: file content

## 📚 Next Steps

1. Add validation for configuration values
2. Add configuration schema validation
3. Implement configuration versioning
4. Add metrics for reload events
5. Add health checks that verify config is loaded

---

**Built with ❤️ following DDD and TDD principles**

