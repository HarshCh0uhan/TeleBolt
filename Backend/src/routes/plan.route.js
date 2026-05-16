import express from "express"
import { userAuth } from "../middlewares/verifyAuth.js";
import { getPlans } from "../controllers/plan.controller.js";

export const planRouter = express.Router();

planRouter.get("/plan",userAuth, getPlans);  