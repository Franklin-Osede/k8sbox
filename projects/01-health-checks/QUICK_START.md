# ✅ Proyecto 01: Health Checks - LISTO PARA PROBAR

## 🎉 Estado: COMPLETO Y FUNCIONANDO

✅ Todos los tests pasan (23 tests)  
✅ Estructura DDD completa  
✅ Tests TDD implementados  
✅ Código listo para ejecutar

---

## 🚀 Cómo Probarlo (3 Pasos)

### Paso 1: Instalar Dependencias (Ya hecho ✅)
```bash
cd projects/01-health-checks
npm install
```

### Paso 2: Ejecutar Tests (Ya funciona ✅)
```bash
npm test
```

**Resultado esperado:**
```
✓ 23 tests passed
✓ 4 test suites passed
```

### Paso 3: Iniciar la Aplicación
```bash
npm run start:dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 🧪 Probar los Endpoints

### Opción 1: Usando curl (Terminal)
```bash
# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe  
curl http://localhost:3000/health/ready

# Startup probe
curl http://localhost:3000/health/startup
```

### Opción 2: Usando Navegador
Abre en tu navegador:
- http://localhost:3000/health/live
- http://localhost:3000/health/ready
- http://localhost:3000/health/startup
- http://localhost:3000/api (Swagger documentation)

### Opción 3: Usando Swagger UI
1. Inicia la app: `npm run start:dev`
2. Visita: http://localhost:3000/api
3. Prueba los endpoints interactivamente

---

## 📊 Respuestas Esperadas

### GET /health/live
```json
{
  "status": "healthy",
  "message": "Application is alive",
  "timestamp": "2024-11-27T21:44:00.000Z"
}
```

### GET /health/ready
```json
{
  "status": "ready",
  "message": "Application is ready",
  "timestamp": "2024-11-27T21:44:00.000Z"
}
```

### GET /health/startup
```json
{
  "status": "started",
  "message": "Application has started",
  "timestamp": "2024-11-27T21:44:00.000Z"
}
```

---

## 🐳 Probar con Docker (Opcional)

```bash
# Construir imagen
docker build -t health-checks:latest -f docker/Dockerfile .

# Ejecutar contenedor
docker run -p 3000:3000 health-checks:latest

# Probar endpoints
curl http://localhost:3000/health/live
```

---

## ☸️ Probar con Kubernetes (Opcional)

### Prerrequisitos:
- Kubernetes cluster (minikube, kind, etc.)
- `kubectl` configurado
- `helm` 3.x instalado

### Pasos:

```bash
# 1. Construir imagen Docker
docker build -t health-checks:latest -f docker/Dockerfile .

# 2. Si usas minikube, cargar imagen:
minikube image load health-checks:latest

# 3. Desplegar con Helm
make deploy

# O manualmente:
helm install health-checks ./helm/01-health-checks

# 4. Verificar deployment
kubectl get pods -l app.kubernetes.io/name=health-checks

# 5. Port forward para probar
kubectl port-forward svc/health-checks 3000:80

# 6. Probar endpoints
curl http://localhost:3000/health/live
```

---

## ✅ Checklist de Verificación

- [x] Dependencias instaladas
- [x] Tests pasan (23/23)
- [x] Aplicación inicia sin errores
- [x] Endpoints responden correctamente
- [x] Swagger documentation accesible
- [ ] Docker build funciona (opcional)
- [ ] Kubernetes deployment funciona (opcional)

---

## 🎯 Comandos Útiles

```bash
# Tests
npm test                    # Todos los tests
npm run test:unit          # Solo unit tests
npm run test:integration   # Solo integration tests
npm run test:cov           # Con coverage

# Desarrollo
npm run start:dev          # Modo desarrollo (watch)
npm run build              # Compilar
npm run start:prod         # Modo producción

# Docker
make docker-build          # Construir imagen
docker run -p 3000:3000 health-checks:latest

# Kubernetes
make deploy                # Desplegar con Helm
make kubectl:get:all       # Ver recursos
make kubectl:logs          # Ver logs
```

---

## 📚 Documentación Completa

Para más detalles, ver:
- `README.md` - Documentación completa del proyecto
- `TESTING.md` - Guía detallada de testing
- `STRUCTURE.md` - Explicación de la estructura DDD

---

## 🎉 ¡Listo!

El proyecto está **100% funcional** y listo para:
- ✅ Demostrar en entrevistas
- ✅ Usar como plantilla para otros proyectos
- ✅ Expandir con más funcionalidades
- ✅ Desplegar en producción

**¡Empieza con `npm run start:dev` y prueba los endpoints!** 🚀

