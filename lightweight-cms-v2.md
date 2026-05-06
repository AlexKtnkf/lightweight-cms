# Lightweight CMS v2 — Advanced Administration Roadmap

## Context & Current State

- **Stack:** Node.js/Express + React/TypeScript (Vite) admin + PostgreSQL + EJS public pages
- **Architecture:** Clean Architecture (domain/application/infrastructure/presentation)
- **Styling:** CSS variable design system in `public/css/main.css` (all `:root` tokens)
- **Auth:** Session-based, single `users` table, no roles, one admin per instance
- **Block system:** 9 block types in `blockCatalog.ts`, rendered dynamically via EJS partials
- **Hosting:** Railway-referenced code/docs; Docker Compose for local dev only
- **Multi-site:** Zero multi-tenancy — settings hardcoded to `id=1`

---

## Confirmed Decisions

| Decision | Choice |
|---|---|
| Deployment model | One git repo, N independent instances (own DB, uploads, env vars). No multi-tenancy. |
| Milestone order | Feature Switches → Hosting Portability → Roles → Style → Complex Components |
| Feature flags storage | Env vars at deploy time, immutable at runtime |
| Flags bypass | Super_admin bypasses all flags; flags only restrict editors |
| Editor permissions | Create/edit/publish/delete all content + media. No settings, users, or backups. |
| Role model | 3 tiers — `super_admin`, `admin`, `editor` |
| Storage abstraction | `ObjectStorageAdapter` — S3-compatible, configurable endpoint |
| Shop scope | Product catalog + Stripe Checkout, no inventory |
| Appointments | Built-in list + email confirmation, no calendar sync |

---

## Milestone 1 — Feature Switches

**Goal:** Env-var-driven feature gates — filter what editors see and which public routes are active per deployment. Super_admin always sees everything.

### Implementation

**`src/shared/featureFlags.js`** — reads `FEATURE_*` env vars at startup, exports `flags` object and `isEnabled(flag)` helper.

**Flag registry** (all default `true` when absent — opt-out, safe for existing deploys):

| Flag | Controls |
|---|---|
| `FEATURE_BLOCK_HERO` | Hero block in page builder |
| `FEATURE_BLOCK_RICH_TEXT` | Rich text block |
| `FEATURE_BLOCK_ENCART_PRINCIPAL` | Encart principal block |
| `FEATURE_BLOCK_ACCROCHE` | Accroche block |
| `FEATURE_BLOCK_PIN_GRID` | Pin grid block |
| `FEATURE_BLOCK_NUMBERED_CARDS` | Numbered cards block |
| `FEATURE_BLOCK_QUESTION_REPONSE` | FAQ block |
| `FEATURE_BLOCK_LEAD_MAGNET` | Lead magnet block |
| `FEATURE_BLOCK_CONTACT_FORM` | Contact form block |
| `FEATURE_BLOCK_SHOP_PRODUCT` | Shop product block (M5) |
| `FEATURE_BLOCK_APPOINTMENT` | Appointment booking block (M5) |
| `FEATURE_SECTION_BLOG` | Blog admin section + /blog public routes |
| `FEATURE_SECTION_INSTAGRAM` | Instagram Studio admin section |
| `FEATURE_SECTION_SHOP` | Shop admin section + /boutique public routes |
| `FEATURE_SECTION_APPOINTMENTS` | Appointments admin section + /rdv public routes |
| `FEATURE_PUBLIC_CONTACT` | Contact form submission endpoint |
| `FEATURE_PUBLIC_RSS` | RSS feed at /feed.xml |
| `FEATURE_PUBLIC_SITEMAP` | Sitemap at /sitemap.xml |

**Endpoints added:**
- `GET /api/admin/features` — unauthenticated, returns flags for React admin

**Middleware added:**
- `requireFeature(flag)` in `middleware/auth.js` — returns 403 for disabled features; super_admin bypasses

**Frontend:**
- `FeatureFlagsContext` — fetches flags on load, provides `isEnabled(flag)`
- `blockCatalog.ts` — each entry gains a `featureFlag` property
- `BlockPicker.tsx` — filters catalog by `isEnabled(entry.featureFlag)`
- `App.tsx` — nav links for Blog/Instagram/Shop/Appointments conditioned on flags

---

## Milestone 2 — Provider-Agnostic Hosting

**Goal:** Remove Railway lock-in; enable deployment anywhere; abstract media storage.

### Implementation

**Railway scrub:** Replace all Railway-specific error messages in `database.js` and `reset-admin-password.js` with generic provider-agnostic messages.

**`Dockerfile`** — multi-stage build:
- Stage 1: Node 22 Alpine — installs deps, builds React admin (`npm run build` in `/admin`)
- Stage 2: Node 22 Alpine — copies built assets + backend, runs `npm start`

**Storage abstraction:**

```
src/domain/media/infrastructure/
  StorageAdapter.js          interface: upload(), delete(), getUrl()
  LocalStorageAdapter.js     wraps imageOptimizer.js (current behaviour)
  ObjectStorageAdapter.js    AWS SDK v3, configurable S3_ENDPOINT
config/storage.js            factory: S3_BUCKET set → Object, else → Local
```

`UploadMedia` use case injects the adapter. Sharp processing stays in memory; the adapter handles persistence.

**Migration `003_media_src.sql`:** adds `src TEXT` column to `media` table to store full public URLs for object storage. Local adapter derives paths as before.

**S3-compatible env vars:**
```
S3_ENDPOINT=https://...       # Cloudflare R2, MinIO, DO Spaces, Backblaze B2, etc.
S3_BUCKET=my-bucket
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_URL=https://cdn...  # Base URL for serving uploaded files
S3_REGION=auto                # Optional, default: auto
```

