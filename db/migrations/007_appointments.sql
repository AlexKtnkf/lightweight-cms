-- ============================================
-- Appointments: services, availability, bookings
-- ============================================

CREATE TABLE IF NOT EXISTS appointment_services (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  duration_min  INTEGER NOT NULL DEFAULT 60,
  price         INTEGER, -- in cents, optional
  currency      TEXT NOT NULL DEFAULT 'EUR',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment_availability (
  id            SERIAL PRIMARY KEY,
  weekday       INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sunday
  start_time    TEXT NOT NULL, -- HH:MM
  end_time      TEXT NOT NULL, -- HH:MM
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id            SERIAL PRIMARY KEY,
  service_id    INTEGER REFERENCES appointment_services(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending|confirmed|cancelled|done
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_at      TIMESTAMP NOT NULL,
  end_at        TIMESTAMP NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS appointments_start_idx ON appointments(start_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS appointments_email_idx ON appointments(customer_email);
