import express from "express"
import { userAuth } from "../middlewares/verifyAuth.middleware.js";
import { comparePlans, getPlans, getSinglePlan } from "../controllers/plan.controller.js";

export const planRouter = express.Router();

planRouter.get("/compare", comparePlans);  
planRouter.get("/:id", getSinglePlan);  
planRouter.get("/", getPlans);  