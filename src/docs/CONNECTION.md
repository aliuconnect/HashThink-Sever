# How to connect: Supabase (PostgreSQL) and Redis

If you see **ENOTFOUND db.xxx.supabase.co** or **Redis ECONNREFUSED**, follow these steps.

---

## 1. Fix Supabase (PostgreSQL) – `ENOTFOUND db.xzvtncaxyuomloyxfgfv.supabase.co`

This usually means the database host cannot be resolved (project paused, DNS, or IPv4/IPv6).

### Quick fix: Use Session pooler (recommended if ENOTFOUND persists)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Settings** → **Database**.
2. Find **Connection pooling** → **Session mode** (port 5432).
3. Copy the connection string or note the **host** (e.g. `aws-0-ap-southeast-1.pooler.supabase.com`).
4. In `.env` set:
   - `DB_HOST=` that pooler host (e.g. `aws-0-ap-southeast-1.pooler.supabase.com`)
   - `DB_PORT=5432`
   - `DB_USERNAME=postgres.xzvtncaxyuomloyxfgfv` (for pooler, username is often `postgres.<project-ref>`)
   - `DB_PASSWORD=Hashthink123a`
   - `DB_NAME=postgres`
   - `DB_SSL=true`
5. Restart: `pnpm run start:dev`

### Alternative: Try IPv4-first DNS

If your network has IPv6 issues, run the app with IPv4 preferred:

```bash
set NODE_OPTIONS=--dns-result-order=ipv4first
pnpm run start:dev
```

(PowerShell: `$env:NODE_OPTIONS="--dns-result-order=ipv4first"; pnpm run start:dev`)

### Step 1: Open your project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **Hashthink** project (`xzvtncaxyuomloyxfgfv`).

### Step 2: Restore if paused

- If the project shows **Paused**, click **Restore project** and wait until it is running.
- Paused projects do not resolve `db.xxx.supabase.co`.

### Step 3: Get the correct database host and port

1. In the project, go to **Settings** (gear) → **Database**.
2. Under **Connection string** / **Connection info**, choose **URI** or **Session pooler** (recommended for apps).
3. Copy the **host** and **port** from that string:
   - **Direct:** host = `db.xzvtncaxyuomloyxfgfv.supabase.co`, port = `5432`.
   - **Pooler (Session):** host = `aws-0-<region>.pooler.supabase.com` (e.g. `aws-0-ap-southeast-1.pooler.supabase.com`), port = `5432` or `6543`.

### Step 4: Update `.env`

Set these from the values you copied (use the exact host and port from the dashboard):

```env
DB_HOST=<host from dashboard, e.g. db.xzvtncaxyuomloyxfgfv.supabase.co or aws-0-xx.pooler.supabase.com>
DB_PORT=5432
# or 6543 if you use Transaction pooler
DB_USERNAME=postgres
DB_PASSWORD=Hashthink123a
DB_NAME=postgres
DB_SSL=true
```

If the dashboard shows a **pooler** connection string with a different user (e.g. `postgres.xzvtncaxyuomloyxfgfv`), use that for `DB_USERNAME`.

### Step 5: Restart the app

Stop the server (Ctrl+C) and run again:

```bash
pnpm run start:dev
```

---

## 2. Fix Redis – `ECONNREFUSED` on localhost:6379

The app expects a Redis server. Either run Redis locally or use a hosted Redis.

### Option A: Run Redis locally

**Windows**

- **Docker:**  
  `docker run -d --name redis -p 6379:6379 redis`
- **WSL:** Install Redis inside WSL and start it.
- **Memurai:** Install [Memurai](https://www.memurai.com/) (Redis-compatible) and start the service.

**macOS**

```bash
brew install redis
brew services start redis
```

**Linux**

```bash
sudo apt install redis-server
sudo systemctl start redis
```

Then keep in `.env`:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Option B: Use a hosted Redis (e.g. Upstash)

1. Sign up at [Upstash](https://upstash.com/) (or another Redis provider).
2. Create a Redis database and copy **host** and **port** (and password if required).
3. In `.env`:

```env
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
```

If the provider uses a password, the app’s Redis config would need to be extended to support it (currently only host and port are used).

### Restart the app

After Redis is running (or `.env` points to a working Redis), restart:

```bash
pnpm run start:dev
```

---

## Quick checklist

| Issue                          | What to do                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `ENOTFOUND db.xxx.supabase.co` | Restore project if paused → Settings → Database → copy host/port → set `DB_HOST` / `DB_PORT` in `.env` → restart. |
| `Redis ECONNREFUSED`           | Start Redis locally (Docker/WSL/Memurai) or set `REDIS_HOST`/`REDIS_PORT` to a working Redis → restart.           |

Both connections must work for the app to run without connection errors.

---

## 3. Docker

When running with **Docker Compose** (`docker-compose up`):

- **PostgreSQL (Supabase):** Use the same `.env` as above. Set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` from your Supabase project (see Section 1). The API container reads these from the host `.env`.
- **Redis:** No extra setup. The stack runs a Redis container; the API uses `REDIS_HOST=redis` and `REDIS_PORT=6379` inside the network.

Ensure `.env` exists with valid Supabase credentials, then run:

```bash
docker-compose up --build
```

The API will be at `http://localhost:3000` and Redis at `localhost:6379` (from the host).