---

## Milestone 3 — User Roles & Authorization

**Goal:** 3-tier role system for multi-user deployments. Primary use case: developer = super_admin, client = editor.

### Permission Matrix

| Capability | editor | admin | super_admin |
|---|---|---|---|
| Create/edit/publish/delete pages, articles, shop, appointments | ✓ | ✓ | ✓ |
| Media management (upload, delete) | ✓ | ✓ | ✓ |
| Block editor | flag-filtered | all | all |
| Settings (menus, branding, theme) | ✗ | ✓ | ✓ |
| User management | ✗ | ✗ | ✓ |
| Backups / system tools | ✗ | ✗ | ✓ |
| Feature flags bypass | ✗ | ✗ | ✓ |

### Implementation

**Migration `004_user_roles.sql`:**
- `role TEXT NOT NULL DEFAULT 'editor'` added to `users` table
- `email TEXT` added to `users` table

**New endpoints:**
- `GET /api/admin/auth/me` — returns `{id, username, email, role}` for authenticated user
- `GET /api/admin/users` — list users (super_admin only)
- `POST /api/admin/users` — create user (super_admin only)
- `PUT /api/admin/users/:id` — update user role/email (super_admin only)
- `DELETE /api/admin/users/:id` — delete user (super_admin only)

**Route guards:**
- `requireRole(['admin','super_admin'])` on settings PUT
- `requireRole(['super_admin'])` on user management + backup routes

**Frontend:**
- `AuthContext` — fetches `/me` on load, exposes `{user, role}`
- New `admin/src/features/users/` section — visible to super_admin only
- `App.tsx` — hides Users and Backup nav items unless `super_admin`

---

## Milestone 4 — Style Customization

**Goal:** Per-deployment visual identity without touching source code.

### Approach: Design Token Overrides

The entire design system is expressed as CSS variables in `public/css/main.css`. Overriding `:root {}` values is sufficient. No raw CSS injection (XSS surface).

### Implementation

**Migration `005_theme_tokens.sql`:** adds `theme_tokens JSONB` column to `settings` table.

**`GET /css/custom.css`** — reads `theme_tokens` from DB, emits:
```css
:root {
  --color-primary: #...;
  --color-accent: #...;
  /* ... */
}
```
Injected as `<link>` after `main.css` in all EJS layouts. Short HTTP cache, busted on settings save.

**Theme Editor tab** in `SettingsEditor.tsx` (admin+ only):
- Color pickers for: `--color-primary`, `--color-accent`, `--color-text`, `--color-bg-main`, `--color-bg-footer`, `--color-sage`
- Font family dropdowns for body and heading fonts
- Live preview panel

**Optional Phase 2:** `custom_css` TEXT field + CodeMirror editor, with server-side sanitization (strip `<script>`, `javascript:`).

---

## Milestone 5A — Simple Shop

**Goal:** Product catalogue + Stripe Checkout. No inventory.

### Tables (`006_shop.sql`)

**`products`**: `id, name, slug, description, price_cents, currency, images JSONB, published, created_at`

**`orders`**: `id, stripe_session_id, status (pending/paid/fulfilled/cancelled), customer_email, line_items JSONB, total_cents, created_at`

### Implementation

**Domain:** `src/domain/shop/` — `ProductRepository`, `OrderRepository`, use cases `ListProducts`, `GetProduct`, `CreateOrder`, `FulfillOrder`

**Admin:** Products section (list + editor with image picker) + Orders dashboard with status management — accessible to editor role and above.

**Public routes:**
- `GET /boutique` — product listing
- `GET /boutique/:slug` — product detail
- `POST /api/checkout/create-session` — creates Stripe Checkout session
- `POST /api/webhooks/stripe` — verifies signature, marks order paid, sends confirmation email

**Block type:** `shop_product` — embed a product on any page; gated by `FEATURE_BLOCK_SHOP_PRODUCT`

**Feature flag:** `FEATURE_SECTION_SHOP` gates admin section + `/boutique` routes

**New env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`

---

## Milestone 5B — Appointment Booking

**Goal:** Service catalogue, weekly slot availability, booking form, email confirmation.

### Tables (`007_appointments.sql`)

**`services`**: `id, name, description, duration_min, price_cents, published`

**`availability`**: `id, day_of_week (0–6), start_time, end_time, slot_duration_min`

**`bookings`**: `id, service_id, start_at, end_at, customer_name, customer_email, customer_phone, status (pending/confirmed/cancelled), notes, created_at`

### Implementation

**Domain:** `src/domain/appointments/` — repositories + use cases

**Admin:** Services editor + weekly availability grid + bookings list with status management — accessible to editor role and above.

**Public routes:**
- `GET /rdv` — service picker → slot picker → booking form
- `GET /api/appointments/slots?service_id=&date=` — returns available slots
- `POST /api/appointments/book` — creates booking, sends confirmation email

**Block type:** `appointment_booking` — embed the booking widget on any page; gated by `FEATURE_BLOCK_APPOINTMENT`

**Feature flag:** `FEATURE_SECTION_APPOINTMENTS` gates admin section + `/rdv` routes

---

## Scope Boundaries

- **Multi-tenancy:** Permanently out of scope. One deploy = one site.
- **Feature flags:** Env vars only. No runtime toggle UI. Changing flags requires redeploy. Intentional.
- **Shop:** No inventory tracking, no discount codes, no multi-currency in MVP.
- **Appointments:** No Google Calendar sync, no iCal export in MVP.
- **Deferred:** Content scheduling, draft autosave, audit log, headless API mode, i18n.
