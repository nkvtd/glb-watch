# install all dependencies (devDeps + deps) for build & migrations
FROM node:24-alpine AS deps-dev
WORKDIR /app
COPY . .
RUN npm ci
# install production-only dependencies for the runtime image
FROM node:24-alpine AS deps-prod
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
# build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .
RUN npm run build
# production runtime image
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000
COPY package.json package-lock.json* ./
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD [ "node", "./dist/server/index.mjs" ]
