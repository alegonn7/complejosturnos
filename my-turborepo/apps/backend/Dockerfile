# Etapa 1: Pruning (eliminar código innecesario)
FROM node:18-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=backend --docker

# Etapa 2: Instalar dependencias
FROM node:18-alpine AS installer
WORKDIR /app

# Copiar archivos de dependencias
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Etapa 3: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=installer /app/ .

# Copiar código fuente
COPY --from=pruner /app/out/full/ .

# Instalar dependencias de dev para build
RUN npm ci

# Build
RUN npm run build --workspace=backend

# Etapa 4: Runner (imagen final)
FROM node:18-alpine AS runner
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Copiar solo lo necesario
COPY --from=builder --chown=backend:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=backend:nodejs /app/apps/backend/package.json ./package.json
COPY --from=installer --chown=backend:nodejs /app/node_modules ./node_modules

# Copiar Prisma client si existe
COPY --from=builder --chown=backend:nodejs /app/packages/database ./packages/database

USER backend

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]