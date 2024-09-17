#!/usr/bin/env bash

set -e

SHARED_SCRIPT_PATH="./assets/scripts/shared.sh"

# Load shared shell script
if [[ ! -f ${SHARED_SCRIPT_PATH} ]]; then
    echo "ERROR: '${SHARED_SCRIPT_PATH}' not found"
    exit 1
else
    # shellcheck source=./assets/scripts/shared.sh
    source $SHARED_SCRIPT_PATH
fi

REQUIRED_VARS=(
    "VITE_APP_API_URL"
    "VITE_APP_ENABLE_API_MOCKING"
    "VITE_APP_STRIPE_PUBLISHABLE_KEY"
    "VITE_APP_VITAL_ENV"
    "VITE_APP_GOOGLE_API_KEY"
    "VITE_APP_CALENDLY_TOKEN"
    "APP_BUCKET"
    "AWS_DISTRIBUTION_ID"
)

check_vars "${REQUIRED_VARS[@]}"

unset NODE_ENV
yarn
REACT_APP_GITHUB_SHA=$VERSION yarn run build 

# Packages now live in the root
#pushd packages/app

# First deploy hashed files that are cached forever
# It is important to deploy these files first,
# because they are referenced by the index.html file.
# If a user attempts to download a hashed file that doesn't exist,
# it can cause a bad cache entry in CloudFront.

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.css"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.woff"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.ttf"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.woff2"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.js" \
  --exclude "service-worker.js"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "application/json" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.css.map" \
  --include "*.js.map" \
  --exclude "service-worker.js.map"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "text/plain" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.txt"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "image/x-icon" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.ico"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "image/jpg" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.jpg"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "image/png" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.png"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "image/svg+xml" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.svg"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "text/x-vcard" \
  --cache-control "public, max-age=31536000" \
  --exclude "*" \
  --include "*.vcf"

# Now deploy named files that are not cached.
# These are small lightweight files that are not hashed.
# It is important to deploy these files last,
# because they reference the previously uploaded hashed files.

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "text/html" \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.html"

aws s3 cp dist/ "s3://${APP_BUCKET}/" \
  --recursive \
  --content-type "application/manifest+json" \
  --cache-control "no-cache" \
  --exclude "*" \
  --include "*.webmanifest"

# aws s3 cp dist/service-worker.js "s3://${APP_BUCKET}/" \
#   --content-type "application/javascript" \
#   --cache-control "no-cache"
#
# aws s3 cp dist/service-worker.js.map "s3://${APP_BUCKET}/" \
#   --content-type "application/json" \
#   --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id "${AWS_DISTRIBUTION_ID}" --paths '/*'

popd
