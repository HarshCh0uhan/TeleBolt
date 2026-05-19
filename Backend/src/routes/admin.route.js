import express from "express"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.js";
import { createPlans, deletePlans, updatePlans } from "../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post('/admin/plans',userAuth, isAdmin, createPlans);
adminRouter.put('/admin/plans/:id',userAuth, isAdmin, updatePlans);
adminRouter.delete('/admin/plans/:id',userAuth, isAdmin, deletePlans);