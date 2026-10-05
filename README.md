# TeleBolt ⚡

> Compare Indian telecom prepaid plans by what they actually cost you per year — not how operators market them.

Most telecom apps show you ₹199, ₹299, ₹749. TeleBolt shows you ₹3,588/yr, ₹4,788/yr, ₹8,988/yr — along with total yearly data, cost-per-GB, and OTT benefits across Jio, Airtel, Vi, and BSNL. Make the decision with real numbers.

---

## What Problem This Solves

Indian telecom operators market plans by recharge price and validity. A ₹199 plan valid for 24 days and a ₹239 plan valid for 28 days look comparable — but they're not once you annualize them.

TeleBolt normalizes every plan into a 365-day model so you can compare:

- **Yearly cost** — actual money spent per year across recharges
- **Yearly data** — total GB received, not just daily quota
- **Cost per GB** — the only metric that truly measures data value
- **OTT value** — which operator bundles subscriptions worth keeping

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Clone & Install

```bash
git clone https://github.com/HarshCh0uhan/TeleBolt.git
cd TeleBolt

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../Frontend && npm install
```

### Environment Setup

Create a `.env` file in the `Backend/` directory:

```env
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/telebolt

JWT_SECRET=your_jwt_secret_here
ADMIN_SECRET_KEY=your_admin_secret_here
ADMIN_EMAIL=admin@yourdomain.com

EMAIL=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

FRONTEND_URL=http://localhost:5173

# ── Plan sync (all optional) ─────────────────────────────────────────────
# Override the Vi catalogue page that is scraped
# VI_PLANS_URL=https://www.myvi.in/prepaid/unlimited-calls-and-data-plans

# BSNL's tariff API needs a browser session. Without it the source is skipped
# (and reported as skipped) instead of failing.
# BSNL_PROXY_COOKIE=
# BSNL_EXTRA_HEADERS={"x-api-key":"..."}
# BSNL_CIRCLE=MH
# BSNL_SVCTYPE=prepaid

# Daily schedule (cron + timezone) and per-run safety cap for new plans
# SYNC_CRON=0 3 * * *
# SYNC_TIMEZONE=Asia/Kolkata
# SYNC_MAX_NEW_PER_RUN=200
```

### Run Locally

```bash
# Start backend (from /Backend)
npm run dev

# Start frontend (from /Frontend)
npm run dev
```

Backend runs on `http://localhost:3000`, frontend on `http://localhost:5173`.

---

## API Endpoints

**Public:**

```
GET  /api/plans                    - List plans with filters
GET  /api/plans/rankings           - Active plans ranked by cost per GB
GET  /api/plans/compare            - Compare 2-3 plans side by side
GET  /api/plans/:id                - Single plan (yearly figures included)
GET  /api/plans/price-history/:id  - Price change history for a plan
```

**Authenticated users:**

```
GET    /api/auth/me                - Current session user
PATCH  /api/auth/me                - Update username / email / password
GET    /api/auth/favorites         - Saved plans for the session user
POST   /api/auth/favorites/:planId - Save / unsave a plan
DELETE /api/auth/favorites/:planId - Remove a saved plan
POST   /api/plans/submit           - Suggest a plan for admin review
```

**Admin (requires an admin session):**

```
GET    /api/admin/plans                  - All plans, including inactive
POST   /api/admin/plans                  - Create plan
PUT    /api/admin/plans/:id              - Update plan
DELETE /api/admin/plans/:id              - Delete plan
POST   /api/admin/upload-csv             - Bulk import via CSV
GET    /api/admin/detected               - Detected changes queue
POST   /api/admin/approve/:id            - Approve a change or a new plan
POST   /api/admin/reject/:id             - Reject a change
GET    /api/admin/stats                  - Dashboard statistics
GET    /api/admin/audit-logs             - Audit trail (filter + paginate)
GET    /api/admin/submissions            - Community plan submissions
POST   /api/admin/submissions/:id/approve - Approve submission (creates the plan)
POST   /api/admin/submissions/:id/reject  - Reject submission
GET    /api/admin/plan-sync/sources      - Configured plan sources
POST   /api/admin/plan-sync/run          - Run the plan sync on demand
GET    /api/admin/plan-sync/runs         - Plan sync history
```

---

## Features

