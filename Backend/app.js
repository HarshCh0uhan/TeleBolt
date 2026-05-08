import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import {authRouter} from "./src/routes/auth.route.js"

dotenv.config();
const app = express();  

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Listening to Server");
    })
    }).catch((err) => {
        console.log("Database Connection cannot be Established !!!" + err.message)
    })