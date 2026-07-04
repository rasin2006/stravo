# Stravo

Rural path discovery and community-driven feedback platform for mobile and web.

## Project structure

- `mobile-app/` — React Native (Expo) for iOS and Android
- `backend/` — Node.js/Express API (Fly.io)
- `web-frontend/` — React web client (Fly.io)
- `database/` — SQL schema and migrations
- `docs/` — Architecture, API spec, deployment

## Quick start (local)

```bash
cd backend && npm install && npm start
cd web-frontend && npm install && npm start
cd mobile-app && npm install && npm start
```

## Production

- **GitHub**: https://github.com/rasin2006/stravo
- **API**: https://stravo-api.fly.dev/api
- **Web**: https://stravo-web.fly.dev

See [docs/deployment.md](docs/deployment.md) for Fly.io + EAS setup.
