import express from "express"
import { comparePlans, getPlans, getSinglePlan, getPriceHistory, submitPlan } from "../controllers/plan.controller.js";
import { userAuth } from "../middlewares/verifyAuth.middleware.js";

export const planRouter = express.Router();

planRouter.post("/submit", userAuth, submitPlan);
planRouter.get("/price-history/:id", getPriceHistory)
planRouter.get("/compare", comparePlans);  
planRouter.get("/:id", getSinglePlan);  
planRouter.get("/", getPlans);  