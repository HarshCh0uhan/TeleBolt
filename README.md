# TeleBolt ⚡

TeleBolt is a MERN-stack telecom comparison platform that helps users discover the actual yearly cost of Indian telecom prepaid plans across operators like Jio, Airtel, Vi, and BSNL.

Instead of only showing the original recharge price, TeleBolt normalizes plans into a 365-day cost model so users can understand the real yearly expense, total yearly data, OTT benefits, and value-for-money comparison.

The platform is being built with a scalable architecture focused on:
- accurate telecom plan comparison
- admin-controlled moderation
- future community contributions
- lightweight telecom change monitoring
- long-term extensibility

---

# 🚀 Vision

Most telecom apps show plans exactly how operators market them.

Example:
- ₹199 plan
- ₹299 plan
- ₹749 plan

But users rarely realize:
- how much they will actually spend yearly
- which operator is cheapest long-term
- how much total data they truly receive
- which plan gives best value per GB

TeleBolt solves this by converting recharge plans into:
- yearly cost
- yearly data value
- yearly comparison metrics

This allows users to make smarter recharge decisions instead of marketing-driven decisions.

---

# ✨ Core Features (MVP)

## Public Features

- Compare telecom plans across operators
- Filter plans by:
  - yearly budget
  - validity
  - operator
  - daily/non-daily data
  - OTT benefits
- View:
  - actual yearly recharge cost
  - total yearly data
  - cost-per-GB analysis
- Side-by-side plan comparison
- Separate categories for:
  - Daily Data Plans
  - Non-Daily Data Plans
  - OTT Plans
  - Data Add-ons
- Smart yearly normalization system

---

# 🛠 Admin Features

- Add/Edit/Delete plans
- Bulk CSV upload system
- Admin approval workflow
- Price history tracking
- Change moderation system
- Secure JWT authentication

---

# 📡 Telecom Change Monitoring System

TeleBolt does NOT depend entirely on web scraping.

Instead, it uses a hybrid monitoring architecture.

## How It Works

### Source of Truth
The TeleBolt database remains the primary trusted source.

### Lightweight Monitoring Layer
TeleBolt can optionally monitor publicly exposed telecom frontend JSON responses (discovered through browser network requests) to detect potential plan changes.

These endpoints are NOT treated as official public APIs.

They are only used as:
- lightweight monitoring signals
- change detection assistance
- admin verification helpers

### Why This Architecture?

Relying entirely on unofficial telecom APIs is risky because:
- endpoints can change anytime
- rate limits may appear
- bot protection may increase
- response structures may change

So TeleBolt uses:
- manual admin verification
- optional automated detection
- approval-based updates

This creates a safer and more maintainable architecture.

---

# 🔔 Monitoring Workflow

```txt
Telecom frontend JSON changes detected
        ↓
Potential change created
        ↓
Admin reviews change
        ↓
Approve or reject
        ↓
Database updates
```

---

# 🧠 Architecture Philosophy

TeleBolt is intentionally being built in phases to avoid feature explosion and overengineering during MVP development.

The goal is:
- ship a complete working product early
- validate the core experience
- expand safely over time

---

# 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| Mobile App | React Native |
| Email Service | Nodemailer |
| Scheduling | node-cron |
| CSV Import | multer + csv-parser |
| Deployment | Vercel + Render |
| Database Hosting | MongoDB Atlas Free Tier |

All technologies used in the project are free-tier friendly.

---

# 📂 Project Structure

```txt
TeleBolt/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── models/
│       ├── middleware/
│       ├── services/
│       ├── utils/
│       ├── scripts/
│       └── app.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── context/
│       └── api/
│
├── mobile/
│   └── React Native App
│
├── .github/
├── README.md
└── package.json
```

---

# 🔐 Authentication

Current MVP authentication:
- Admin authentication only
- JWT-based authorization

Public users do NOT need accounts during MVP.

Future versions may include:
- user accounts
- contribution system
- bookmarks
- alerts
- trust scoring

---

# 📊 Database Design Philosophy

TeleBolt is designed with schema evolution in mind.

The database structure is intentionally simple during MVP and will evolve gradually as new platform features are added.

Future schema evolution may include:
- contributor trust scores
- moderation priority levels
- contribution history
- community reputation systems

Migrations and schema evolution scripts will be used to safely evolve production data over time.

---

# 🧪 Backend Status

## Completed
- Authentication system
- Plan APIs
- Admin APIs
- CSV import system
- Price history tracking
- Detected change workflow
- Email notification service
- Cron scheduling
- Database models
- Validation utilities

## Current Stage
- API testing
- frontend development

## Next Step
- frontend completion
- deployment
- MVP launch

---

# 🌐 Planned Frontend Features

- Clean telecom dashboard UI
- Operator-wise filtering
- Budget sliders
- Plan comparison UI
- Yearly savings visualization
- Responsive mobile-first design

---

# 📱 Planned Mobile App

React Native app with:
- plan comparison
- smart filters
- yearly savings insights
- future alerts and notifications

---

# 🚀 Roadmap

# V1 — MVP

## Core Features
- Telecom plan comparison
- Yearly normalization
- Budget filtering
- Admin dashboard
- CSV uploads
- Price history tracking
- Manual moderation workflow
- Lightweight monitoring support
- Deployment

---

# V2 — Community Expansion

## Planned Features
- User accounts
- Community plan submissions
- New Plan submission workflow
- Existing Plan Change workflow
- Duplicate detection
- Contributor tracking
- Basic trust score system
- Submission moderation queue

---

# V3 — Advanced Platform Systems

## Planned Features
- Advanced hidden trust algorithms
- Contributor reputation system
- Priority-based moderation
- Contributor badges
- Spam detection systems
- Smart plan recommendations
- AI-assisted comparison insights
- Personalized telecom suggestions

---

# 🧠 Future Community Moderation Concept

Future versions of TeleBolt may allow community-driven telecom updates.

Example workflow:

```txt
User submits plan/change
        ↓
Submission enters moderation queue
        ↓
Admin reviews submission
        ↓
Approve or reject
```

A future trust-based moderation system may prioritize reliable contributors based on contribution quality and approval history.

---

# 🎯 Why This Project Exists

TeleBolt is being built to:
- solve a real comparison problem
- explore scalable backend architecture
- practice production-grade MERN engineering
- learn moderation system design
- understand schema evolution and system scalability
- build a deployable real-world product

---

# ⚙️ Environment Variables

```env
PORT=
MONGODB_URI=
JWT_SECRET=
EMAIL=
EMAIL_PASS=
NODE_ENV=
```

---

# 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

# 📌 Current Development Focus

Right now the project focus is:
- stabilizing backend APIs
- testing workflows
- building frontend
- shipping MVP cleanly

The platform will expand gradually after deployment based on:
- real usage
- feedback
- scalability needs

---

# 📜 License

MIT License

---

# 👨‍💻 Developer Notes

TeleBolt is intentionally being built with:
- scalable architecture
- phased development
- realistic production workflows
- extensible database design
- maintainable backend systems

The project prioritizes:
- correctness over automation
- maintainability over shortcuts
- extensibility over premature complexity
