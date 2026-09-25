# BuilderOne Architecture

## Overview

BuilderOne is a two-sided marketplace:

```text
Homeowner → Project → Matching → Builder profiles → Quotes → Comparison → Shortlist
Builder    → Profile → Opportunities → Quote submission → Await decision
```

The platform does **not** provide construction services; it connects parties.

---

## Frontend

- **Next.js App Router** with route groups for marketing, customer, and builder experiences
- **TypeScript** domain types in `src/types`
- **API client** (`src/lib/api.ts`) — JWT bearer token from `localStorage`
- **Auth context** + role checks on dashboard/onboarding pages
- **Design system** — Fraunces (display) + Plus Jakarta Sans, teal brand accent, light surfaces

### Key routes

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/get-started` | Role selection |
| `/signup`, `/login` | Auth |
| `/customer/onboarding` | 6-step project wizard |
| `/customer/dashboard` | Project + recommendations |
| `/customer/projects/:id/quotes` | Quote comparison |
| `/builders/:id` | Public builder profile |
| `/builder/onboarding` | 6-step company profile |
| `/builder/dashboard` | Opportunities |
| `/builder/projects[/:id]` | Browse / quote |

---

## Backend

Layered FastAPI app:

```text
api/ → services/ → models (SQLAlchemy) → PostgreSQL (or SQLite)
         ↑
   matching_service.py  (isolated scoring)
   storage.py           (local / future S3)
```

- **Pydantic** request/response validation
- **JWT** access tokens; bcrypt password hashes
- **Role guards** via `deps.require_customer` / `require_builder`
- ORM parameterisation for SQL injection protection
- CORS from env; secrets only via env

---

## Database

PostgreSQL-ready SQLAlchemy models:

- `users`, `customer_profiles`, `builder_profiles`
- `builder_service_areas`, `builder_services`, `builder_project_types`
- `portfolio_projects`, `portfolio_images`
- `construction_projects`, `project_requirements`
- `quotes`, `builder_shortlists`

Indexes on email, phone, builder city/verification, project location/status, quote FKs.

Local MVP defaults to SQLite (`sqlite:///./builderone.db`). Switch with:

```env
DATABASE_URL=postgresql+psycopg2://...
```

Alembic scaffold lives in `backend/migrations/` for production migrations.

---

## Authentication

1. Register with role `CUSTOMER` or `BUILDER`
2. Password hashed with bcrypt
3. JWT returned (`access_token`)
4. Frontend stores token; sends `Authorization: Bearer …`
5. Logout is client-side token clear (+ noop API)

Future: `ADMIN` role for verification portal.

---

## Matching engine

`MatchingService.score(project, builder) -> int (0–100)`

Pure function — no DB I/O inside the scorer. Swap implementation later for ML while keeping `rank_builders` / `rank_projects` API.

---

## Quote flow

1. Customer project status: `DRAFT → OPEN → RECEIVING_QUOTES → QUOTES_AVAILABLE → SHORTLISTED → BUILDER_SELECTED`
2. Builder submits quote (`SUBMITTED`); customer view marks `VIEWED`
3. Customer shortlist → quote `SHORTLISTED` (+ shortlist row)
4. Acceptance records selection only — no contracts/payments in MVP

---

## Future tender / bidding architecture

Quotes can evolve into competitive bids:

```text
Tender (project_id, deadline, status)
TenderParticipant (tender_id, builder_id)
Bid (tender_id, builder_id, amount, timestamp)
```

MVP quotations stay the primary mechanism; schema comments mark extension points.

---

## Storage

`StorageBackend` interface:

- `local` — filesystem under `STORAGE_LOCAL_PATH`, served at `/uploads`
- `s3` — stub ready for boto3

Portfolio images in seed/demo use public Unsplash URLs.
