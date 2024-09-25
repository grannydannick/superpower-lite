# This Makefile is used to build, test and deploy this project.
#
# Usage: make help
#
# NOTE: The frontend app is only ran in Docker for dev and staging environments!
#       In production, the app is deployed to AWS Cloudfront.
#

export VERSION ?= $(shell git rev-parse --short=7 HEAD)
export SERVICE = superpower-app
export ORG = superpowerdotcom
export ARCH ?= $(shell uname -m)
export USER ?= $(shell whoami)

SHELL := /bin/bash
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID ?= $(shell command -v aws >/dev/null 2>&1 || { echo "ERROR: 'aws' CLI tool is not installed." >&2; exit 1; }; aws sts get-caller-identity --query Account --output text)
AWS_REGISTRY_ID ?= $(shell command -v aws >/dev/null 2>&1 || { echo "ERROR: 'aws' CLI tool is not installed." >&2; exit 1; }; aws ecr describe-registry --region us-east-1 --query registryId --output text)
AWS_ECR_URL ?= $(AWS_ACCOUNT_ID).dkr.ecr.us-east-1.amazonaws.com
STG_DEPLOYMENT_MSG = ":large_yellow_circle: *[STG]* Deployment :large_yellow_circle:"
PRD_DEPLOYMENT_MSG = ":large_green_circle: *[PRD]* Deployment :large_green_circle:"
SHARED_SCRIPT=./assets/scripts/shared.sh
DEPLOYMENT_DIR ?= ./deployment
DOPPLER_ENV ?= dev

