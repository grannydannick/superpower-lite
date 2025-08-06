FROM node:20.19.4-alpine

WORKDIR /app

# Copy package.json, yarn.lock
COPY package.json yarn.lock ./

# RUN export $(grep -v '^#' .env | xargs) && \
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the application (will be overridden by Skaffold sync in dev)
COPY . .

EXPOSE 3000

CMD ["yarn", "dev", "--host"] 