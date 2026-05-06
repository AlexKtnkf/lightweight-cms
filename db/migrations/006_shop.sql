-- ============================================
-- Shop: products and orders tables
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  price        INTEGER NOT NULL,          -- price in cents (e.g. 2500 = €25.00)
  currency     TEXT NOT NULL DEFAULT 'EUR',
  image_media_id INTEGER REFERENCES media(id) ON DELETE SET NULL,
  stock        INTEGER,                   -- NULL = unlimited
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  stripe_price_id TEXT,                   -- Stripe Price ID (filled on sync)
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  stripe_session_id   TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | cancelled | refunded
  customer_email      TEXT,
  customer_name       TEXT,
  line_items          JSONB NOT NULL DEFAULT '[]',      -- [{ product_id, name, qty, unit_price }]
  total_amount        INTEGER NOT NULL,                  -- total in cents
  currency            TEXT NOT NULL DEFAULT 'EUR',
  shipping_address    JSONB,
  notes               TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_email_idx  ON orders(customer_email);