# Utility functions
check_defined = \
	$(strip $(foreach 1,$1, \
		$(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = $(if $(value $1),, \
	$(error undefined '$1' variable: $2))

# Pattern #1 example: "example : description = Description for example target"
# Pattern #2 example: "### Example separator text
help: HELP_SCRIPT = \
	if (/^([a-zA-Z0-9-\.\/]+).*?: description\s*=\s*(.+)/) { \
		printf "\033[34m%-40s\033[0m %s\n", $$1, $$2 \
	} elsif(/^\#\#\#\s*(.+)/) { \
		printf "\033[33m>> %s\033[0m\n", $$1 \
	}

.PHONY: help
help:
	@perl -ne '$(HELP_SCRIPT)' $(MAKEFILE_LIST)

### Build

.PHONY: build/local
build/local: description = Build the app locally
build/local: util/install
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	yarn build

.PHONY: build/docker/app/dev
build/docker/app/dev: description = Build app/frontend docker image for dev (minikube)
build/docker/app/dev:
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	VERSION=$(VERSION) \
	bash ./assets/scripts/build-docker-app.sh dev

.PHONY: build/docker/app/stg
build/docker/app/stg: description = Build and push app/frontend docker image for stg (staging)
build/docker/app/stg: util/login-aws-ecr
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	AWS_ECR_URL=$(AWS_ECR_URL) \
	VERSION=$(VERSION) \
	bash ./assets/scripts/build-docker-app.sh stg

### Deploy

.PHONY: deploy/app/stg
deploy/app/stg: description = Deploy app to stg (staging)
deploy/app/stg: check-doppler-token check-doppler-secrets
	@echo "Deploying $(SERVICE) to Kubernetes..."
	aws eks update-kubeconfig --name staging-cluster --region $(AWS_REGION) && \
	doppler secrets substitute -p $(SERVICE) -c stg $(DEPLOYMENT_DIR)/deploy.app.yaml | \
	sed 's|__AWS_ECR_URL__|$(AWS_ECR_URL)|g' | \
	sed 's|__SERVICE__|$(SERVICE)|g' | \
	sed 's|__VERSION__|$(VERSION)|g' | \
	kubectl apply -f -

.PHONY: deploy/story/stg
deploy/story/stg: description = Deploy story to stg (staging)
deploy/story/stg: check-doppler-token check-doppler-secrets
	@echo "Deploying $(SERVICE) to Kubernetes..."
	aws eks update-kubeconfig --name staging-cluster --region $(AWS_REGION) && \
	doppler secrets substitute -p $(SERVICE) -c stg $(DEPLOYMENT_DIR)/deploy.story.yaml | \
	sed 's|__AWS_ECR_URL__|$(AWS_ECR_URL)|g' | \
	sed 's|__SERVICE__|$(SERVICE)|g' | \
	sed 's|__VERSION__|$(VERSION)|g' | \
	kubectl apply -f -

.PHONY: deploy/app/prd
deploy/app/prd: description = Deploy app to prd (production)
deploy/app/prd:
	@bash $(SHARED_SCRIPT) info "Creating deployment notification in Slack ..."
	@TARGET=$@ bash $(SHARED_SCRIPT) notify $(PRD_DEPLOYMENT_MSG)
	@bash $(SHARED_SCRIPT) info "Deploying app to cloudfront ..."
	doppler run -p $(SERVICE) -c prd -- sh ./assets/scripts/deploy-app-cloudfront.sh

### Test

.PHONY: test
test: description = Run build, unit tests, lint, type checks, e2e
test: util/install build/local test/lint test/type-check test/unit test/e2e

.PHONY: test/lint
test/lint: description = Run linting
test/lint: util/install
	@echo "Running linting..."
	yarn lint

.PHONY: test/type-check
test/type-check: description = Run type checks
test/type-check: util/install
	@echo "Running type checks..."
	yarn check-types

.PHONY: test/unit
test/unit: description = Run unit tests
test/unit: util/install
	@echo "Running unit tests..."
	@bash -c 'if [ -f .env ]; then \
	    trap "mv -f .env.bak .env; echo Restored .env from backup" EXIT SIGINT SIGTERM; \
	    cp .env .env.bak; \
	fi && \
	cp .env.example .env && \
	yarn test --run'

.PHONY: test/e2e
test/e2e: description = Run end-to-end tests
test/e2e: util/install
	@echo "Running end-to-end tests..."
	@bash -c 'if [ -f .env ]; then \
	    trap "mv -f .env.bak .env; echo Restored .env from backup" EXIT SIGINT SIGTERM; \
	    cp .env .env.bak; \
	fi && \
	cp .env.example-e2e .env && \
	yarn playwright install --with-deps && \
	yarn test-e2e'

### Utility

.PHONY: util/login-aws-ecr
util/login-aws-ecr: description = Login to AWS ECR
util/login-aws-ecr:
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	aws ecr get-login-password --region us-east-1 | \
	docker login --username AWS --password-stdin $(AWS_ECR_URL)

.PHONY: util/k8s/context/dev
util/k8s/context/dev: description = Set K8S context to minikube
util/k8s/context/dev:
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	kubectl config use-context minikube

.PHONY: util/k8s/context/stg
util/k8s/context/stg: description = Set K8S context to staging cluster
util/k8s/context/stg:
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	aws eks update-kubeconfig --name staging-cluster --region $(AWS_REGION)

.PHONY: util/install
util/install: description = Fetch and install Node.js dependencies
util/install:
	yarn install --network-timeout=1000000

# Private targets

# Check if user is logged into Doppler
.PHONY: check-doppler-token
check-doppler-token:
	@bash $(SHARED_SCRIPT) info "Checking Doppler token ..."
	@if ! doppler configure get token > /dev/null 2>&1; then \
    	bash $(SHARED_SCRIPT) fatal "Doppler is not configured. Please log in using 'doppler login'"; \
 	fi

# Check if any secrets are missing (ie. have 'no-value') in Doppler (default DOPPLER_ENV to 'dev')
.PHONY: check-doppler-secrets
check-doppler-secrets:
	@bash $(SHARED_SCRIPT) info "Checking for missing secrets ..."
	@if doppler secrets substitute -p $(SERVICE) -c $(DOPPLER_ENV) $(DEPLOYMENT_DIR)/deploy.app.yaml | grep -B 1 "<no value>"; then \
		bash $(SHARED_SCRIPT) fatal "Found missing secret(s) in '$(DEPLOYMENT_DIR)/deploy.app.yaml'"; \
	fi
