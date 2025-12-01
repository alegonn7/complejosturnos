# Etapa 1: Pruning
FROM node:18-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=cliente --docker

# Etapa 2: Instalar dependencias
FROM node:18-alpine AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN npm ci

# Etapa 3: Builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Variables de entorno para build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Build
RUN npm run build --workspace=cliente

# Etapa 4: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder --chown=nextjs:nodejs /app/apps/cliente/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/cliente/.next/static ./apps/cliente/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/cliente/public ./apps/cliente/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/cliente/server.js"]