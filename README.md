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

# BSNL mints its own anonymous session, so nothing is required here.
# Circles use BSNL's full names; Delhi and Tamil Nadu answer "no plans".
# BSNL_CIRCLES=Madhya Pradesh,Maharashtra,Karnataka,Gujarat
# Only needed if BSNL rotates the passphrase in their bundle:
# BSNL_PASSPHRASE=

# Jio needs no configuration either. Voucher, roaming, ISD and operator-app
# categories are skipped by default; override to keep or drop more of them.
# JIO_EXCLUDE_CATEGORIES=Top-up Voucher,International Roaming,ISD

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
GET  /api/plans/rankings/formats   - Available ranking formats (id, label, blurb)
GET  /api/plans/rankings           - Ranked plans with format, filters, OTT apps, limit
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
- **Unified Rankings & Home** — a single page with format-based ranking engine. Format chips
  (Best Value, Long Term, Entertainment, Budget, Heavy Data) re-rank the entire catalog.
  Top 3 plans form an animated podium (crown/medal/award). Remaining plans grouped into
  tiers: Strong picks / Also good / The rest. Format chips + FilterBar re-rank the entire
  filtered set. Rankings fetched server-side across the entire filtered set before pagination.
- **Yearly normalization** — yearly cost, yearly data and cost per GB on every card and detail page.
- **Network coverage** — check 5G/4G/3G/2G coverage per carrier on an embedded map.
- **Filters** — operator, price, validity, data allowance, category and OTT benefits.
- **Accounts** — register, log in, update your profile and change your password.
- **Saved plans** — bookmark plans from the catalog or a plan detail page and revisit them from your profile.
- **Suggest a plan** — submit a missing plan; an admin reviews it before it goes live.
- **Works on any screen** — the layout is mobile-first and verified down to a 360px phone and up through
  768–1024px tablets. See [Responsive layout](#responsive-layout) for the breakpoint contract.

### Responsive layout

Tailwind's breakpoints are `sm` 640px, `md` 768px, `lg` 1024px and `xl` 1280px, and everything is built
mobile-first — a base class for phones, then `sm:`/`lg:` upgrades. Two decisions are deliberate:

- **The navbar switches at `lg`, not `md`.** The full row (Coverage, Suggest a Plan,
  Profile, Logout) needs roughly 1000px, so tablets in the 768–1023px range get the menu button instead
  of a squashed row. Tapping any menu link closes the menu.
- **The admin console has one sidebar and one drawer.** The fixed sidebar appears at `lg`; below that a
  slide-over drawer with a backdrop takes over. The page itself is the only scroll container, so there is
  never a second scrollbar beside a nested one — the trap the plans dashboard fell into.

Other conventions worth keeping: tables that cannot fit become stacked cards under `md` (see
`components/admin/AdminTable.jsx`). Any new element that scrolls on its own should carry the
`scrollbar-brand` class from `index.css` — the `scrollbar-*` utility names some files still use
generate no CSS at all, because Tailwind v4 does not ship them and `tailwind-scrollbar` is not
installed.

### For Admins

- **Dashboard** — live catalog stats, pending review count, recent audit activity and per-operator split.
- **Plans** — create, edit, search and filter the catalog. Rows are tick-selectable, and a single plan, a
  chosen selection or the **entire catalog** can be deleted — each behind a confirmation dialog. Bulk deletes
  also clear the affected price history, drop pending proposals that point at deleted plans and remove them
  from every user's saved plans.
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
| **Jio** (`jio-sync`) | ✅ live | Jio publishes the whole catalogue as plain JSON — **one unauthenticated GET**, no session, headers or encryption: `/api/jio-mdmdata-service/mdmdata/recharge/plans?productType=MOBILITY&billingType=1`. It returns 17 categories of `planCategories[].subCategories[].plans[]`; each plan has `id`, `amount`, `description`, `planName` and a `misc.subscriptions[]` list. A dry run reads **62 usable plans** in ~250 ms. |
| **BSNL** (`bsnl-sync`) | ✅ live | BSNL's recharge page hands an anonymous `bsnl_session` cookie to anyone who loads it, and that is all its plan API needs — **no login, no mobile number, no captcha**. Bodies must be AES-encrypted (CryptoJS/OpenSSL) and responses come back encrypted too; both live in `planSources/cryptoJs.js`. A dry run reads **9 usable plans** in ~1.6 s (single circle). |
| **Airtel** (`airtel-sync`) | ✅ live | Airtel's own site is a pure JS app, so TeleBolt scrapes **Bajaj Finserv's server-rendered recharge tables** at `bajajfinserv.in/airtel-prepaid-mobile-recharge`. The page exposes multiple HTML tables with Price, Validity, Data, Calls and Extra Benefit columns. A generic table parser extracts ~39 usable plans in ~300 ms. International roaming packs are filtered out. |

Together the four sources fetch **~198 plans** per run.

**How Jio works.** The `billingType` is `1` for prepaid and `2` for postpaid — *not* the string
`"PREPAID"`, which their own bundle never sends. Validity comes from `"Validity - 28 Days"` in the
description (Jio also writes "active base plan validity" in prose, so the parser demands a separator),
falling back to the `28D` token in `planName`. Two schema details matter: their subscription titles are
mapped onto our `ottApps` enum, so `JioTV`/`JioAICloud` are deliberately **not** claimed as OTT while
`JioHotstar`, `Prime`, `SonyLiv`, `Zee5` and `Netflix` are; and plans with no GB figure at all (for
example the ₹1000 JioShield bundle) are dropped, because a plan with no quantifiable data cannot be
compared.

**How BSNL works.** `POST /api/bsnl-proxy/api/recharge-plansnew` with
`{ operatorCode: "BSNL", circleCode: "<full circle name>" }`, AES-encrypted, returns `mobilePlans`
grouped into tabs (`UNLIMITED`, `Voice & Data Packs`, `Data Packs`, …). Two things cost real time to
find and are worth knowing:

- `circleCode` is the **full circle name** — `"Madhya Pradesh"`, not `"MP"` or `"MH"`. Those short codes
  come from `fetch-operator`, the endpoint that *does* demand a mobile number and captcha; using the
  name directly skips that whole flow.
- Bodies must be encrypted or the proxy answers `403 "Plain text requests are not allowed"`, and a bare
  request gets `403 "Direct API access is strictly prohibited."` (a same-origin check).
- **BSNL does not answer every network.** From the datacenter IPs Render uses, a connection to
  `bsnl.co.in` is dropped outright (`fetch failed`, usually `ECONNRESET` or a connect timeout), while the
  same code works from a home connection in India. The source retries once, then reports `Skipped` with
  the reason — it never fails the run — and `scripts/plan-sync-run.mjs bsnl-sync` will sync BSNL from any
  machine that can reach them, writing to the same database.

Delhi and Tamil Nadu currently answer `"No recharge plans found"`; Madhya Pradesh, Maharashtra,
Karnataka and Gujarat each return 59–61 rows, mostly the same national catalogue. Set `BSNL_CIRCLES`
to change which are pulled.

**How Airtel works.** Airtel's own recharge page (`airtel.in/recharge/prepaid/`) is a React SPA with
no public API, so TeleBolt scrapes **Bajaj Finserv's BBPS portal** which publishes the same plans as
plain server-rendered HTML tables. The page `https://www.bajajfinserv.in/airtel-prepaid-mobile-recharge`
contains multiple `<table>` elements; a generic parser finds tables with Price, Data and
(Validity or Calls) headers, then extracts rows. Key details:

- Tables without a Validity column (e.g. long-validity packs) have validity inferred from the
  "Extra Benefit" text (`"for 3 months"` → 90 days) or from price bands (≥₹1000 → 84 days,
  ≥₹500 → 56 days, else 28 days).
- International roaming packs are detected by keywords in the Details column (`abroad`, `USA`,
  `Europe`, `Gulf`, `IC+OG`, etc.) and excluded.
- OTT benefits are parsed from the Extra Benefit column and mapped to the schema enum
  (`JioHotstar`, `Prime`, `Netflix`, `SonyLiv`, `Zee5`).
- The source requires no authentication, cookies or encryption — a single GET with a browser UA.

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

# Run a REAL sync from this machine, exactly like the admin button does
node scripts/plan-sync-run.mjs bsnl-sync        # one source
node scripts/plan-sync-run.mjs                  # every source
node scripts/plan-sync-run.mjs --dry bsnl-sync  # same checks, writes nothing

# What did the last runs actually do? (reads the history, including deployed runs)
node scripts/plan-sync-runs.mjs 10

# Source unit tests (normalisers, matching rules, schema invariants)
cd Backend && node test/planSources.test.mjs
```

### Safety and legal notes

- Requests run once a day with a browser-like user agent; nothing is polled aggressively.
- New plans per run are capped by `SYNC_MAX_NEW_PER_RUN` (default 200) so the queue cannot flood, and
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
│   │   ├── plan-sync-dry-run.mjs        # run sources without touching the DB
│   │   ├── plan-sync-run.mjs            # run a real sync from this machine
│   │   └── plan-sync-runs.mjs           # print recent runs from the database
│   ├── test/
│   │   ├── fixtures/                    # real Vi + Jio + BSNL + Airtel plan records
│   │   └── planSources.test.mjs
│   └── src/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/                      # Plans, DetectedChange, PlanSyncRun, AuditLog, …
│       ├── routes/
│       ├── services/
│       │   ├── planSources/             # vi.source.js, jio.source.js, bsnl.source.js, airtel.source.js, normalize.js
│       │   ├── planSync.service.js      # fetch → normalise → diff → propose
│       │   ├── scheduler.service.js     # weekly reminder + daily sync
│       │   ├── audit.service.js
│       │   └── email.service.js
│       └── utils/
│
├── Frontend/
│   └── src/
│       ├── api/
│       ├── components/                  # PlanCard, admin/* …
│       ├── context/                     # Auth, AdminStats
│       ├── layouts/
│       ├── pages/                       # Home, Rankings, Profile, admin/*
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
Daily automated Vi + Jio + BSNL + Airtel plan sync into the detected-changes queue ✅ (Jio from its public JSON
API, BSNL via its self-minted session, Airtel via Bajaj Finserv server-rendered tables), audit logging ✅, community plan submissions with a moderation
queue ✅, contributor tracking ✅, **format-based ranking engine (Home + Rankings merged) ✅**. Still open: duplicate detection and trust scoring.

**V3 — Platform (planned)**
Advanced trust algorithms, contributor reputation and badges, spam detection, smart plan
recommendations, AI-assisted comparison insights, React Native app.

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://tele-bolt.vercel.app |
| Backend | Render | https://telebolt.onrender.com |
| Database | MongoDB Atlas | — |

All tiers used are free. The project is designed to run at zero cost during MVP.

### Backend → Render

`render.yaml` in the repo root describes the service, so the Blueprint flow configures it for you:
**root directory** `Backend`, **build** `npm install`, **start** `npm start`, **health check** `/health`
(that route exists in `app.js`). Set these environment variables in the dashboard:

```env
NODE_ENV=production          # required: makes the auth cookie Secure + SameSite=None
FRONTEND_URL=https://tele-bolt.vercel.app    # exact origin, no trailing slash, or CORS rejects the app
MONGODB_URI=...
JWT_SECRET=...
ADMIN_SECRET_KEY=...
ADMIN_EMAIL=...
EMAIL=...
EMAIL_PASS=...
# optional
BSNL_CIRCLES=Madhya Pradesh,Maharashtra,Karnataka,Gujarat
JIO_EXCLUDE_CATEGORIES=Top-up Voucher,International Roaming,ISD
SYNC_CRON=0 3 * * *
SYNC_TIMEZONE=Asia/Kolkata
```

**MongoDB Atlas must allow Render.** Free Render services have no static outbound IP, so add
`0.0.0.0/0` to the Atlas IP Access List. Do not skip this: `app.js` only calls `app.listen()` after
`connectDB()` resolves, so a blocked database means the service never binds a port and Render reports a
**failed deploy** rather than a connection error.

### Frontend → Vercel

Import the repo, set the **root directory** to `Frontend`, and use the default Vite settings
(`npm run build`, output `dist`). `vercel.json` handles the SPA fallback and, importantly, proxies the API:

```json
{ "source": "/api/(.*)", "destination": "https://telebolt.onrender.com/api/$1" }
```

That rewrite is what makes authentication work. The API client sends requests to its own origin
(`/api`), so the auth cookie is **first-party**. Pointing the browser at `onrender.com` directly would
make it a third-party cookie, which Safari, Firefox and Chrome's tracking protection block — logins
would appear to do nothing. The proxy also removes CORS from the browser's path entirely, which is why
**no frontend environment variables are required**; `VITE_API_URL` exists only to override the base URL
deliberately. If the Render service is ever renamed, update this one line.

### Free-tier behaviour

Render's free web services spin down after ~15 minutes idle, which means:

- the first request afterwards takes 30–60s to wake the service — retry once if a page seems to hang
- `node-cron` cannot fire while asleep, so the **daily plan sync** and the **weekly reminder email** do
  not run on their own. Use **Admin → Detected changes → Run sync now**, which runs exactly the same job

Everything else — the catalog, comparisons, rankings, review queue and admin — works normally.

---

## License

MIT
