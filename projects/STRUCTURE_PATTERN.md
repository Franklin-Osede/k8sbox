# 📁 Patrón de Estructura para Proyectos

## ✅ Estructura Consistente

Todos los proyectos siguen este patrón:

```
projects/
├── 01-health-checks/
│   ├── helm/
│   │   └── health-checks/          # ✅ Nombre sin prefijo numérico
│   ├── k8s/
│   ├── src/
│   └── ...
│
├── 02-configmap-reload/
│   ├── helm/
│   │   └── configmap-reload/       # ✅ Nombre sin prefijo numérico
│   ├── k8s/
│   ├── src/
│   └── ...
│
└── XX-project-name/
    ├── helm/
    │   └── project-name/            # ✅ Nombre sin prefijo numérico
    └── ...
```

## 📋 Reglas de Nomenclatura

### Carpetas de Proyecto
- ✅ `01-health-checks/` - Con prefijo numérico
- ✅ `02-configmap-reload/` - Con prefijo numérico
- ❌ `health-checks/` - Sin prefijo (solo para Helm)

### Carpetas de Helm
- ✅ `helm/health-checks/` - Sin prefijo numérico
- ✅ `helm/configmap-reload/` - Sin prefijo numérico
- ❌ `helm/01-health-checks/` - Con prefijo (redundante)

## 🎯 Razón del Patrón

1. **Carpetas de proyecto** tienen prefijo numérico para orden
2. **Carpetas de Helm** NO tienen prefijo porque:
   - El nombre del chart ya está en Chart.yaml
   - Evita redundancia
   - Más limpio y profesional

## ✅ Proyectos Actuales

- ✅ `01-health-checks/helm/health-checks/`
- ✅ `02-configmap-reload/helm/configmap-reload/`
- 📋 `03-secret-rotation/helm/secret-rotation/` (cuando se implemente)
- 📋 `04-hpa-custom-metrics/helm/hpa-custom-metrics/` (cuando se implemente)

---

**Patrón establecido y aplicado a todos los proyectos** ✅

