# Multi-stage Dockerfile for Angular applications
FROM node:22-alpine AS base
RUN npm install -g pnpm@9.12.0
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
ARG APP_NAME
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build ${APP_NAME} --configuration=production

# Runner stage - Nginx
FROM nginx:alpine AS runner
ARG APP_NAME

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist/apps/${APP_NAME} /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Create health endpoint
RUN echo '{"status":"ok"}' > /usr/share/nginx/html/health

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
