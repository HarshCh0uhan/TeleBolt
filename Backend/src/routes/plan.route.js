import express from "express"
import { comparePlans, getPlans, getSinglePlan, getPriceHistory } from "../controllers/plan.controller.js";

export const planRouter = express.Router();

planRouter.get("/price-history/:id", getPriceHistory)
planRouter.get("/compare", comparePlans);  
planRouter.get("/:id", getSinglePlan);  
planRouter.get("/", getPlans);  