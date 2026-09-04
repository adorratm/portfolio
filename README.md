# Portfolio Monorepo

Emre Kılıç portfolyo sistemi — NestJS backend, Next.js frontend ve admin paneli.

## Dokümantasyon

Tüm planlama ve altyapı kararları: **[docs/README.md](./docs/README.md)**

Agent'lar için: **[docs/AGENTS.md](./docs/AGENTS.md)**

## Hızlı Başlangıç

```bash
docker compose up -d
yarn install

# .env dosyalarını oluştur
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env.local

# Hepsi birden
yarn dev

# veya ayrı ayrı
yarn dev:backend
yarn dev:frontend
yarn dev:admin
```

## Stack

- **Backend:** NestJS, TypeORM (EntityManager), PostgreSQL, PgBouncer, Redis, BullMQ, Socket.io, AWS S3
- **Frontend:** Next.js 16, Tailwind, next-intl (TR/EN), Rspack
- **Admin:** Next.js 16, Google OAuth, canlı metrikler, Rspack

## Tasarım

Nocturnal Command / Dracula — `stitch_nestjs_backend_portfolio_system/`
