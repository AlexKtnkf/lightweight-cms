# Lightweight CMS

A minimal, self-hosted CMS built with Node.js, Express, EJS, and PostgreSQL.

## Prerequisites

- **Node.js** ≥ 20.19
- **Docker** (for local Postgres) or a remote PostgreSQL instance

## Local Development

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy environment file and review defaults
cp .env.example .env

# 4. Set up database (migrate + seed example data)
npm run setup

# 5. Create an admin user (interactive prompt)
npm run create-admin

# 6. Start the server
npm run dev
# → http://localhost:3000  (site)
# → http://localhost:3000/admin  (admin panel — served by Vite in dev)
```

### Admin Front-end (Vite)

The admin SPA lives in `admin/`. During development, run it alongside the API server:

```bash
npm run dev:admin   # Vite dev server with HMR
```

For production, build the admin bundle:

```bash
npm run build:admin
```

### Useful Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Express server (development) |
| `npm run dev:admin` | Start admin Vite dev server |
| `npm run build:admin` | Build admin for production |
| `npm run migrate` | Run pending SQL migrations |
| `npm run seed` | Seed homepage, settings & example data |
| `npm run setup` | `migrate` + `seed` in one step |
| `npm run create-admin` | Create an admin user (interactive) |
| `npm run reset-admin-password` | Reset an admin password |
| `npm run generate-static` | Pre-render static HTML pages |

## Deploy to Railway

### 1. Create the project

```bash
railway login
railway init            # or link to existing project
railway add --plugin postgresql
```

### 2. Set environment variables

Required:

| Variable | Value |
|---|---|
| `DATABASE_URL` | *Set automatically by Postgres plugin* |
| `SESSION_SECRET` | Random string (≥ 32 chars) |
| `SITE_HOST` | Your Railway public domain |

Optional (email, analytics, Turnstile):

| Variable | Example |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `you@gmail.com` |
| `SMTP_PASS` | App-specific password |
| `CONTACT_EMAIL_TO` | `admin@example.com` |
| `UPLOADS_DIR` | `/data/uploads` (if using a Railway volume) |
| `GA_ID` | `G-XXXXXXXXXX` |
| `TURNSTILE_SITE_KEY` | Cloudflare dashboard |
| `TURNSTILE_SECRET_KEY` | Cloudflare dashboard |

### 3. Deploy

```bash
railway up
```

Railway runs `npm install` → `npm start` (which runs migrations automatically before starting the server).

### 4. First-time data setup

Open a Railway shell and run:

```bash
railway shell
npm run seed
npm run create-admin
```

**Note:** Railway's Postgres uses an internal hostname (`postgres.railway.internal`) that is only accessible from within Railway's infrastructure. If you run `railway run` from your local machine, it will fail with `ENOTFOUND postgres.railway.internal`. Always use `railway shell` instead for CLI commands that need database access.

### 5. Reset admin password on Railway

**Option A: Using `railway shell` (CLI)**

```bash
railway shell
npm run reset-admin-password
```

**Option B: Using the API endpoint (if `railway shell` doesn't work)**

If `railway shell` keeps exiting, use the HTTP API endpoint to reset admin password:

```bash
# Set your Railway app URL and password
APP_URL="https://your-app.railway.app"
USERNAME="your-admin-username"
NEW_PASSWORD="your-new-secure-password-12chars+"
SETUP_TOKEN="your-setup-token-from-env"

# Reset password
curl -X POST "$APP_URL/api/admin/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'$USERNAME'",
    "newPassword": "'$NEW_PASSWORD'",
    "setupToken": "'$SETUP_TOKEN'"
  }'
```

Alternatively, to create initial admin if none exists:

```bash
curl -X POST "$APP_URL/api/admin/auth/setup-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "secure-password-12chars+",
    "setupToken": "'$SETUP_TOKEN'"
  }'
```

### 6. Health check

The app exposes `GET /health` returning `{"status":"ok","db":true}`, configured in [railway.json](railway.json).

## Project Structure

```
├── server.js              # Express entry point
├── docker-compose.yml     # Local Postgres
├── railway.json           # Railway service config
├── admin/                 # Admin SPA (Vite + React)
├── db/
│   ├── migrate.js         # Migration runner
│   ├── seed.js            # Data seeder
│   ├── create-admin.js    # Admin user creation CLI
│   ├── reset-admin-password.js
│   └── migrations/        # SQL migration files
├── src/
│   ├── domain/            # Business logic (auth, content, contact, media, settings)
│   ├── infrastructure/    # Database wrapper, static generator
│   └── presentation/      # Controllers & routes
├── views/                 # EJS templates
├── public/                # Static assets & uploads
└── utils/                 # Logger, image optimizer
```

## Environment Reference

See [.env.example](.env.example) for the full list of variables with descriptions.
