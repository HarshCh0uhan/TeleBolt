import express from "express"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.js";
import { createPlans, updatePlans } from "../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post('/admin/plans',userAuth, isAdmin, createPlans);
adminRouter.post('/admin/updatePlans/:id',userAuth, isAdmin, updatePlans);
adminRouter.post('/admin/deletePlans/:id',userAuth, isAdmin, deletePlans);