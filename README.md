# Turnos - Monorepo (Backend + Client + Admin)

Estructura creada con:
- PostgreSQL + Prisma
- Backend Node + TypeScript + Express + Prisma
- Frontends Next.js (client + admin)
- Docker compose para dev y prod
- GitHub Actions CI (build)

## Quick start (dev)

1. Copy `.env.example` to `.env` and edit if needed.
2. Start containers (dev): `docker-compose -f docker-compose.dev.yml up --build`
3. Enter backend container and run migrations:
   - `docker exec -it turnos_backend sh`
   - `cd prisma` (if needed) or run `npx prisma generate` and `npx prisma migrate dev --name init --preview-feature`

Endpoints:
- Backend health: http://localhost:4000/health
- Client: http://localhost:3000
- Admin: http://localhost:3001
