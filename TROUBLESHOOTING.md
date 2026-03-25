# Troubleshooting Guide

## Railway Issues

### `railway shell` exits immediately

If `railway shell` enters but immediately returns to the prompt without giving you a shell:

```bash
alexis@alexis-elitebook:~/project$ railway shell
Entering subshell with Railway variables available. Type 'exit' to exit.

alexis@alexis-elitebook:~/project$  # <- exits immediately
```

**Solutions:**

1. **Use the API endpoint** (recommended if shell is broken):
   ```bash
   # Reset admin password via HTTP
   curl -X POST "https://your-app.railway.app/api/admin/auth/reset-password" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "newPassword": "newsecurepassword123",
       "setupToken": "your-setup-token"
     }'
   ```

2. **Generate a new setup token and update Railway env vars**:
   ```bash
   # Generate new token
   openssl rand -base64 32
   
   # Set in Railway dashboard or CLI
   railway variables set SETUP_TOKEN "your-new-token-here"
   ```

3. **Check Railway login**:
   ```bash
   railway login
   railway status
   ```

---

### `ENOTFOUND postgres.railway.internal`

When running `railway run npm run reset-admin-password` from your local machine:

```
Error: getaddrinfo ENOTFOUND postgres.railway.internal
```

**Why:** Railway's internal hostname only works inside Railway's infrastructure.

**Solution:** Use `railway shell` or the HTTP API endpoint instead.

If `railway shell` isn't working, use the API:

```bash
curl -X POST "https://your-app.railway.app/api/admin/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "newPassword": "newsecurepassword123",
    "setupToken": "'$(railway variables get SETUP_TOKEN)'"
  }'
```

---

## Admin API Endpoints

### Reset Admin Password

**Endpoint:** `POST /api/admin/auth/reset-password`

Requires either:
- Valid authenticated session, OR
- Valid `setupToken` query parameter

**Request:**
```json
{
  "username": "admin",
  "newPassword": "at-least-12-characters",
  "setupToken": "optional-if-not-signed-in"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Password updated for user \"admin\""
}
```

**Response (error):**
```json
{
  "error": "Unauthorized. Use setup token during initial setup or authenticate first."
}
```

---

### Create Initial Admin (Setup)

**Endpoint:** `POST /api/admin/auth/setup-admin`

Only works if:
- No users exist in the database
- Valid `setupToken` is provided

**Request:**
```json
{
  "username": "admin",
  "password": "at-least-12-characters",
  "setupToken": "your-setup-token"
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Admin user \"admin\" created successfully",
  "userId": 1
}
```

**Response (error):**
```json
{
  "error": "Users already exist. Use password reset instead."
}
```

---

## Local Development

### Docker Postgres won't start

```bash
# Check if something is using port 5432
lsof -i :5432

# Stop existing Postgres
docker compose down

# Restart with fresh volume
docker compose up -d
```

### Database migrations fail

```bash
# Check database connectivity
docker compose exec postgres psql -U cms -d lightweight_cms -c "SELECT 1"

# Manually run migrations
npm run migrate

# Force reseed
npm run setup
```

---

## Contact Form Issues

### "Email failed to send"

1. Check SMTP credentials in `.env`:
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   
2. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password

3. Test email sending:
   ```bash
   # Check server logs for SMTP errors
   npm run dev  # Watch for "Email failed" messages
   ```

---

## Performance

### Admin panel is slow

1. **Clear browser cache:**
   - `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Clear "Cached images and files"

2. **Check admin bundle size:**
   ```bash
   npm run build:admin
   ls -lh public/admin/assets/
   ```

3. **Rebuild admin:**
   ```bash
   rm -rf admin/node_modules
   npm run build:admin
   ```

---

## Debugging

### Enable verbose logging

Set `DEBUG=*` environment variable:

```bash
DEBUG=* npm run dev
```

### Check database schema

```bash
# Read migrations
cat db/migrate.js

# List tables
psql -U cms -d lightweight_cms -c "\dt"

# Inspect table structure
psql -U cms -d lightweight_cms -c "\d pages"
```

---

## More Help

- Check `.env.example` for all available environment variables
- See `README.md` for deployment and setup instructions
- Review `db/migrations/` for database schema details
