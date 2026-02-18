# This Makefile is used to build, test and deploy this project.
#
# Usage: make help
#
# NOTE: Staging and feature branches are deployed via Vercel.
#       Production is deployed to AWS CloudFront via `make deploy/app/prd`.
#

export VERSION ?= $(shell git rev-parse --short=7 HEAD)
export SERVICE = superpower-app
export ORG = superpowerdotcom
export USER ?= $(shell whoami)

SHELL := /bin/bash
AWS_REGION ?= us-east-1
PRD_DEPLOYMENT_MSG = ":large_green_circle: *[PRD]* Deployment :large_green_circle:"
SHARED_SCRIPT=./assets/scripts/shared.sh

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
run:
	doppler run --project=superpower-app --config=dev -- bun run dev

### Build

.PHONY: build/local
build/local: description = Build the app locally
build/local: util/install
	@bash $(SHARED_SCRIPT) info "Running $@ ..."
	bun run build

### Deploy

.PHONY: deploy/app/prd
deploy/app/prd: description = Deploy app to prd (production)
deploy/app/prd:
	@bash $(SHARED_SCRIPT) info "Checking git branch and working tree ..."
	@if [ "$$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then \
		bash $(SHARED_SCRIPT) fatal "Must be on 'main' branch to deploy to production. Current branch: $$(git rev-parse --abbrev-ref HEAD)"; \
	fi
	@if [ -n "$$(git status --porcelain)" ]; then \
		bash $(SHARED_SCRIPT) fatal "Working tree is not clean. Please commit or stash your changes before deploying to production."; \
	fi
	@bash $(SHARED_SCRIPT) info "Checking if local main is up to date with origin/main ..."
	@git fetch origin main --quiet
	@if [ "$$(git rev-parse HEAD)" != "$$(git rev-parse origin/main)" ]; then \
		bash $(SHARED_SCRIPT) fatal "Local main is not up to date with origin/main. Please pull the latest changes."; \
	fi
	@bash $(SHARED_SCRIPT) info "Deploying app to cloudfront ..."
	doppler run -p $(SERVICE) -c prd -- sh ./assets/scripts/deploy-app-cloudfront.sh
	@bash $(SHARED_SCRIPT) info "Creating deployment notification in Slack ..."
	@TARGET=$@ bash $(SHARED_SCRIPT) notify $(PRD_DEPLOYMENT_MSG)

### Test

.PHONY: test
test: description = Run build, unit tests, lint, type checks
test: util/install build/local test/lint test/type-check test/unit

.PHONY: test/lint
test/lint: description = Run linting
test/lint: util/install
	@echo "Running linting..."
	bun run lint

.PHONY: test/type-check
test/type-check: description = Run type checks
test/type-check: util/install
	@echo "Running type checks..."
	bun run check-types

.PHONY: test/unit
test/unit: description = Run unit tests
test/unit: util/install
	@echo "Running unit tests..."
	@bash -c 'if [ -f .env ]; then \
	    trap "mv -f .env.bak .env; echo Restored .env from backup" EXIT SIGINT SIGTERM; \
	    cp .env .env.bak; \
	fi && \
	cp .env.example .env && \
	bun run test --run'

.PHONY: test/e2e
test/e2e: description = Run end-to-end tests
test/e2e: util/install
	@echo "Running end-to-end tests..."
	@bash -c 'if [ -f .env ]; then \
	    trap "mv -f .env.bak .env; echo Restored .env from backup" EXIT SIGINT SIGTERM; \
	    cp .env .env.bak; \
	fi && \
	cp .env.example-e2e .env && \
        rm -f mocked-db.json && \
	bun run playwright install --with-deps && \
	bun run test-e2e'

### Utility

.PHONY: util/install
util/install: description = Fetch and install Node.js dependencies
util/install:
	bun install --frozen-lockfile
