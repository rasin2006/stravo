#!/usr/bin/env bash
set -euo pipefail

# One-time Fly.io setup for Stravo (run from repo root).
# Requires: flyctl logged in (`fly auth login`)

REGION="${FLY_REGION:-sin}"

echo "==> Creating Postgres (skip if stravo-db already exists)"
fly postgres create --name stravo-db --region "$REGION" --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 1 || true

echo "==> Deploying API"
cd backend
fly apps create stravo-api --org personal 2>/dev/null || true
fly postgres attach stravo-db --app stravo-api --yes || true
fly secrets set JWT_SECRET="$(openssl rand -hex 32)" --app stravo-api
fly deploy --remote-only
cd ..

echo "==> Deploying Web"
cd web-frontend
fly apps create stravo-web --org personal 2>/dev/null || true
fly deploy --remote-only
cd ..

echo ""
echo "Done!"
echo "  API:  https://stravo-api.fly.dev/api/health"
echo "  Web:  https://stravo-web.fly.dev"
echo ""
echo "Next: create a GitHub Actions token (org-wide — works for both apps):"
echo "  fly tokens create org -x 999999h -o personal"
echo "Then add as FLY_API_TOKEN at:"
echo "  https://github.com/rasin2006/stravo/settings/secrets/actions"
