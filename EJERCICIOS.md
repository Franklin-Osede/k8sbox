# 🚀 Ejercicios Kubernetes - Consola Primero, Programar Después

Ejercicios prácticos que puedes hacer con `kubectl` y consola primero, y luego automatizar/programar.

---

## 🔥 Ejercicios que te Harán Ver PRO

### 01. **Health Checks Multi-Etapa (Liveness + Readiness + Startup)**

**Por qué es PRO:**
- Muestra que entiendes el ciclo de vida completo de pods
- Es algo que TODO servicio en producción necesita
- Demuestra conocimiento avanzado, no básico

**Paso 1: Consola (kubectl)**
```bash
# Crear un pod con los 3 tipos de probes
kubectl run nginx-health --image=nginx --restart=Never \
  --overrides='
{
  "spec": {
    "containers": [{
      "name": "nginx-health",
      "image": "nginx",
      "livenessProbe": {
        "httpGet": {"path": "/", "port": 80},
        "initialDelaySeconds": 30,
        "periodSeconds": 10
      },
      "readinessProbe": {
        "httpGet": {"path": "/", "port": 80},
        "initialDelaySeconds": 5,
        "periodSeconds": 5
      },
      "startupProbe": {
        "httpGet": {"path": "/", "port": 80},
        "failureThreshold": 30,
        "periodSeconds": 10
      }
    }]
  }
}'

# Ver cómo se comporta
kubectl get pod nginx-health -w
kubectl describe pod nginx-health
```

**Paso 2: Programar (YAML + Script)**
- Crear `deployment.yaml` con los 3 probes
- Script que monitorea el estado de los probes
- Documentar cuándo usar cada uno

**Habilidades que demuestra:**
- Entendimiento profundo de probes
- Capacidad de diseñar sistemas resilientes
- Conocimiento de cómo K8s gestiona el ciclo de vida

---

### 02. **ConfigMap Hot-Reload sin Reiniciar Pods**

**Por qué es PRO:**
- Zero-downtime configuration updates
- Muestra conocimiento avanzado de volúmenes
- Resuelve un problema REAL de producción

**Paso 1: Consola**
```bash
# Crear ConfigMap
kubectl create configmap app-config --from-literal=message="Hola Mundo"

# Crear pod que monta el ConfigMap como volumen
kubectl run app-reload --image=busybox --restart=Never \
  --overrides='
{
  "spec": {
    "containers": [{
      "name": "app-reload",
      "image": "busybox",
      "command": ["sh", "-c", "while true; do cat /config/message; sleep 5; done"],
      "volumeMounts": [{
        "name": "config",
        "mountPath": "/config"
      }]
    }],
    "volumes": [{
      "name": "config",
      "configMap": {"name": "app-config"}
    }]
  }
}'

# Ver logs
kubectl logs -f app-reload

# Cambiar ConfigMap (en otra terminal)
kubectl patch configmap app-config --patch '{"data":{"message":"Nuevo Mensaje"}}'

# Ver cómo el pod detecta el cambio (sin reiniciar)
```

**Paso 2: Programar**
- Script que watch ConfigMap y recarga configuración
- Aplicación NestJS que lee del volumen y recarga
- Automatizar el proceso completo

**Habilidades que demuestra:**
- Zero-downtime deployments
- File watching patterns
- Configuración dinámica

---

### 03. **Secret Rotation Automático**

**Por qué es PRO:**
- Seguridad es CRÍTICO
- Muestra que piensas en compliance
- Automatización de procesos críticos

**Paso 1: Consola**
```bash
# Crear secret
kubectl create secret generic app-secret \
  --from-literal=password=oldpassword123

# Crear deployment que usa el secret
kubectl create deployment app-secret --image=nginx

# Patch el deployment para usar el secret como env
kubectl set env deployment/app-secret \
  PASSWORD=$(kubectl get secret app-secret -o jsonpath='{.data.password}' | base64 -d)

# Rotar el secret
kubectl create secret generic app-secret \
  --from-literal=password=newpassword456 \
  --dry-run=client -o yaml | kubectl apply -f -

# Reiniciar pods para que tomen el nuevo secret
kubectl rollout restart deployment/app-secret

# Verificar que tienen el nuevo password
kubectl get pods -l app=app-secret
kubectl exec <pod-name> -- env | grep PASSWORD
```

**Paso 2: Programar**
- Script que rota secrets automáticamente
- Usar External Secrets Operator
- Implementar con Pod Disruption Budgets

**Habilidades que demuestra:**
- Security-first mindset
- Secret management avanzado
- Automatización de seguridad

---

### 04. **HPA con Métricas Custom (sin Prometheus, usando CPU primero)**

**Por qué es PRO:**
- Autoescalado es avanzado
- Muestra que entiendes métricas y escalabilidad
- Es algo que empresas grandes usan

