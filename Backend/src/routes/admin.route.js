import express from "express"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.js";
import { createPlans } from "../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post('/admin/plans',userAuth, isAdmin, createPlans);