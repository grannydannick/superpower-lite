#!/usr/bin/env bash
#

set -e

SHARED_SCRIPT_PATH="./assets/scripts/shared.sh"
SERVICE="superpower-app"
BUILD_ENV=$1

# Load shared shell script
if [[ ! -f ${SHARED_SCRIPT_PATH} ]]; then
    echo "ERROR: '${SHARED_SCRIPT_PATH}' not found"
    exit 1
else
    # shellcheck source=./assets/scripts/shared.sh
    source $SHARED_SCRIPT_PATH
fi

if [[ -z $BUILD_ENV ]]; then
    BUILD_ENV="dev"
    warning "No BUILD_ENV passed - setting to default value: ${BUILD_ENV}"
fi

REQUIRED_VARS=(
    "BUILD_ENV"
    "AWS_ECR_URL"
    "VERSION"
)

check_vars "${REQUIRED_VARS[@]}"

info "Fetching Doppler secrets..."
doppler secrets download -p superpower-app -c stg_scheduling --no-file --format=env > .env

# Debugging github workflows
debug "BUILD_ENV: ${BUILD_ENV}"
debug "AWS_ECR_URL: ${AWS_ECR_URL}"
debug "VERSION: ${VERSION}"

debug ".env contents:"
cat .env

unset NODE_ENV
if [ "${BUILD_ENV}" == "dev" ]; then
    (eval $(minikube docker-env) && docker build -t ${SERVICE}:${VERSION} -f ./deployment/superpower/app/Dockerfile .)
else
    docker buildx build --push \
        --platform=linux/arm64 \
        -t ${AWS_ECR_URL}/${SERVICE}:${VERSION} \
        -f ./Dockerfile .
fi