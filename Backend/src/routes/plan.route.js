import express from "express"
import { userAuth } from "../middlewares/verifyAuth.js";
import { getPlans, getSinglePlan } from "../controllers/plan.controller.js";

export const planRouter = express.Router();

planRouter.get("/plans",userAuth, getPlans);  
planRouter.get("/plans:id",userAuth, getSinglePlan);  