# Deploying Azutva

Azutva is a **Node.js + Express** app. It needs a Node host (not static-only hosting).
Both **Render** and **Railway** run it with minimal setup. Easiest path: push the project
to a **GitHub** repo first, then connect that repo to the host.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | Set automatically by Render/Railway. Defaults to `3000` locally. |
| `AZUTVA_SECRET` | **yes** | Session-token signing key. Use a long random string. |
| `AZUTVA_ADMIN_PASSWORD` | no | Admin login password (default `admin123`). **Change it.** |
| `AZUTVA_ADMIN_EMAIL` | no | Admin login email (default `admin@azutva.com`). |
| `AZUTVA_DATA_DIR` | no | Where `db.json` lives (default `./data`). |
| `AZUTVA_UPLOAD_DIR` | no | Where uploaded files go (default `./uploads`). |

The admin account is auto-created on first start from the admin env vars.

---

## Render

### Option A — free tier (no persistent disk)
1. Push the repo to GitHub.
2. Render dashboard → **New + → Web Service** → connect your repo.
3. It auto-detects Node. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Under **Environment → Environment Variables**, add:
   - `AZUTVA_SECRET` (generate or paste a long random string)
   - `AZUTVA_ADMIN_PASSWORD` (your own password)
5. **Create Web Service.** It deploys and gives you an `https://…onrender.com` URL.

> Free tier: the filesystem is **ephemeral** — `data/db.json` and `uploads/` reset on
> every deploy/sleep. The app still works (it re-seeds the catalog + admin on start), you
> just lose saved users/quotes/uploads. Fine for testing.

### Option B — persistent data (Starter, $7/mo)
Use the included [`render.yaml`](render.yaml) blueprint:
1. Push the repo to GitHub.
2. Render → **New + → Blueprint** → connect the repo.
3. Review the service (it already declares the `azutva-data` disk, build/start commands, and env vars). Set a real `AZUTVA_ADMIN_PASSWORD`.
4. **Apply.** Your data and uploads now survive redeploys.

---

## Railway

1. Push the repo to GitHub.
2. Railway → **New Project → Deploy from GitHub repo** → select the repo.
   Railway auto-detects Node (runs `npm install` + `npm start`).
3. Add a **Volume** (for persistent data):
   - Service → **Settings → Volumes → Add Volume** → mount path `/data`.
4. Add **Variables** (Service → Variables):
   - `AZUTVA_SECRET` (long random string)
   - `AZUTVA_ADMIN_PASSWORD` (your own password)
   - `AZUTVA_DATA_DIR` = `/data`
   - `AZUTVA_UPLOAD_DIR` = `/data/uploads`
5. Railway generates a public URL under **Settings → Networking → Generate Domain**.

> Railway's free tier is credit-based; the volume and runtime consume credits.

---

## After it's live

1. Open your URL — the homepage should load and the carousel should rotate.
2. Log in at **Login →** `admin@azutva.com` / your admin password, then open **/admin.html**.
3. Test the quote form (submit a file) and confirm it appears in the admin dashboard.
4. Point your custom domain (both Render and Railway support custom domains + managed SSL).

## Data & backups

- Data lives in `AZUTVA_DATA_DIR` (`db.json`) and uploads in `AZUTVA_UPLOAD_DIR`.
- On Render Starter / Railway with a volume, these persist. Back them up by downloading
  the `db.json` and `uploads/` periodically (or move to Postgres + object storage before
  scaling to multiple instances).
