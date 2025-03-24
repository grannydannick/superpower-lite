FROM node:20-alpine

WORKDIR /app

# Copy package.json, yarn.lock, and .env
# COPY package.json yarn.lock .env ./
COPY package.json yarn.lock ./

# Use env variables from .env during yarn install
RUN printenv > .env

# RUN export $(grep -v '^#' .env | xargs) && \
RUN yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the application
COPY . .

# Build the application using env variables
# RUN export $(grep -v '^#' .env | xargs) && \
#     yarn build

RUN yarn build

EXPOSE 3000

CMD ["yarn", "preview", "--host"]
