# TeleBolt ⚡

A MERN-stack web app for comparing Indian telecom prepaid plans and automatically monitoring price/validity changes via web scraping.

---

## What is TeleBolt?

TeleBolt lets users compare mobile recharge plans across operators like Jio, Airtel, and Vi — filtered by budget, data, and validity. It also runs a daily background job that detects when operators change their plans, and notifies the admin to review and approve those changes.

---

## Features

### Public
- View and filter plans by operator, price, validity, and data
- Sort by value for money (cost per GB)
- Compare two or more plans side by side
- Automatic 365-day normalization (yearly cost and yearly data)

### Admin Dashboard
- Add, edit, and delete plans (or bulk import via CSV)
- Review detected plan changes (approve or reject)
- Price history log for every approved change
- Protected by JWT authentication

### Monitoring Service
- Daily cron job scrapes official telecom sites
- Detects price and validity changes automatically
- Sends email alert to admin when changes are found

---

## Tech Stack

| Layer | Tool | Hosting |
|---|---|---|
| Frontend | React | Vercel (Hobby - Free) |
| Backend | Node.js + Express | Render (Free) |
| Database | MongoDB | Atlas M0 (Free) |
| Auth | JWT + bcrypt | — |
| Scraping | axios + cheerio | — |
| Email | nodemailer + Gmail | — |
| Scheduling | node-cron | — |
| CSV Upload | multer + csv-parser | — |
| CI/CD | GitHub Actions | Free (2000 min/month) |

---

## Project Structure

```
TeleBolt/
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── plan.controller.js
│       │   └── admin.controller.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── plan.model.js
│       │   ├── priceHistory.model.js
│       │   └── detectedChange.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── plan.routes.js
│       │   └── admin.routes.js
│       ├── middleware/
│       │   └── auth.middleware.js
│       ├── utils/
│       │   ├── jwt.js
│       │   └── validation.js
│       ├── services/
│       │   ├── email.service.js
│       │   └── scrape.service.js
│       ├── scripts/
│       │   └── createAdmin.js
│       └── app.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm
- MongoDB Atlas account (free M0 cluster)
- Gmail account (for email alerts)

### 1. Clone the repo

```bash
git clone https://github.com/HarshCh0uhan/TeleBolt
cd telebolt
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `/Backend` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster.mongodb.net/telebolt
JWT_SECRET=your_very_strong_random_secret_here
ADMIN_EMAIL=admin@telebolt.com
ADMIN_PASSWORD=StrongPassword@123
EMAIL=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Run the backend:

```bash
npm run dev
```

### 3. Create Admin User (run once)

```bash
npm run seed:admin
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `/frontend` folder:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

Run the frontend:

```bash
npm start
```

---

## API Overview

### Public Routes (no auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plans` | Get all plans with optional filters |
| GET | `/api/plans/:id` | Get single plan details |
| GET | `/api/compare?planIds=...` | Compare multiple plans |

**Filter query params:** `operator`, `category`, `minPrice`, `maxPrice`, `minData`, `maxData`

### Admin Routes (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/admin/plans` | Add new plan |
| PUT | `/api/admin/plans/:id` | Update plan |
| DELETE | `/api/admin/plans/:id` | Delete plan |
| POST | `/api/admin/upload-csv` | Bulk import plans via CSV |
| GET | `/api/admin/detected` | List pending detected changes |
| POST | `/api/admin/approve/:id` | Approve a detected change |
| POST | `/api/admin/reject/:id` | Reject a detected change |

---

## CSV Import Format

When bulk importing plans, use this column order:

```
operator, category, price, validityDays, dailyData, totalData, sms, ottApps
```

Example:
```
Jio, Daily, 199, 22, 1.5, 33, 100, JioHotstar
Airtel, Non-Daily, 299, 28, 0, 50, 100, Prime|Hotstar
```

---

## Monitoring Service

- Runs automatically every day at 3:00 AM
- Scrapes Jio, Airtel, Vi official plan pages
- Compares scraped data with current DB values
- Creates a `DetectedChange` entry for any difference found
- Sends email alert to admin if changes are detected
- Admin reviews and approves or rejects each change from the dashboard

---

## Deployment

### Backend → Render
1. Push code to GitHub
2. Create new Web Service on Render, connect your repo
3. Set build command: `npm install`
4. Set start command: `node src/app.js`
5. Add all environment variables from your `.env`

### Database → MongoDB Atlas
1. Create free M0 cluster
2. Create a DB user with read/write access
3. Whitelist `0.0.0.0/0` for development (restrict IPs in production)
4. Copy connection string to `MONGODB_URI`

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set `REACT_APP_API_BASE_URL` to your Render backend URL
3. Vercel auto-deploys on every push to `main`

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random string for signing JWT tokens |
| `ADMIN_EMAIL` | Admin account email |
| `ADMIN_PASSWORD` | Admin account password (used by seed script) |
| `EMAIL` | Gmail address for sending alerts |
| `EMAIL_PASS` | Gmail App Password (not your regular password) |

---

## Usage

- **Public site:** Browse to `/` to view and compare plans
- **Admin panel:** Go to `/admin/login` to access the dashboard

---

## Future Ideas (Post-MVP)

- Google OAuth login
- Broadband and OTT-only plan comparisons
- Personalized plan recommendations
- User subscriptions and price alerts
- Analytics dashboard
- Redis caching for faster plan queries

---

## License

