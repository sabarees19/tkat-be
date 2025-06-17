# Use alpine image for lighter images
FROM node:20-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential python3

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Configure pnpm to work with Docker cache
ENV NPM_CONFIG_STORE_DIR=/pnpm
ENV NPM_CONFIG_PACKAGE_IMPORT_METHOD=copy

# Install dependencies using pnpm with cache
RUN --mount=type=cache,id=pnmcache,target=/pnpm \
  pnpm install --prefer-offline --frozen-lockfile

# Copy rest of the app
COPY . .

# Expose port (Render looks for this)
EXPOSE 3333

# Define the default command to run the app
# (Change this based on your app type)
CMD ["pnpm", "start"]
