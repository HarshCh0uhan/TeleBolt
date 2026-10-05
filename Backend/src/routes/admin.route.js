import express from "express"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.middleware.js";
import { approveChange, createPlans, deletePlans, detectedChanges, getAllPlans, rejectChange, updatePlans, getStats, getAuditLogs, getSubmissions, approveSubmission, rejectSubmission, getPlanSyncSources, triggerPlanSync, getPlanSyncRuns, approveAllNewPlans, rejectPendingChanges } from "../controllers/admin.controller.js";
import upload from "../middlewares/upload.middleware.js";
import uploadCSV from "../controllers/uploadCSV.controller.js";


export const adminRouter = express.Router();

adminRouter.get('/plans',userAuth, isAdmin, getAllPlans);
adminRouter.post('/plans',userAuth, isAdmin, createPlans);
adminRouter.put('/plans/:id',userAuth, isAdmin, updatePlans);
adminRouter.delete('/plans/:id',userAuth, isAdmin, deletePlans);
adminRouter.get('/detected',userAuth, isAdmin, detectedChanges);
adminRouter.post('/approve/:id',userAuth, isAdmin, approveChange);
adminRouter.post('/reject/:id',userAuth, isAdmin, rejectChange);
adminRouter.post('/upload-csv', userAuth, isAdmin, upload, uploadCSV)
adminRouter.get('/stats', userAuth, isAdmin, getStats);
adminRouter.get('/audit-logs', userAuth, isAdmin, getAuditLogs);
adminRouter.get('/submissions', userAuth, isAdmin, getSubmissions);
adminRouter.post('/submissions/:id/approve', userAuth, isAdmin, approveSubmission);
adminRouter.post('/submissions/:id/reject', userAuth, isAdmin, rejectSubmission);
adminRouter.get('/plan-sync/sources', userAuth, isAdmin, getPlanSyncSources);
adminRouter.post('/plan-sync/run', userAuth, isAdmin, triggerPlanSync);
adminRouter.get('/plan-sync/runs', userAuth, isAdmin, getPlanSyncRuns);
adminRouter.post('/approve-new-plans', userAuth, isAdmin, approveAllNewPlans);
adminRouter.post('/reject-pending', userAuth, isAdmin, rejectPendingChanges);