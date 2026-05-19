import express from "express"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.js";
import { approveChange, createPlans, deletePlans, detectedChanges, updatePlans } from "../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post('/plans',userAuth, isAdmin, createPlans);
adminRouter.put('/plans/:id',userAuth, isAdmin, updatePlans);
adminRouter.delete('/plans/:id',userAuth, isAdmin, deletePlans);
adminRouter.get('/detected',userAuth, isAdmin, detectedChanges);
adminRouter.get('/approve/:id',userAuth, isAdmin, approveChange);