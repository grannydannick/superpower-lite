export ORG = superpowerdotcom
export SERVICE = superpower-app
export ARCH ?= $(shell uname -m)
export USER ?= $(shell whoami)
export VERSION ?= $(shell git rev-parse --short=7 HEAD)

SHELL := /bin/bash
AWS_REGION ?= us-east-1
AWS_ACCOUNT_ID ?= $(shell command -v aws >/dev/null 2>&1 || { echo "ERROR: 'aws' CLI tool is not installed." >&2; exit 1; }; aws sts get-caller-identity --query Account --output text)
AWS_REGISTRY_ID ?= $(shell command -v aws >/dev/null 2>&1 || { echo "ERROR: 'aws' CLI tool is not installed." >&2; exit 1; }; aws ecr describe-registry --region us-east-1 --query registryId --output text)
APP_NAME := app
ECR_REPO := app
K8S_NAMESPACE := superpower
DOCKER_TAG := $(shell git rev-parse --short HEAD)
AWS_REGION := us-east-1
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text)
ECR_URL := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
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
	

# Docker commands

.PHONY: build/docker/app/stg
build/docker/app/stg: description = Build and push app/frontend docker image for stg (staging)
build/docker/app/stg: util/login-aws-ecr
	@echo "Running build/docker/app/stg ..."
	AWS_ECR_URL=$(ECR_URL) \
	VERSION=$(VERSION) \
	bash ./assets/scripts/build-docker-app.sh stg

build/docker/app:
	docker build -t $(APP_NAME):$(DOCKER_TAG) -f Dockerfile .

push/docker/app: build/docker/app
	@echo "Pushing $(APP_NAME) to ECR..."
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)
	docker tag $(APP_NAME):$(DOCKER_TAG) $(ECR_URL)/$(ECR_REPO):$(DOCKER_TAG)
	docker push $(ECR_URL)/$(ECR_REPO):$(DOCKER_TAG)

# Kubernetes commands
deploy/app/stg:
	@echo "Deploying $(APP_NAME) to Kubernetes..."
	aws eks update-kubeconfig --name staging-cluster --region $(AWS_REGION) && \
	sed -e 's|__AWS_ECR_URL__|$(ECR_URL)|g' \
		-e 's|__SERVICE__|$(ECR_REPO)|g' \
		-e 's|__VERSION__|$(DOCKER_TAG)|g' \
		deployment/halfbaked-app/deploy.app.yaml | kubectl apply -f -

deploy/story/stg:
	@echo "Deploying $(APP_NAME) to Kubernetes..."
	aws eks update-kubeconfig --name staging-cluster --region $(AWS_REGION) && \
	sed -e 's|__AWS_ECR_URL__|$(ECR_URL)|g' \
		-e 's|__SERVICE__|$(ECR_REPO)|g' \
		-e 's|__VERSION__|$(DOCKER_TAG)|g' \
		deployment/$(APP_NAME)/deploy.app.story.yaml | kubectl apply -f -

### Deploy (PRD)

deploy/app/prd:
	@bash $(SHARED_SCRIPT) info "Creating deployment notification in Slack ..."
	@TARGET=$@ bash $(SHARED_SCRIPT) notify $(PRD_DEPLOYMENT_MSG)
	@bash $(SHARED_SCRIPT) info "Deploying app to cloudfront ..."
	doppler run -p superpower -c prd -- sh ./assets/scripts/deploy-app-cloudfront.sh

# Combined commands
build/push/deploy/app: build/docker/app push/docker/app deploy/app

# Utility commands
util/login-aws-ecr:
	@echo "Logging into AWS ECR..."
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)

.PHONY: build/docker/app push/docker/app deploy/app build/push/deploy/app util/login-aws-ecr
