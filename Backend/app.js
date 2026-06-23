import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import {authRouter} from "./src/routes/auth.route.js"
import cookieParser from "cookie-parser"
import { planRouter } from "./src/routes/plan.route.js";
import { adminRouter } from "./src/routes/admin.route.js";
import './src/services/scheduler.service.js'
import cors from "cors"

dotenv.config();
const app = express();  


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true 
}))
app.use(express.json())
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

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