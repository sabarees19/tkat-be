# Use alpine image for ligther images
FROM node:20-bullseye-slim


# Install a few system dependencies
RUN apt-get update
RUN apt-get install -y build-essential python3
RUN npm -g i pnpm

WORKDIR /app

# Copy our package files as usual
# pnp use pnpm-lock.json rather than package-lock.json
COPY package*.json pnpm-lock.yaml /app/

# Instruct pnpm to use store directory at /pnpm
# And copy dependencies from store instead of symlinking them
# This is required as cache mount will only be available
# during build time
# it's also possible to run commands such as
#   pnpm config set store-dir /pnpm_store
#   pnpm config set package-import-method copy 
# or use .npmrc
ENV NPM_CONFIG_STORE_DIR=/pnpm
ENV NPM_CONFIG_PACKAGE_IMPORT_METHOD=copy

# Mount pnpm cache at /pnpm (matching NPM_CONFIG_STORE_DIR)
# And run pnpm install
RUN --mount=type=cache,id=pnmcache,target=/pnpm \
  pnpm i --prefer-offline --frozen-lockfile

# Copy remaining files
COPY . /app