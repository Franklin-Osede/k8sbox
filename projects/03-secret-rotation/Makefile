.PHONY: help install test build docker-build deploy clean

PROJECT_NAME := secret-rotation
IMAGE_NAME := $(PROJECT_NAME)
IMAGE_TAG := latest
REGISTRY := docker.io
NAMESPACE := default
HELM_CHART := ./helm/secret-rotation

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

test: ## Run all tests
	npm test

test:unit: ## Run unit tests
	npm run test:unit

test:integration: ## Run integration tests
	npm run test:integration

test:cov: ## Run tests with coverage
	npm run test:cov

build: ## Build the application
	npm run build

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

docker-build: ## Build Docker image
	docker build -t $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG) -f docker/Dockerfile .

docker-push: docker-build ## Build and push Docker image
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

helm:lint: ## Lint Helm chart
	helm lint $(HELM_CHART)

helm:template: ## Template Helm chart
	helm template $(PROJECT_NAME) $(HELM_CHART)

deploy: ## Deploy with Helm
	helm upgrade --install $(PROJECT_NAME) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--create-namespace

undeploy: ## Undeploy Helm release
	helm uninstall $(PROJECT_NAME) --namespace $(NAMESPACE)

clean: ## Clean build artifacts
	rm -rf dist/ node_modules/ coverage/

kubectl:get:all: ## Get all resources
	kubectl get all -l app.kubernetes.io/name=$(PROJECT_NAME) -n $(NAMESPACE)

kubectl:logs: ## Get logs
	kubectl logs -l app.kubernetes.io/name=$(PROJECT_NAME) -n $(NAMESPACE) --tail=100 -f

kubectl:port-forward: ## Port forward to service
	kubectl port-forward svc/$(PROJECT_NAME) 3000:80 -n $(NAMESPACE)

kubectl:rotate-secret: ## Rotate a secret manually
	@read -p "Secret name: " secret; \
	read -p "Namespace (default): " ns; \
	ns=$${ns:-default}; \
	curl -X POST http://localhost:3000/rotation/secret/$$ns/$$secret

