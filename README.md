# Vitera B2B Agro Platform

Production-oriented monorepo scaffold for a Vitera Ukraine redesign focused on fertilizer selection, AI recommendations, lead capture, and CRM handoff.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Backend: NestJS, REST API
- Database: PostgreSQL with Prisma
- Search: Meilisearch
- AI: Groq
- CMS-ready content model: Prisma-first, extensible to Strapi or a custom admin

## Repository structure

```text
apps/
  frontend/   # Next.js storefront and lead flows
  backend/    # NestJS API, Prisma, Groq bot
packages/
  ui/         # Shared UI components
  types/      # Shared TypeScript contracts
```

## Quick start

1. Copy `.env.example` to `.env` and fill in the real values.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run db:generate
```

4. Run the apps in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

5. Optional database workflow:

```bash
npm run db:migrate
npm run db:seed
```

## Current scope

- Monorepo initialized
- NestJS backend implemented with products, leads, and bot endpoints
- Prisma schema and seed data added
- Next.js frontend scaffolded with required routes and shared components

## API

- `GET /health`
- `GET /products`
- `GET /products/:slug`
- `POST /leads`
- `POST /bot/query`
