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

   Production essentials: `NODE_ENV=production`, **`PORT`** (see nginx upstream — use **`3001`** if `bestbond.in` already uses **`3000`**), `DB_PATH` (absolute path on persistent disk), strong `JWT_SECRET`, `CORS_ORIGINS=https://admin.bestbond.in`, `TRUST_PROXY=1` behind nginx.

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

6. **Nginx (order matters for Certbot)**  
   - Copy `deploy/nginx-api.bestbond.in.conf.sample` to `/etc/nginx/sites-available/api.bestbond.in`.  
   - Enable and load **HTTP only** first:
     ```bash
     ln -sf /etc/nginx/sites-available/api.bestbond.in /etc/nginx/sites-enabled/
     nginx -t && systemctl reload nginx
     ```
   - TLS — either:
     ```bash
     certbot --nginx -d api.bestbond.in
     ```
     or, if the certificate already exists (e.g. you ran Certbot before the vhost existed):
     ```bash
     certbot install --cert-name api.bestbond.in
     ```

### Certbot: “Could not automatically find a matching server block”

You already have a cert under `/etc/letsencrypt/live/api.bestbond.in/`, but the **nginx installer** needs an **enabled** `server { ... server_name api.bestbond.in; ... }` block (usually `listen 80`). Fix:

1. Install the sample vhost as above and `nginx -t && systemctl reload nginx`.
2. Confirm nginx sees the name: `nginx -T 2>/dev/null | grep -A2 server_name | grep api.bestbond` (or inspect `/etc/nginx/sites-enabled/`).
3. Attach the cert: `certbot install --cert-name api.bestbond.in`  
   If that still fails, run `certbot install --cert-name api.bestbond.in -v` and check `/var/log/letsencrypt/letsencrypt.log`.

After a successful install, Certbot typically adds `listen 443 ssl` and a port-80 → HTTPS redirect. Ensure **`TRUST_PROXY=1`** in the API `.env` when clients use HTTPS.

### `api.bestbond.in` shows the **same marketing site** as `bestbond.in` (very often a **port clash**)

Your API nginx config uses **`proxy_pass`** to a Node port. If **bestbond.in** (e.g. Next.js) is already on **`127.0.0.1:3000`**, and the sample upstream also pointed to **3000**, nginx is doing its job — you are just **proxying the wrong app**.

1. **See what owns 3000** (on the VPS):  
   `ss -tlnp | grep ':3000 '`  
   `pm2 list`

2. **Run the reward API on a free port** (e.g. **3001**): in `/var/www/api.bestbond.in/.env` set `PORT=3001` (must match nginx `upstream`).

3. **Match nginx** — In `/etc/nginx/sites-available/api.bestbond.in`, the upstream should be `server 127.0.0.1:3001;` (see repo `deploy/nginx-api.bestbond.in.conf.sample`).

4. **Reload**  
   `pm2 reload bestbond-reward-api --update-env` (or restart), then `nginx -t && systemctl reload nginx`.

5. **Verify**  
   `curl -sS http://127.0.0.1:3001/health` → JSON.  
   `curl -sS -H 'Host: api.bestbond.in' http://127.0.0.1/health` → JSON through nginx.

### `api.bestbond.in` shows the marketing site (wrong **vhost** / default server)

If the above returns JSON on `:3001` but the browser still shows HTML, nginx may not be matching `api.bestbond.in` (default server or missing SSL block — see earlier sections).

1. **Confirm the API vhost is loaded**  
   `nginx -T 2>/dev/null | grep -E 'server_name|listen' | grep -B1 -A0 api.bestbond`  
   You should see `server_name api.bestbond.in;` inside a `server { ... }` that also `listen`s on 80 and/or 443.

2. **Enable the API config**  
   `ls -la /etc/nginx/sites-enabled/` — you need `api.bestbond.in` → `sites-available`. If missing:  
   `ln -sf /etc/nginx/sites-available/api.bestbond.in /etc/nginx/sites-enabled/` then `nginx -t && systemctl reload nginx`.

3. **Check the main site does not claim the API host**  
   Open the `bestbond.in` nginx config. `server_name` should be only **`bestbond.in`** / **`www.bestbond.in`** (or whatever you use). It must **not** list `api.bestbond.in` unless you intend one vhost to serve both.

4. **Avoid a catch‑all stealing API traffic**  
   If `bestbond.in` uses `server_name _` or a very broad regex, fix it so `api.bestbond.in` has its own block (use the sample in `deploy/nginx-api.bestbond.in.conf.sample`).

5. **HTTPS** — If HTTP is correct but the browser (HTTPS) is wrong, add/fix `listen 443 ssl` on the API `server` block and run `certbot install --cert-name api.bestbond.in` (see Certbot section above).

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
