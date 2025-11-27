#!/bin/bash

# Script to create DDD + TDD structure for all projects

PROJECTS=(
  "01-health-checks"
  "02-configmap-reload"
  "03-secret-rotation"
  "04-hpa-custom-metrics"
  "05-pdb-manager"
  "06-statefulset-database"
  "07-custom-operator"
  "08-service-mesh"
  "09-gitops-pipeline"
  "10-zero-trust-security"
)

for project in "${PROJECTS[@]}"; do
  echo "Creating structure for $project..."
  
  # DDD Structure
  mkdir -p "projects/$project/src/domain/entities"
  mkdir -p "projects/$project/src/domain/value-objects"
  mkdir -p "projects/$project/src/domain/domain-services"
  mkdir -p "projects/$project/src/application/use-cases"
  mkdir -p "projects/$project/src/application/services"
  mkdir -p "projects/$project/src/infrastructure/repositories"
  mkdir -p "projects/$project/src/infrastructure/external"
  mkdir -p "projects/$project/src/presentation/controllers"
  mkdir -p "projects/$project/src/presentation/dto"
  mkdir -p "projects/$project/src/presentation/filters"
  
  # TDD Structure
  mkdir -p "projects/$project/tests/unit"
  mkdir -p "projects/$project/tests/integration"
  mkdir -p "projects/$project/tests/e2e"
  
  # K8s Structure
  mkdir -p "projects/$project/k8s/base"
  mkdir -p "projects/$project/k8s/overlays/dev"
  mkdir -p "projects/$project/k8s/overlays/staging"
  mkdir -p "projects/$project/k8s/overlays/prod"
  
  # Helm Structure
  mkdir -p "projects/$project/helm/$project/templates"
  
  # Docs
  mkdir -p "projects/$project/docs"
  
  # Docker
  mkdir -p "projects/$project/docker"
  
  # CI/CD
  mkdir -p "projects/$project/.github/workflows"
  
  echo "✓ Created structure for $project"
done

echo "All project structures created!"

