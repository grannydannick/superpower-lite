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
DEPLOY_SCRIPT=./assets/scripts/deploy.py
KSP_SCRIPT=./assets/scripts/ksp.sh
DOPPLER_CONFIG ?= dev

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

### Run

.PHONY: run
run: description = Run the app locally
run: prereq
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	doppler run --project=superpower-app --config=dev -- yarn run dev

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
deploy/app/stg: description = Deploy app to staging
deploy/app/stg: prereq
	K8S_CLUSTER=staging-cluster \
	DOPPLER_PROJECT=superpower-app \
	DOPPLER_CONFIG=stg \
	DEPLOY_ENV=STG \
	DEPLOY_CONFIG=deployment/deploy.app.yaml \
	KSP_SERVICE=app \
	python3 $(DEPLOY_SCRIPT) -r superpower-app -t deploy/hidden

.PHONY: deploy/story/stg
deploy/story/stg: description = Deploy story to staging
deploy/story/stg: prereq
	K8S_CLUSTER=staging-cluster \
	DOPPLER_PROJECT=superpower-app \
	DOPPLER_CONFIG=stg \
	DEPLOY_ENV=STG \
	DEPLOY_CONFIG=deployment/deploy.story.yaml \
	KSP_SERVICE=story \
	python3 $(DEPLOY_SCRIPT) -r superpower-app -t deploy/hidden

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

# ------------------- "Hidden" / non-public targets --------------------

# Check if user is logged into Doppler
.PHONY: check-doppler-token
check-doppler-token:
	@bash $(SHARED_SCRIPT) info "Checking Doppler token ..."
	@if ! doppler configure get token > /dev/null 2>&1; then \
    	bash $(SHARED_SCRIPT) fatal "Doppler is not configured. Please log in using 'doppler login'"; \
 	fi

# Check if any secrets are missing (ie. have 'no-value') in Doppler
.PHONY: check-doppler-secrets
check-doppler-secrets:
	@bash $(SHARED_SCRIPT) info "Checking for missing secrets in $(DEPLOY_CONFIG) ..."
	@if doppler secrets substitute -p $(SERVICE) -c $(DOPPLER_CONFIG) $(DEPLOY_CONFIG) | grep -B 1 "<no value>"; then \
		bash $(SHARED_SCRIPT) fatal "Found missing secret(s) in '$(DEPLOY_CONFIG)'"; \
	fi

.PHONY: prereq
prereq:
	@bash $(SHARED_SCRIPT) info "Checking prerequisites ..."
	@bash $(SHARED_SCRIPT) prereq

.PHONY: debug/slack
debug/slack:
	@bash $(SHARED_SCRIPT) info "Sending a slack message ..."
	@TARGET=$@ bash $(SHARED_SCRIPT) notify "This is a test message"

.PHONY: debug/log
debug/log:
	@bash $(SHARED_SCRIPT) info "Installing tools ..."

.PHONY: deploy/hidden
deploy/hidden: prereq check-doppler-secrets
	$(call check_defined, K8S_CLUSTER DOPPLER_PROJECT DOPPLER_CONFIG DEPLOY_CONFIG DEPLOY_ENV, Variable is not set)
	@bash $(SHARED_SCRIPT) info "Performing K8S deployment to $(DEPLOY_ENV)..."
	aws eks update-kubeconfig --name $(K8S_CLUSTER) --region $(AWS_REGION) || (echo "Failed to update kubeconfig" && exit 1)
	@if [ "$(DEPLOY_ENV)" = "STG" ]; then \
		bash $(SHARED_SCRIPT) notify $(STG_DEPLOYMENT_MSG); \
	elif [ "$(DEPLOY_ENV)" = "PRD" ]; then \
		bash $(SHARED_SCRIPT) notify $(PRD_DEPLOYMENT_MSG); \
	fi
	@bash $(SHARED_SCRIPT) info "Previous image: $(shell bash $(KSP_SCRIPT) image $(KSP_SERVICE))"
	doppler secrets substitute -p $(DOPPLER_PROJECT) -c $(DOPPLER_CONFIG) $(DEPLOY_CONFIG) | \
	sed "s/__VERSION__/$(VERSION)/g" | \
	sed "s/__SERVICE__/$(SERVICE)/g" | \
	sed "s/__AWS_ECR_URL__/$(AWS_ECR_URL)/g" | \
	kubectl apply -f -