**Paso 1: Consola**
```bash
# Crear deployment con recursos definidos (requerido para HPA)
kubectl create deployment php-apache --image=k8s.gcr.io/hpa-example

# Exponer recursos (requests/limits)
kubectl set resources deployment/php-apache \
  --requests=cpu=200m --limits=cpu=500m

# Exponer como service
kubectl expose deployment php-apache --port=80

# Crear HPA
kubectl autoscale deployment php-apache \
  --cpu-percent=50 \
  --min=1 \
  --max=10

# Ver HPA
kubectl get hpa

# Generar carga (en otra terminal)
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never \
  -- /bin/sh -c "while true; do wget -q -O- http://php-apache; done"

# Ver cómo escala
watch kubectl get hpa,deployment,pods
```

**Paso 2: Programar**
- Script que genera carga y monitorea HPA
- Integrar con Prometheus para métricas custom
- Dashboard que muestra el comportamiento

**Habilidades que demuestra:**
- Escalabilidad automática
- Entendimiento de métricas
- Cost optimization

---

### 05. **Pod Disruption Budget (PDB)**

**Por qué es PRO:**
- Alta disponibilidad es crítico
- Muestra que entiendes SLA
- Es algo que empresas grandes necesitan

**Paso 1: Consola**
```bash
# Crear deployment con múltiples réplicas
kubectl create deployment nginx-pdb --image=nginx --replicas=3

# Crear PDB que garantiza mínimo 2 pods disponibles
kubectl create poddisruptionbudget nginx-pdb \
  --selector=app=nginx-pdb \
  --min-available=2

# Ver PDB
kubectl get pdb

# Intentar drenar un nodo (simular mantenimiento)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Ver cómo K8s respeta el PDB (no puede bajar de 2 pods)
kubectl get pods -w
```

**Paso 2: Programar**
- Script que simula disruptions
- Monitoreo de disponibilidad durante updates
- Documentar estrategias de PDB

**Habilidades que demuestra:**
- Alta disponibilidad
- Entendimiento de SLA
- Rolling updates controlados

---

### 06. **Resource Quotas y Limit Ranges**

**Por qué es PRO:**
- Multi-tenancy es avanzado
- Muestra gestión de recursos y costos
- Es crítico en empresas grandes

**Paso 1: Consola**
```bash
# Crear namespace
kubectl create namespace quota-demo

# Crear LimitRange (define límites por pod)
kubectl create limitrange mem-limit-range \
  --namespace=quota-demo \
  --max=1Gi \
  --min=100Mi \
  --default=500Mi \
  --default-request=200Mi

# Crear ResourceQuota (límite total del namespace)
kubectl create quota compute-quota \
  --namespace=quota-demo \
  --hard=cpu=2,memory=4Gi,pods=10

# Ver quotas
kubectl describe quota compute-quota -n quota-demo
kubectl describe limitrange mem-limit-range -n quota-demo

# Intentar crear pod sin resources (fallará o usará defaults)
kubectl run test-pod --image=nginx -n quota-demo

# Ver qué resources se asignaron
kubectl describe pod test-pod -n quota-demo
```

**Paso 2: Programar**
- Script que crea namespaces con quotas
- Calculadora de recursos necesarios
- Alertas cuando se acerca al límite

**Habilidades que demuestra:**
- Multi-tenancy
- Cost management
- Resource planning

---

### 07. **StatefulSet con Persistent Volumes**

**Por qué es PRO:**
- Stateful workloads son más complejos
- Muestra que puedes manejar datos persistentes
- Es necesario para bases de datos

**Paso 1: Consola**
```bash
# Crear StorageClass (si no existe)
kubectl create -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
EOF

# Crear PersistentVolume
kubectl create -f - <<EOF
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  hostPath:
    path: /tmp/k8s-pv
EOF

# Crear StatefulSet
kubectl create -f - <<EOF
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "nginx"
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
  - metadata:
      name: www
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: local-storage
      resources:
        requests:
          storage: 1Gi
EOF

# Ver StatefulSet y PVCs
kubectl get statefulset,pvc,pods
```

**Paso 2: Programar**
- Script que crea StatefulSets con backups
- Volume snapshots automáticos
- Restore desde snapshots

**Habilidades que demuestra:**
- Stateful applications
- Data persistence
- Backup/restore

---

### 08. **Network Policies (Zero Trust)**

**Por qué es PRO:**
- Seguridad de red es crítica
- Zero-trust es concepto avanzado
- Muestra security in depth

