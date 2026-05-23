# TeleBolt ⚡

> Compare Indian telecom prepaid plans by what they actually cost you per year — not how operators market them.

Most telecom apps show you ₹199, ₹299, ₹749. TeleBolt shows you ₹3,588/yr, ₹4,788/yr, ₹8,988/yr — along with total yearly data, cost-per-GB, and OTT benefits across Jio, Airtel, Vi, and BSNL. Make the decision with real numbers.

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Clone & Install

```bash
git clone https://github.com/your-username/telebolt.git
cd telebolt

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

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
```

### Run Locally

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

---

## What Problem This Solves

Indian telecom operators market plans by recharge price and validity. A ₹199 plan valid for 24 days and a ₹239 plan valid for 28 days look comparable — but they're not once you annualize them.

TeleBolt normalizes every plan into a 365-day model so you can compare:

- **Yearly cost** — actual money spent per year across recharges
- **Yearly data** — total GB received, not just daily quota
- **Cost per GB** — the only metric that truly measures data value
- **OTT value** — which operator bundles subscriptions worth keeping

---

## Features

### For Users (Public, No Login Required)

- Compare plans across Jio, Airtel, Vi, and BSNL
- Filter by yearly budget, operator, validity, data type, and OTT benefits
- View yearly cost, total yearly data, and cost-per-GB side by side
- Plan categories: Daily Data, Non-Daily Data, OTT Plans, Data Add-ons
- No account needed during MVP

### For Admins

- Add, edit, and delete plans
- Bulk import via CSV upload
- Approval-based plan change workflow
- Price history tracking per plan
- Secure JWT-based authentication

### Telecom Change Monitoring

TeleBolt uses a lightweight hybrid monitoring system rather than full scraping:

- Optionally monitors publicly exposed telecom frontend JSON endpoints (discovered via browser network inspection) for plan changes
- Flags potential changes for admin review — no automatic updates
- Admins approve or reject before anything touches the database

This keeps the system stable even when telecom endpoints change structure, add bot protection, or go offline.

```
Telecom frontend JSON change detected
          ↓
Potential change logged
          ↓
Admin reviews
          ↓
Approve or reject → database updated
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Mobile (planned) | React Native |
| Email | Nodemailer |
| Scheduling | node-cron |
| CSV Import | multer + csv-parser |
| Frontend deploy | Vercel |
| Backend deploy | Render |
| Database hosting | MongoDB Atlas (free tier) |

---

## Project Structure

```
telebolt/
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
├── mobile/           # React Native (planned)
├── .github/
└── README.md
```


---

## Roadmap

**V1 — MVP**
Telecom plan comparison, yearly normalization, budget filtering, admin dashboard, CSV imports, price history, manual moderation, deployment.

**V2 — Community**
User accounts, community plan submissions, contributor tracking, duplicate detection, basic trust scoring, submission moderation queue.

**V3 — Platform**
Advanced trust algorithms, contributor reputation and badges, spam detection, smart plan recommendations, AI-assisted comparison insights.

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
