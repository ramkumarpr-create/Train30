# Azutva Factory Pvt Ltd — Full-Stack Manufacturing Platform

Azutva is an industrial B2B/B2C e-commerce platform for a 3D printing + CNC machining
factory. It combines a static marketing frontend (7 public pages) with a Node.js/Express
REST backend, authentication, quote & contact submission with file uploads, a
server-backed request-list (cart), and an admin dashboard.

## Stack

- **Frontend** — vanilla HTML/CSS/JS (no framework, no build step).
- **Backend** — Node.js + Express (REST API under `/api`).
- **Storage** — a JSON-file data store (`data/db.json`), persisted with atomic writes and
  wrapped behind a tiny module so it can be swapped for Postgres/MySQL/Mongo later.
- **Auth** — Node's built-in `crypto` (scrypt password hashing + HMAC-signed session
  tokens in an httpOnly cookie). No external auth dependency.
- **Uploads** — `multer` (multipart), stored in `uploads/`.

## Requirements

- Node.js ≥ 18 (tested on 26).

## Run it

```bash
# 1. install dependencies
npm install

# 2. (optional) seed the catalog + admin account explicitly
npm run seed

# 3. start the server
npm start
# or, with auto-restart while developing:
npm run dev
```

Open **http://localhost:3000** in a browser.

The server auto-seeds on first start, so `npm start` alone is enough to get going.

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `AZUTVA_SECRET` | dev secret | Session-token signing key (set a long random value in production) |
| `AZUTVA_ADMIN_EMAIL` | `admin@azutva.com` | Admin login email |
| `AZUTVA_ADMIN_PASSWORD` | `admin123` | Admin password (change this) |
| `AZUTVA_DATA_DIR` | `./data` | Where `db.json` lives |
| `AZUTVA_UPLOAD_DIR` | `./uploads` | Where uploaded files are stored |

## Deploy

See [`DEPLOY.md`](DEPLOY.md) for step-by-step **Render** and **Railway** deployment, including
the [`render.yaml`](render.yaml) blueprint (web service + persistent disk) and required
environment variables.

## Default admin account

| Field | Value |
|---|---|
| Email | `admin@azutva.com` |
| Password | `admin123` |

Log in from the **Login** link in the top utility bar, then open **/admin.html**
(or the **Admin** link that appears in the top bar once signed in).

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`, `accountType`) |
| POST | `/api/auth/login` | Sign in, sets session cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user (or `{user:null}`) |
| GET | `/api/catalog` | Products (`?category=3d-printing\|cnc\|material`) |
| GET | `/api/catalog/:slug` | One product |
| POST | `/api/quotes` | Submit a quote (multipart, files optional) |
| GET | `/api/quotes` | List quotes — **admin** |
| GET | `/api/quotes/:id` | Quote detail — **admin** |
| PATCH | `/api/quotes/:id` | Update status/notes — **admin** |
| GET | `/api/quotes/:id/files/:fileId` | Download a quote file — **admin** |
| POST | `/api/contact` | Submit a contact message |
| GET | `/api/contact` | List messages — **admin** |
| GET | `/api/cart` | Current request-list |
| POST | `/api/cart` | Add item (`productId`, `qty`) |
| PATCH | `/api/cart/items/:productId` | Update quantity |
| DELETE | `/api/cart/items/:productId` | Remove item |
| DELETE | `/api/cart` | Clear |
| GET | `/api/admin/stats` | Dashboard counters — **admin** |

## Data model

`data/db.json` holds five collections: `users`, `quotes`, `contacts`, `carts` (keyed by
user or an anonymous cookie id), and `products` (seeded from `src/catalog.js`).
Passwords are stored only as scrypt hashes.

## Notes / next steps

- The JSON store is intentionally dependency-free; for a production deployment, replace
  `src/store.js` with a real database driver (the rest of the app is unchanged).
- Email notifications (sending the quote/contact confirmation) are not wired up — plug in
  an SMTP/transactional-email provider in the route handlers where records are created.
- File uploads are saved to disk but not virus-scanned; add scanning before production.
- The frontend cart, login modal and forms talk to the API with `fetch`; no bundler is used.
