import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import connectDB from "./src/config/db.js";
import {authRouter} from "./src/routes/auth.route.js"
import cookieParser from "cookie-parser"
import { planRouter } from "./src/routes/plan.route.js";
import { adminRouter } from "./src/routes/admin.route.js";
import './src/services/scheduler.service.js'
import cors from "cors"

dotenv.config();
const app = express();

// Render (and Vercel's rewrite in front of it) sit between the client and this
// process, so the real client IP arrives in X-Forwarded-For. Without this every
// visitor shares one IP and rate limiting would block everybody together.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json({ limit: "100kb" }))
app.use(cookieParser());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many attempts. Please try again in a few minutes.",
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many requests. Please slow down and try again shortly.",
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/register-admin", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRouter);
app.use("/api/plans", planRouter);
app.use("/api/admin", adminRouter);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 1MB.' });
  }
  if (err.message === 'Only CSV Files allowed') {
    return res.status(400).json({ success: false, message: 'Invalid file type. Only CSV files are allowed.' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large.' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Listening to Server");
    })
    }).catch((err) => {
        console.log("Database Connection cannot be Established !!!" + err.message)
    })