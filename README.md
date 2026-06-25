# Portfolio Monorepo

Emre Kılıç portfolyo sistemi — NestJS backend, Next.js frontend ve admin paneli.

## Dokümantasyon

Tüm planlama ve altyapı kararları: **[docs/README.md](./docs/README.md)**

Agent'lar için: **[docs/AGENTS.md](./docs/AGENTS.md)**

## Hızlı Başlangıç

```bash
docker compose up -d

cd backend && cp .env.example .env && yarn start:dev
cd frontend && cp .env.example .env.local && yarn dev
cd admin && cp .env.example .env.local && yarn dev
```

## Stack

- **Backend:** NestJS, TypeORM (EntityManager), PostgreSQL, PgBouncer, Redis, BullMQ, Socket.io, AWS S3
- **Frontend:** Next.js 15, Tailwind, next-intl (TR/EN)
- **Admin:** Next.js 15, Google OAuth, canlı metrikler

## Tasarım

Nocturnal Command / Dracula — `stitch_nestjs_backend_portfolio_system/`
