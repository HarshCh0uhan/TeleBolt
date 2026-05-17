import express from "express"
import { userAuth } from "../middlewares/verifyAuth.js";
import { comparePlans, getPlans, getSinglePlan } from "../controllers/plan.controller.js";

export const planRouter = express.Router();

planRouter.get("/plans/compare", comparePlans);  
planRouter.get("/plans/:id", getSinglePlan);  
planRouter.get("/plans", getPlans);  