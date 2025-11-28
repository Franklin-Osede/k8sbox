.PHONY: help install test build docker-build deploy clean

PROJECT_NAME := hpa-custom-metrics
IMAGE_NAME := $(PROJECT_NAME)
IMAGE_TAG := latest
REGISTRY := docker.io
NAMESPACE := default
HELM_CHART := ./helm/hpa-custom-metrics

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
	kubectl get all,hpa -l app.kubernetes.io/name=$(PROJECT_NAME) -n $(NAMESPACE)

kubectl:logs: ## Get logs
	kubectl logs -l app.kubernetes.io/name=$(PROJECT_NAME) -n $(NAMESPACE) --tail=100 -f

kubectl:port-forward: ## Port forward to service
	kubectl port-forward svc/$(PROJECT_NAME) 3000:80 -n $(NAMESPACE)

kubectl:simulate-load: ## Simulate load to trigger scaling
	@curl -X POST http://localhost:3000/metrics/simulate-load \
		-H "Content-Type: application/json" \
		-d '{"rps": 150, "queueDepth": 50, "connections": 100}'

kubectl:watch-hpa: ## Watch HPA status
	kubectl get hpa $(PROJECT_NAME) -n $(NAMESPACE) -w


