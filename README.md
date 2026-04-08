# Agro AI Platform

Монорепозиторій B2B агросайту з AI-ботом, API та базою лідів.

## Структура

- `apps/frontend` — Next.js (App Router, SSR, Tailwind)
- `apps/backend` — NestJS REST API + Prisma + Groq
- `packages/types` — спільні типи
- `packages/ui` — спільні UI артефакти

## Ключові endpoint-и

- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/leads`
- `POST /api/bot/query`

## AI bot flow

`user -> quick replies/chat -> /api/bot/query -> intent detection -> response + CTA -> lead form -> /api/leads -> DB/CRM`

## Запуск

1. Встановіть залежності:

```bash
pnpm install
```

2. Скопіюйте ENV:

```bash
cp .env.example .env
```

3. Підніміть PostgreSQL та Meilisearch (docker-compose або локально).

4. Згенеруйте Prisma client та міграцію:

```bash
pnpm --filter @agro-ai/backend prisma:generate
pnpm --filter @agro-ai/backend prisma:migrate
```

5. Запустіть apps:

```bash
pnpm dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api`

## CMS

Рекомендовано підключити Strapi як headless CMS для сторінок `blog/services/solutions` і збереження SEO URL.
