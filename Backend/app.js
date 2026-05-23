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

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Listening to Server");
    })
    }).catch((err) => {
        console.log("Database Connection cannot be Established !!!" + err.message)
    })