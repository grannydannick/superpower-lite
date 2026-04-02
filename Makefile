# This Makefile is used to build, test and deploy this project.
#
# Usage: make help
#
# Staging and preview deployments are handled automatically by Vercel.
# Production deployments are promoted via the Vercel dashboard.
#

export VERSION ?= $(shell git rev-parse --short=7 HEAD)
export SERVICE = superpower-app

SHELL := /bin/bash

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
run: util/install
	doppler run --project=superpower-app --config=dev -- bun run dev

### Build

.PHONY: build/local
build/local: description = Build the app locally
build/local: util/install
	bun run build

### Deploy

.PHONY: deploy/app/stg
deploy/app/stg: description = Deploy app to staging (via Vercel)
deploy/app/stg:
	@echo ""
	@echo "  Staging deploys are automatic -- open a PR and merge to 'main'."
	@echo "  https://vercel.com/dashboard"
	@echo ""

.PHONY: deploy/app/prd
deploy/app/prd: description = Deploy app to production (via Vercel)
deploy/app/prd:
	@echo ""
	@echo "  Production deploys are done by promoting a staging deployment in the Vercel dashboard."
	@echo "  https://vercel.com/dashboard"
	@echo ""

### Test

.PHONY: test
test: description = Run build, unit tests, lint, format check (lint includes type checks)
test: util/install build/local test/fmt-check test/lint test/unit

.PHONY: test/fmt-check
test/fmt-check: description = Check formatting
test/fmt-check: util/install
	@echo "Checking formatting..."
	bun run fmt:check

.PHONY: test/lint
test/lint: description = Run linting
test/lint: util/install
	@echo "Running linting..."
	bun run lint

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

### Utility

.PHONY: util/install
util/install: description = Fetch and install Node.js dependencies
util/install:
	bun install --frozen-lockfile
