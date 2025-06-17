FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential python3 && npm i -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build  # this will run nx build api

EXPOSE 3333  # or the port your app uses
CMD ["pnpm", "start:prod"]