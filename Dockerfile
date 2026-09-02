# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build the React admin panel
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS admin-build

WORKDIR /build/admin

# Install dependencies first (layer-cached unless package files change)
COPY admin/package*.json ./
RUN npm ci

COPY admin/ ./
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Production Express server
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Non-root user for security
RUN addgroup -S cms && adduser -S cms -G cms

WORKDIR /app

# Install production deps only
COPY package*.json ./
# The admin panel is built in the admin-build stage. Avoid running the root
# postinstall here before the application source (including admin/) is copied.
RUN npm ci --omit=dev --ignore-scripts

# Copy application source
COPY . .

# Replace admin build output with pre-built assets from stage 1
COPY --from=admin-build /build/admin/dist ./public/admin

# Ensure uploads directory exists (override with a volume in production)
RUN mkdir -p ./public/uploads/images && chown -R cms:cms /app

USER cms

EXPOSE 3000

ENV NODE_ENV=production

# Run migrations then start the server
CMD ["sh", "-c", "node db/migrate.js && node server.js"]
