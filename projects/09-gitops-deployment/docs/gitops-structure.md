# GitOps Repository Structure

## App of Apps Pattern

```
gitops-repo/
├── apps/
│   ├── app-of-apps.yaml          # Root application
│   └── my-app/
│       ├── dev/
│       │   ├── kustomization.yaml
│       │   └── values.yaml
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── values.yaml
│       └── prod/
│           ├── kustomization.yaml
│           └── values.yaml
└── README.md
```

## Environment Configuration

### Dev
- Automated sync: Enabled
- Self-heal: Enabled
- Prune: Enabled
- Target revision: HEAD

### Staging
- Automated sync: Disabled (manual approval)
- Self-heal: Disabled
- Prune: Enabled
- Target revision: HEAD

### Prod
- Automated sync: Disabled (manual approval)
- Self-heal: Disabled
- Prune: Disabled
- Target revision: Tagged releases (v1.0.0, v1.1.0, etc.)

