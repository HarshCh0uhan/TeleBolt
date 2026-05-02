import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();
const app = express();  

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Listening to Server");
    })
    }).catch((err) => {
        console.log("Database Connection cannot be Established !!!" + err.message)
    })