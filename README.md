# Transaction Dashboard API

Production-ready NestJS backend for a transaction dashboard: receivers, currencies, transactions, real-time updates via WebSocket, Redis caching, and Swagger documentation.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [WebSocket](#websocket)
- [Docker](#docker)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Creating a Transaction (Quick Guide)](#creating-a-transaction-quick-guide)

---

## Tech Stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| **Framework**     | NestJS (TypeScript)                                 |
| **Database**      | TypeORM + Supabase PostgreSQL                       |
| **Cache**         | Redis (ioredis) — supports Upstash (TLS + password) |
| **Real-time**     | Socket.IO (`@nestjs/platform-socket.io`)            |
| **API Docs**      | Swagger/OpenAPI at `/api/docs`                      |
| **Validation**    | class-validator, class-transformer                  |
| **Rate limiting** | @nestjs/throttler                                   |
| **Health**        | @nestjs/terminus                                    |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (or npm / yarn)
- **PostgreSQL** — use [Supabase](https://supabase.com) or your own instance
- **Redis** — local (Docker) or [Upstash](https://upstash.com) for serverless Redis

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Hashthink-server
pnpm install
```

Or with npm:

```bash
npm install
```

### 2. Environment

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your database, Redis, and (optional) Supabase keys. See [Environment Variables](#environment-variables) below.

### 3. Database

- **Supabase:** Create a project, get the connection details from **Settings → Database** (use the **Session pooler** connection string for `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`). Set `DB_SSL=true` for Supabase.
- **Optional:** Run the initial schema migration if you use SQL migrations:
  ```bash
  pnpm run migration:run
  ```
  Or rely on TypeORM `synchronize: true` in development (already configured in app).

### 4. Redis

**Option A — Local (Docker)**

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

Use in `.env`: `REDIS_HOST=localhost`, `REDIS_PORT=6379`, leave `REDIS_PASSWORD` empty, `REDIS_TLS=false`.

**Option B — Upstash**

Create a Redis database at [Upstash](https://upstash.com), then set in `.env`:

- `REDIS_HOST=<your-endpoint>.upstash.io`
- `REDIS_PORT=6379`
- `REDIS_PASSWORD=<your-password>`
- `REDIS_TLS=true`

### 5. Seed (optional)

After the app has run at least once (so tables exist), seed receivers and currencies:

```bash
pnpm run seed
```

---

## Environment Variables

| Variable                                                         | Description                              | Default       |
| ---------------------------------------------------------------- | ---------------------------------------- | ------------- |
| `PORT`                                                           | HTTP server port                         | `3000`        |
| `NODE_ENV`                                                       | `development` / `production` / `staging` | `development` |
| **Database**                                                     |                                          |               |
| `DB_HOST`                                                        | PostgreSQL host                          | `localhost`   |
| `DB_PORT`                                                        | PostgreSQL port                          | `5432`        |
| `DB_USERNAME`                                                    | Database user                            | `postgres`    |
| `DB_PASSWORD`                                                    | Database password                        | —             |
| `DB_NAME`                                                        | Database name                            | —             |
| `DB_SSL`                                                         | Use SSL for DB (`true`/`false`)          | —             |
| **Redis**                                                        |                                          |               |
| `REDIS_HOST`                                                     | Redis host                               | `localhost`   |
| `REDIS_PORT`                                                     | Redis port                               | `6379`        |
| `REDIS_PASSWORD`                                                 | Redis password (required for Upstash)    | —             |
| `REDIS_TLS`                                                      | Use TLS for Redis (`true`/`false`)       | —             |
| **WebSocket**                                                    |                                          |               |
| `WS_PORT`                                                        | WebSocket port                           | `3001`        |
| **JWT**                                                          |                                          |               |
| `JWT_SECRET`                                                     | Secret for JWT (if used)                 | `supersecret` |
| `JWT_EXPIRES_IN`                                                 | Token expiry                             | `1d`          |
| **Supabase**                                                     | Optional, for Supabase client features   | —             |
| `SUPABASE_URL`, `SUPABASE_PROJECT_ID`, `SUPABASE_ANON_KEY`, etc. |                                          | —             |

See `.env.example` for a full template.

---

## Running the App

```bash
pnpm run start:dev
```

Or:

```bash
npm run start:dev
```

- **API base:** `http://localhost:<PORT>` (e.g. `http://localhost:5026` if `PORT=5026`)
- **Root:** `GET /` — returns API info and links to docs and health
- **Swagger:** `http://localhost:<PORT>/api/docs`
- **Health:** `http://localhost:<PORT>/health`

---

## API Reference

### Endpoints

| Method           | Path                         | Description                               |
| ---------------- | ---------------------------- | ----------------------------------------- |
| `GET`            | `/`                          | API info and links (docs, health)         |
| `GET`            | `/health`                    | Health check (database ping)              |
| **Receivers**    |                              |                                           |
| `GET`            | `/receivers`                 | List all receivers                        |
| `GET`            | `/receivers/:id`             | Get receiver by UUID                      |
| **Currencies**   |                              |                                           |
| `GET`            | `/currencies`                | List currencies (USD, IRR, INR)           |
| **Transactions** |                              |                                           |
| `GET`            | `/transactions`              | List transactions (paginated, filterable) |
| `POST`           | `/transactions`              | Create a transaction                      |
| `PATCH`          | `/transactions/:id/status`   | Update transaction status                 |
| `GET`            | `/transactions/:id/download` | Download transaction as `.txt` file       |

### GET /transactions — Query parameters

| Parameter    | Type   | Description                           |
| ------------ | ------ | ------------------------------------- |
| `page`       | number | Page number (default: `1`)            |
| `limit`      | number | Items per page, 1–100 (default: `10`) |
| `currency`   | enum   | `USD` \| `IRR` \| `INR`               |
| `receiverId` | UUID   | Filter by receiver                    |
| `to`         | string | Search in recipient `to` field        |
| `status`     | enum   | `pending` \| `approved`               |
| `search`     | string | General search (to, status)           |

**Response:** `{ data: Transaction[], meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }`

### POST /transactions — Request body

| Field             | Type   | Required | Description                                        |
| ----------------- | ------ | -------- | -------------------------------------------------- |
| `referenceNumber` | string | Yes      | Unique reference (e.g. `REF-2024-001`)             |
| `receiverId`      | UUID   | Yes      | ID of an existing receiver (from `GET /receivers`) |
| `to`              | string | Yes      | Recipient identifier (e.g. email)                  |
| `amount`          | number | Yes      | Amount (≥ 0)                                       |
| `currency`        | enum   | Yes      | `USD` \| `IRR` \| `INR`                            |
| `paymentMethod`   | string | Yes      | e.g. Bank Transfer, Wallet, Card, UPI              |

**Example:**

```json
{
  "referenceNumber": "REF-2024-001",
  "receiverId": "cdcdb752-006a-4b13-b487-0f87ea819db3",
  "to": "alice@example.com",
  "amount": 100.5,
  "currency": "USD",
  "paymentMethod": "Bank Transfer"
}
```

- **201** — Transaction created (returns the new transaction).
- **400** — Validation error, duplicate `referenceNumber`, or receiver not found.

### PATCH /transactions/:id/status — Request body

```json
{ "status": "approved" }
```

or `"pending"`. Status must be one of `pending` \| `approved`.

---

## WebSocket

- **Namespace:** Socket.IO on the same server (e.g. `http://localhost:<PORT>`).
- **Events emitted by server:**
  - `transaction.created` — when a new transaction is created (e.g. by background job or API).
  - `transaction.updated` — when a transaction is updated (e.g. status change).

A background job creates a random transaction periodically and emits `transaction.created` for live UI updates.

---

## Docker

**Build and run with Docker Compose:**

```bash
# Set DB_* and other env vars in .env, then:
docker-compose up -d
```

- API: `http://localhost:3000` (override with `PORT` in env).
- Redis: `localhost:6379` (service name `redis` inside the stack).

**Docker Compose** uses `REDIS_HOST=redis` for the API service. For production, add `REDIS_PASSWORD` and `REDIS_TLS` if using Upstash or a secured Redis.

---

## Scripts

| Script                        | Description                       |
| ----------------------------- | --------------------------------- |
| `pnpm run build`              | Build for production              |
| `pnpm run start`              | Run production build              |
| `pnpm run start:dev`          | Run in watch mode (development)   |
| `pnpm run start:debug`        | Run with debug (watch)            |
| `pnpm run start:prod`         | Run `node dist/main` (production) |
| `pnpm run seed`               | Seed receivers and currencies     |
| `pnpm run migration:generate` | Generate TypeORM migration        |
| `pnpm run migration:run`      | Run pending migrations            |

---

## Project Structure

```
src/
├── app.module.ts          # Root module
├── app.controller.ts      # GET / (API info)
├── main.ts                # Bootstrap, Swagger, CORS, validation
├── health.controller.ts  # GET /health
├── config/
│   ├── configuration.ts   # Env-based config
│   ├── typeorm.config.ts  # TypeORM CLI config
│   └── seed.ts            # Seed script
├── common/
│   ├── dto/               # PaginationDto, etc.
│   ├── enums/             # CurrencyEnum, StatusEnum
│   ├── filters/           # AllExceptionsFilter
│   └── interceptors/      # LoggingInterceptor
└── modules/
    ├── currency/          # Currencies CRUD
    ├── receivers/         # Receivers CRUD
    ├── transactions/      # Transactions CRUD, filters, download
    ├── redis/             # Redis client and caching
    ├── queue/             # Transaction simulation (background job)
    └── websocket/         # Socket.IO gateway (transaction events)
```

---

## Creating a Transaction (Quick Guide)

1. **Get a receiver ID:**  
   `GET /receivers` → copy an `id` from the response (e.g. `cdcdb752-006a-4b13-b487-0f87ea819db3`).

2. **Create the transaction:**  
   `POST /transactions` with JSON body:
   - `receiverId` — the UUID from step 1.
   - `referenceNumber` — **unique** every time (e.g. `REF-2024-001`, `REF-2024-002`).
   - `to`, `amount`, `currency`, `paymentMethod` — as required.

3. If you get **400 "Receiver with ID … not found"**, the `receiverId` is not in the database — use an ID from `GET /receivers`.  
   If you get **400** for duplicate reference, change `referenceNumber` and try again.

---

## License

MIT (or as specified in the repository.)