### For Users

- **Plan comparison** — pick 2 or 3 plans on the plans dashboard and compare them side by side
  (minimum 2, maximum 3 enforced in the UI and on the API). Selection persists across refreshes.
- **Rankings** — a cost-per-GB leaderboard of every active plan with a top-3 podium, filterable by
  operator and category.
- **Yearly normalization** — yearly cost, yearly data and cost per GB on every card and detail page.
- **Network coverage** — check 5G/4G/3G/2G coverage per carrier on an embedded map.
- **Filters** — operator, price, validity, data allowance, category and OTT benefits.
- **Accounts** — register, log in, update your profile and change your password.
- **Saved plans** — bookmark plans from the catalog or a plan detail page and revisit them from your profile.
- **Suggest a plan** — submit a missing plan; an admin reviews it before it goes live.

### For Admins

- **Dashboard** — live catalog stats, pending review count, recent audit activity and per-operator split.
- **Plans** — create, edit, delete (with confirmation), search and filter the catalog.
- **Detected changes** — review queue for everything the sync service finds, plus a **Run sync now** button,
  the last run's per-source report, and bulk actions (**Add all N new plans**, **Reject all N pending changes**)
  so a first sync of ~50 proposals is one click instead of fifty.
- **Pending reviews** — one queue for detected changes *and* community submissions.
- **Contributions** — submissions by status plus a per-contributor summary.
- **Analytics** — operator/category distribution, community stats and recent activity.
- **Audit logs** — a timestamped trail of every admin action, filterable by action and entity.
- **Admin profile** — view and update the admin's own details and password.

---

## Plan Data Automation

TeleBolt pulls operator plans automatically and **never writes directly to the live catalog**. Every
difference becomes a proposal in the detected-changes queue, and an admin approves or rejects it.

```
daily cron (03:00 IST) ─┐
admin "Run sync now" ───┼─→ source adapters ─→ normalise ─→ diff against Plans
                        │                                        │
                        │                                        ▼
                        └───────────────────────────  DetectedChange (Pending)
                                                                 │
                                                     admin approves / rejects
                                                                 │
                                          Plans updated + PriceHistory + AuditLog
```

### Sources

| Source | Status | How it works |
|---|---|---|
| **Vi** (`vi-sync`) | ✅ live | `myvi.in` renders its whole prepaid catalogue into the Next.js flight payload, so `self.__next_f.push([1,"…"])` chunks contain the plan list as JSON. Each record carries `ITEM_ID`, `UNIT_COST`, `VALIDITY_ATTR`, `DATA_LINE_1`, `DATAUSAGE_ATTR` and `SMS_LINE_1`. A dry run currently reads **88 usable plans** in ~1.5 s. |
| **BSNL** (`bsnl-sync`) | ⚠️ needs a session | BSNL serves tariffs through its own Next.js proxy: `POST /api/bsnl-proxy/myBsnlApp/rest/cofetchtariffnew` with `{ svctype, circle }`. It answers **`401 Authentication required`** without a signed-in session (and `403 "Direct API access is strictly prohibited."` when hit directly). Set `BSNL_PROXY_COOKIE` to enable it. |

**Enabling BSNL:** the request only fires on the **pricing-plans page**, not the recharge page (which
demands a mobile number and a captcha first) and not `portal.bsnl.in`:

1. Open `https://bsnl.co.in/en/pricing-plans/prepaid`
2. DevTools → Network → filter **Fetch/XHR**, then change the circle dropdown so the request appears
3. Right-click the `cofetchtariffnew` request → **Copy as cURL**
4. Put its `Cookie` header in `BSNL_PROXY_COOKIE`, and any `x-*` token header it carries into
   `BSNL_EXTRA_HEADERS` as JSON, e.g. `BSNL_EXTRA_HEADERS={"x-api-key":"abc123"}`

Until then the source reports `Skipped` with that instruction — it never fails the run. Note that
BSNL's proxy bodies are AES-encrypted with a key from their bundle, so this route can break whenever
they rotate the key or the session.

### What it detects

- **New plans** → a `NewPlan` proposal carrying the full snapshot
- **Price changes** → `Price` (and a `PriceHistory` row once approved)
- **Validity changes** → `ValidityDays`
- **Data allowance changes** → `DailyData` / `TotalData`
- **SMS changes** → `Sms`

