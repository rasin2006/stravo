# API Specification

## Auth

- `POST /api/auth/login` — body: `{ identifier, password }`
- `POST /api/auth/register` — body: `{ name, identifier, password }` (password min 8 chars)

## Activities (auth required)

- `GET /api/activities` — list current user's activities
- `GET /api/activities/:id` — activity detail (owner only)
- `POST /api/activities` — body: `{ title, points[] }` (max 5000 GPS points)

## Segments

- `GET /api/segments` — public list with score enrichment
- `GET /api/segments/:id` — public segment detail
- `POST /api/segments/:id/feedback` — auth required; body: `{ isInteresting: boolean, comment? }` (upserts per user)

## Health

- `GET /api/health` — includes database connectivity status