**Paso 1: Consola**
```bash
# Crear dos deployments
kubectl create deployment app1 --image=nginx
kubectl create deployment app2 --image=nginx

# Exponer como services
kubectl expose deployment app1 --port=80 --name=app1-svc
kubectl expose deployment app2 --port=80 --name=app2-svc

# Crear NetworkPolicy que permite solo tráfico desde app1 a app2
kubectl create -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app2-allow-app1
spec:
  podSelector:
    matchLabels:
      app: app2
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: app1
    ports:
    - protocol: TCP
      port: 80
EOF

# Probar conectividad
kubectl run test --image=busybox --rm -it --restart=Never -- \
  wget -q -O- --timeout=2 http://app2-svc

# Desde pod de app1 (debería funcionar)
kubectl exec -it deployment/app1 -- wget -q -O- http://app2-svc

# Desde pod de test (debería fallar)
kubectl run test --image=busybox --rm -it --restart=Never -- \
  wget -q -O- --timeout=2 http://app2-svc
```

**Paso 2: Programar**
- Script que crea Network Policies automáticamente
- Visualizador de políticas
- Tests de conectividad

**Habilidades que demuestra:**
- Network security
- Zero-trust architecture
- Pod isolation

---

### 09. **RBAC Completo (Roles y ServiceAccounts)**

**Por qué es PRO:**
- Seguridad a nivel de cluster
- Multi-tenancy avanzado
- Least privilege principle

**Paso 1: Consola**
```bash
# Crear ServiceAccount
kubectl create serviceaccount app-sa

# Crear Role (permisos en un namespace)
kubectl create role pod-reader \
  --verb=get,list,watch \
  --resource=pods

# Crear RoleBinding (asignar role a serviceaccount)
kubectl create rolebinding read-pods \
  --role=pod-reader \
  --serviceaccount=default:app-sa

# Probar permisos
kubectl auth can-i get pods --as=system:serviceaccount:default:app-sa
kubectl auth can-i create pods --as=system:serviceaccount:default:app-sa

# Usar el ServiceAccount en un pod
kubectl run test-sa --image=curlimages/curl \
  --serviceaccount=app-sa \
  --restart=Never \
  --rm -it -- \
  sh -c "curl -k https://kubernetes.default/api/v1/namespaces/default/pods"
```

**Paso 2: Programar**
- Script que crea RBAC por namespace
- Auditoría de permisos
- Generador de políticas

**Habilidades que demuestra:**
- Cluster security
- Multi-tenancy
- Least privilege

---

### 10. **Init Containers para Database Migrations**

**Por qué es PRO:**
- Resuelve problema REAL de deployments
- Muestra conocimiento avanzado del ciclo de vida
- Patrón común en producción

**Paso 1: Consola**
```bash
# Crear deployment con init container
kubectl create -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-with-migration
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app-with-migration
  template:
    metadata:
      labels:
        app: app-with-migration
    spec:
      initContainers:
      - name: migration
        image: busybox
        command: ['sh', '-c', 'echo "Running migrations..."; sleep 5; echo "Migrations complete"']
      containers:
      - name: app
        image: nginx
        ports:
        - containerPort: 80
EOF

# Ver cómo el init container se ejecuta primero
kubectl get pods -w
kubectl logs <pod-name> -c migration
kubectl logs <pod-name> -c app
```

**Paso 2: Programar**
- Script que ejecuta migraciones antes del deploy
- Integración con bases de datos reales
- Rollback automático si falla

**Habilidades que demuestra:**
- Pod lifecycle management
- Database migration patterns
- Dependency management

---

## 🎯 Orden Recomendado para Hacerlos

1. **Health Checks** (más básico pero importante)
2. **Pod Disruption Budget** (fácil de entender)
3. **HPA** (escalabilidad, muy impresionante)
4. **ConfigMap Hot-Reload** (zero-downtime, muy pro)
5. **Network Policies** (seguridad, avanzado)
6. **StatefulSet** (datos persistentes)
7. **RBAC** (seguridad avanzada)
8. **Resource Quotas** (multi-tenancy)
9. **Secret Rotation** (seguridad crítica)
10. **Init Containers** (patrones avanzados)

---

## 💡 Tips para Hacerlos PRO

1. **Documenta cada paso** - Escribe qué aprendiste
2. **Experimenta** - Rompe cosas y arreglalas
3. **Visualiza** - Usa `kubectl get` y `watch` para ver cambios
4. **Lee los eventos** - `kubectl get events` te dice qué pasa
5. **Describe todo** - `kubectl describe` es tu mejor amigo

---

## 🚀 Después de Hacerlos en Consola

Cuando los domines con `kubectl`, puedes:

1. **Crear YAMLs** - Convertir comandos a manifests
2. **Automatizar** - Scripts bash/Python que lo hacen
3. **Programar** - Operadores, controllers, herramientas
4. **Documentar** - READMEs con ejemplos
5. **Compartir** - Subirlos a GitHub como portfolio

---

**Empieza con los primeros 3 y ve avanzando. Cada uno te hace más PRO.**


