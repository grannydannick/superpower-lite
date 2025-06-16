#!/usr/bin/env bash
set -e

SHARED_SCRIPT_PATH="./assets/scripts/shared.sh"
SERVICE="superpower-app"

# Load shared shell script
if [[ ! -f ${SHARED_SCRIPT_PATH} ]]; then
    echo "ERROR: '${SHARED_SCRIPT_PATH}' not found"
    exit 1
else
    # shellcheck source=./assets/scripts/shared.sh
    source $SHARED_SCRIPT_PATH
fi

REQUIRED_VARS=(
    "AWS_ECR_URL"
    "VERSION"
    "FEATURE_NAME"
)

check_vars "${REQUIRED_VARS[@]}"

info "Fetching Doppler secrets for staging..."
doppler secrets download -p superpower-app -c stg --no-file --format=env > .env

info "Overriding API URL for feature: ${FEATURE_NAME}"
echo "VITE_APP_API_URL=https://api-${FEATURE_NAME}.superpower-staging.com" >> .env

debug "Feature environment configuration:"
debug "VITE_APP_API_URL=https://api-${FEATURE_NAME}.superpower-staging.com"

info "Building Docker image for feature: ${FEATURE_NAME}"
docker buildx build --push \
    --platform=linux/arm64 \
    -t ${AWS_ECR_URL}/${SERVICE}:${VERSION} \
    -f ./Dockerfile .

info "✅ Feature Docker image built and pushed: ${AWS_ECR_URL}/${SERVICE}:${VERSION}" 