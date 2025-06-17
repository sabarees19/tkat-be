FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential python3 && npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm nx build api

# Informational — your app must actually bind to process.env.PORT
EXPOSE 3000

CMD ["node", "dist/apps/api/main.js"]
