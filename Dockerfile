FROM node:20-alpine

WORKDIR /app

# Copy package.json, yarn.lock, and .env
COPY package.json yarn.lock .env ./

# Use env variables from .env during yarn install
RUN export $(grep -v '^#' .env | xargs) && \
    yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the application
COPY . .

# Build the application using env variables
RUN export $(grep -v '^#' .env | xargs) && \
    yarn build

EXPOSE 3000

CMD ["yarn", "preview", "--host"]