Matching has two tiers. An unchanged price keeps the same upstream id, so validity/data/SMS changes
are matched exactly. A price change gives the pack a **new** id, so the fallback requires an
*identical bundle* — same operator, same daily data, same total data, same validity — before it is
reported as a "Price" proposal.

That second tier is deliberately strict. A looser version matched on data allowance alone and paired
a 365-day 10 GB pack with a 28-day one, reporting a ₹1599 plan as "changed" to ₹348. Anything that is
neither an exact id nor an identical bundle becomes a **new plan**, and packs that disappear upstream
are counted as `stale` in the run report rather than silently rewritten.

### Commands

```bash
# Fetch and normalise from the live sites (no database involved)
cd Backend && node scripts/plan-sync-dry-run.mjs
node scripts/plan-sync-dry-run.mjs vi-sync       # one source only

# Run the real matcher and diff against the database, writing nothing
node scripts/plan-sync-dry-run.mjs --db

# Source unit tests (normalisers, matching rules, schema invariants)
cd Backend && node test/planSources.test.mjs
```

### Safety and legal notes

- Requests run once a day with a browser-like user agent; nothing is polled aggressively.
- New plans per run are capped by `SYNC_MAX_NEW_PER_RUN` (default 50) so the queue cannot flood, and
  identical pending proposals are never raised twice.
- Operator terms of service generally prohibit automated scraping. This is fine for a low-volume
  personal project; a public product should move to an official/partner API.
- Scrapers break when sites change. That is why the dry-run command exists — run it when a source
  reports `Failed`, then update the adapter.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 + React Router + Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie) + bcrypt |
| Email | Nodemailer |
| Scheduling | node-cron (weekly reminder + daily plan sync) |
| CSV Import | multer + csv-parser |
| Tests | Node's built-in `node:test` |
| Frontend deploy | Vercel |
| Backend deploy | Render |
| Database hosting | MongoDB Atlas (free tier) |

---

## Project Structure

```
TeleBolt/
├── Backend/
│   ├── app.js
│   ├── scripts/
│   │   └── plan-sync-dry-run.mjs        # run sources without touching the DB
│   ├── test/
│   │   ├── fixtures/                    # Vi records + synthetic BSNL rows
│   │   └── planSources.test.mjs
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/                      # Plans, DetectedChange, PlanSyncRun, AuditLog, …
│       ├── routes/
│       ├── services/
│       │   ├── planSources/             # vi.source.js, bsnl.source.js, normalize.js
│       │   ├── planSync.service.js      # fetch → normalise → diff → propose
│       │   ├── scheduler.service.js     # weekly reminder + daily sync
│       │   ├── audit.service.js
│       │   └── email.service.js
│       └── utils/
│
├── Frontend/
│   └── src/
│       ├── api/
│       ├── components/                  # PlanCard, CompareBar, admin/* …
│       ├── context/                     # Auth, Compare, AdminStats
│       ├── layouts/
│       ├── pages/                       # Home, Compare, Rankings, Profile, admin/*
│       └── utils/
│
└── README.md
```

---

## Development Workflow

Every change ships the same way:

1. Branch off `main` (`feature/…`, `fix/…`).
2. Make the change and verify it (`npm run build` for the frontend, `node --check` +
   `node test/planSources.test.mjs` for the backend).
3. Commit, push, open a pull request, and merge it into `main`.
4. **Update this README as part of every merge** so the documented features, endpoints and
   environment variables always match `main`.

---

## Roadmap

**V1 — MVP (done)**
Plan comparison with yearly normalization, cost-per-GB rankings, budget/operator/OTT filtering,
admin dashboard, CSV import, price history, JWT auth.

**V2 — Automation & community (in progress)**
Daily automated Vi + BSNL plan sync into the detected-changes queue ✅, audit logging ✅,
community plan submissions with a moderation queue ✅, contributor tracking ✅.
Still open: duplicate detection, trust scoring, enabling BSNL with a session cookie.

**V3 — Platform (planned)**
Advanced trust algorithms, contributor reputation and badges, spam detection, smart plan
recommendations, AI-assisted comparison insights, React Native app.

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

All tiers used are free. The project is designed to run at zero cost during MVP.

---

## License

MIT
