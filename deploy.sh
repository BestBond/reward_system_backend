#!/usr/bin/env bash
#
# api.bestbond.in — Nest API (PM2: bestbond-reward-api)
# Run from repo root on the VPS clone, e.g. /var/www/api.bestbond.in
#
#   chmod +x deploy.sh deploy/restart.sh
#   cp .env.production.example .env.production   # first time only
#   ./deploy.sh
#
# Optional: RUN_GIT_PULL=1 ./deploy.sh
#

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

log() { echo "==> [api.bestbond.in] $*"; }

log "deploy from $ROOT"

if [[ "${RUN_GIT_PULL:-0}" == "1" ]] && [[ -d .git ]]; then
  log "git fetch + reset"
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    git fetch origin main && git reset --hard origin/main
  elif git rev-parse --verify origin/master >/dev/null 2>&1; then
    git fetch origin master && git reset --hard origin/master
  else
    echo "WARN: no origin/main or origin/master — skip git reset"
  fi
fi

if [[ ! -f ecosystem.config.cjs ]]; then
  echo "ERROR: ecosystem.config.cjs missing"
  exit 1
fi

if [[ ! -f .env.production ]] && [[ ! -f .env ]]; then
  if [[ -f .env.production.example ]]; then
    echo "ERROR: copy .env.production.example to .env.production and set JWT_SECRET, DB_PATH, etc."
  else
    echo "ERROR: missing .env.production (see .env.production.example)"
  fi
  exit 1
fi

if [[ ! -f .env.production ]] && [[ -f .env ]]; then
  log "using legacy .env (consider renaming to .env.production)"
fi

export NODE_ENV=production
export PUPPETEER_SKIP_DOWNLOAD=1

log "npm ci (includes devDependencies for build)"
npm ci

log "npm run build"
npm run build

if [[ ! -f dist/main.js ]]; then
  echo "ERROR: dist/main.js missing after build"
  exit 1
fi

log "npm prune --omit=dev"
npm prune --omit=dev

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERROR: pm2 not found. Install: npm i -g pm2"
  exit 1
fi

log "pm2 startOrReload bestbond-reward-api"
pm2 startOrReload ecosystem.config.cjs --only bestbond-reward-api --update-env
pm2 save

log "Done. Confirm PORT in .env.production matches nginx upstream (default 3001 on shared VPS)"
