# Deployment

Production stack: **GitHub** (code) + **Fly.io** (API + web) + **Expo EAS** (iOS/Android).

## URLs (after deploy)

| Service | URL |
|---------|-----|
| API | https://stravo-api.fly.dev/api |
| Web | https://stravo-web.fly.dev |
| Health | https://stravo-api.fly.dev/api/health |

## One-time Fly.io setup

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
fly auth login

# From repo root — creates Postgres, deploys API + web
chmod +x scripts/fly-setup.sh
./scripts/fly-setup.sh
```

Or step by step:

```bash
# 1. Postgres
fly postgres create --name stravo-db --region sin

# 2. Backend
cd backend
fly launch --no-deploy --copy-config --name stravo-api --region sin
fly postgres attach stravo-db
fly secrets set JWT_SECRET="$(openssl rand -hex 32)"
fly deploy

# 3. Web
cd ../web-frontend
fly launch --no-deploy --copy-config --name stravo-web --region sin
fly deploy
```

## GitHub

```bash
git remote add origin https://github.com/rasin2006/stravo.git
git push -u origin main
```

Add repo secret for CI:

```bash
# Org token — works for stravo-api AND stravo-web (apps do not need to exist yet)
fly tokens create org -x 999999h -o personal

# Copy the token, then:
gh secret set FLY_API_TOKEN --repo rasin2006/stravo
```

Or paste manually at https://github.com/rasin2006/stravo/settings/secrets/actions

**Do not use** `fly tokens create deploy` from the repo root — that requires an existing app and causes `Could not find App`.

Pushes to `main` auto-deploy via [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## Environment variables

### Backend (`fly secrets set -a stravo-api`)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Auto | Set by `fly postgres attach` |
| `JWT_SECRET` | Yes | Random string |
| `PORT` | No | Defaults to 8080 on Fly |

### Web (build-time in `web-frontend/fly.toml`)

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://stravo-api.fly.dev/api` |

### Mobile (EAS)

| Variable | Production value |
|----------|------------------|
| `API_BASE_URL` | `https://stravo-api.fly.dev/api` |
| `GOOGLE_MAPS_API_KEY` | Android maps (optional on iOS) |

## Mobile (iOS + Android)

```bash
cd mobile-app
npm install -g eas-cli
eas login
eas init          # links to Expo project, sets EAS_PROJECT_ID
eas build --platform all --profile production
eas submit --platform all
```

- **iOS**: Apple Developer account required ($99/yr)
- **Android**: Google Play Developer account ($25 one-time)

Dev builds use Expo Go or `eas build --profile development`.

## Local development

Unchanged — SQLite when `DATABASE_URL` is unset:

```bash
cd backend && npm start          # :4000
cd web-frontend && npm start     # :5173
cd mobile-app && npm start       # Expo
```

## PostGIS

Fly Postgres: enable after attach:

```bash
fly postgres connect -a stravo-db
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Sequelize `sync({ alter: true })` creates tables on first API boot.
