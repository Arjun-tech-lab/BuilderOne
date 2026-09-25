# BuilderOne

Two-sided marketplace connecting homeowners with residential construction companies in and around Bengaluru.

> BuilderOne is a **platform**, not a construction company. We help homeowners discover builders, compare proposals, and choose smarter.

**Tagline:** Build better. Choose smarter.

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL-ready (SQLite for local demo by default) |
| Auth | JWT + bcrypt password hashing |

---

## Project structure

```text
BuilderOne/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Routes (landing, auth, dashboards, onboarding)
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── services/
│       └── types/
├── backend/           # FastAPI app
│   └── app/
│       ├── api/
│       ├── core/
│       ├── db/
│       ├── models/
│       ├── schemas/
│       ├── services/  # matching_service.py, domain, storage
│       └── repositories/
├── docs/architecture.md
└── .env.example
```

---

## Quick start (local demo)

### 1. Backend

```bash
cd backend

# Option A — use vendor packages already installable via pip --target
python3 -m pip install --target vendor -r requirements.txt

# Option B — virtualenv (recommended once sandbox allows)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy env (SQLite by default for instant demo)
cp ../.env.example .env
# Or use the included backend/.env

# Run API (from backend/)
PYTHONPATH=vendor:. python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

---

## Environment variables

See `.env.example`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLAlchemy URL — PostgreSQL or SQLite |
| `JWT_SECRET` | Signing key for access tokens |
| `CORS_ORIGINS` | Allowed frontend origins |
| `NEXT_PUBLIC_API_URL` | Frontend → API base URL |
| `STORAGE_*` | Image upload provider (local / future S3) |
| `SEED_ON_STARTUP` | Auto-seed demo data |

### Connect PostgreSQL later

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:5432/builderone
SEED_ON_STARTUP=false
```

Then run migrations / create tables:

```bash
cd backend
PYTHONPATH=vendor:. alembic upgrade head   # when revisions exist
# or rely on create_all + seed:
PYTHONPATH=vendor:. python -m scripts.seed --reset
```

No credentials are hardcoded in source.

---

## Database seeding

```bash
cd backend
PYTHONPATH=vendor:. python -m scripts.seed
# Wipe and reseed:
PYTHONPATH=vendor:. python -m scripts.seed --reset
```

With `SEED_ON_STARTUP=true`, seed also runs when the API starts.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@demo.builderone.in` | `Demo@1234` |
| Builder (Whitefield) | `whitefield@demo.builderone.in` | `Demo@1234` |
| Other builders | `sarjapur@…`, `hsr@…`, `ecity@…`, etc. | `Demo@1234` |

Demo includes 8 Bengaluru builders, a Whitefield customer project, and 3 sample quotations for comparison.

---

## Investor demo flow

1. Open BuilderOne → **I want to build a home**
2. Sign up / login as customer (or use demo customer)
3. Complete onboarding (Whitefield, Independent House, 2400/2000 sq ft, G+1, ₹45–55L, 9–12 months, Turnkey + Solar)
4. See recommended builders with match %
5. Open a builder profile → portfolio
6. Login as builder (`whitefield@demo.builderone.in`)
7. Open project opportunity → submit quote (e.g. ₹49L)
8. Return as customer → **Compare quotations** → Shortlist

---

## Matching algorithm

Deterministic scoring in `backend/app/services/matching_service.py` (max 100):

| Factor | Points |
|--------|--------|
| Location | 0–25 |
| Budget | 0–20 |
| Property type | 0–20 |
| Built-up size | 0–15 |
| Timeline | 0–10 |
| Service requirements | 0–10 |

Designed to be replaceable with an AI/ML engine without changing API contracts.

---

## API overview

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET/PUT /api/customer/profile
POST/GET/PUT /api/projects[/:id]
GET  /api/projects/:id/recommended-builders
GET  /api/projects/:id/quotes
POST /api/projects/:id/shortlist

POST/GET/PUT /api/builders/profile
GET  /api/builders/:id
GET  /api/builders/projects/recommended
GET  /api/builders/projects/:id
POST /api/builders/projects/:id/quotes
GET  /api/builders/quotes
POST /api/builders/upload
```

---

## Future extension points

Architecture placeholders (not built in MVP): Admin portal, tenders / reverse auctions, messaging, payments/escrow, contracts, reviews, AI recommendations, verification workflows. See `docs/architecture.md`.

---

## License

Private MVP — all rights reserved.
