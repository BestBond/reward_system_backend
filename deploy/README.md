# Deploying `api.bestbond.in` (GitHub: **`reward_system_backend`** — local folder in this monorepo is often `reward-system-backend`)

**On-server layout:** production app directories match the public hostname under `/var/www/` (e.g. **`/var/www/api.bestbond.in`** for this API, **`/var/www/admin.bestbond.in`** for the admin SPA).

## One-time VPS setup

1. **DNS** — Point `api.bestbond.in` A record to the server IP.

2. **Clone with GitHub SSH** (as `root` or your deploy user):

   ```bash
   mkdir -p /var/www
   cd /var/www
   git clone git@github.com:YOUR_ORG/reward_system_backend.git api.bestbond.in
   cd api.bestbond.in
   ```

3. **Authenticate Git on the VPS** — `git pull` / `git fetch` need GitHub credentials:
   - **Deploy key (recommended):** on the VPS run `ssh-keygen`, add the **public** key under repo → Settings → **Deploy keys** (read-only), keep the private key on the server, and use `git@github.com:...` as `origin`.
   - Alternatively use an HTTPS remote with a credential helper or PAT (not covered here).

4. **Environment** — Copy and edit (never commit `.env`):

   ```bash
   cp .env.example .env
   nano .env
   ```

   Production essentials: `NODE_ENV=production`, `PORT=3000`, `DB_PATH` (absolute path on persistent disk), strong `JWT_SECRET`, `CORS_ORIGINS=https://admin.bestbond.in`, `TRUST_PROXY=1` behind nginx.

5. **Install, build, PM2**:

   ```bash
   export NODE_ENV=production
   export PUPPETEER_SKIP_DOWNLOAD=1
   npm ci --omit=dev
   npm run build
   npm i -g pm2
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup systemd -u root --hp /root
   ```

6. **Nginx** — Copy `deploy/nginx-api.bestbond.in.conf.sample` to `/etc/nginx/sites-available/api.bestbond.in`, symlink `sites-enabled`, `nginx -t`, reload. Then TLS: `certbot --nginx -d api.bestbond.in`.

## Continuous deployment (GitHub Actions)

Workflow: `.github/workflows/deploy-api.yml` — keep this file in your GitHub repo **`reward_system_backend`** (same `origin` URL the VPS uses).

**Repository secrets**

| Secret        | Purpose                   |
| ------------- | ------------------------- |
| `VPS_HOST`    | Server hostname or IP     |
| `VPS_SSH_KEY` | Private key for SSH (PEM) |

The workflow connects as `root`. To use another user, change `username` in `.github/workflows/deploy-api.yml`.

**GitHub Actions SSH key** — Add a dedicated key pair: public key in `/root/.ssh/authorized_keys` on the VPS, private key in the repo secret `VPS_SSH_KEY` (same secret can be reused on the frontend repo for rsync).

**Git pulls on the server** — The workflow runs `git fetch` / `git reset` on the VPS. That host must already authenticate to GitHub (deploy key for this repo, or SSH agent). The key in `VPS_SSH_KEY` is only for GitHub Actions → VPS login, not for `git fetch` unless you reuse it.

The workflow SSHs in, `git fetch` / `git reset --hard origin/main`, `npm ci --omit=dev`, `npm run build`, then `pm2 startOrReload ecosystem.config.cjs`.

**Deploy directory on server** — Default **`/var/www/api.bestbond.in`**. Override with repository variable **`VPS_API_DIR`** (Settings → Secrets and variables → Actions → Variables).

**Default branch** — Workflow assumes `main`. Rename your default branch to `main` or edit the `git fetch` / `git reset` lines in `.github/workflows/deploy-api.yml`.

**Migrating** — If the API lived under `/var/www/reward-system-api` or PM2 used `bestbond-admin`, move the clone to `/var/www/api.bestbond.in` (or set **`VPS_API_DIR`**) and run `pm2 delete bestbond-admin` once, then use `bestbond-reward-api` from `ecosystem.config.cjs`.
