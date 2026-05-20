#!/usr/bin/env bash
# PM2 reload only (no npm build). From repo root:
#   ./deploy/restart.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f ecosystem.config.cjs ]]; then
  echo "ERROR: ecosystem.config.cjs missing"
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERROR: pm2 not found"
  exit 1
fi

export NODE_ENV=production
pm2 startOrReload ecosystem.config.cjs --only bestbond-reward-api --update-env
pm2 save
echo "==> [api.bestbond.in] PM2 reloaded bestbond-reward-api"
