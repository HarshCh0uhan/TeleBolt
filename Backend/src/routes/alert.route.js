import express from "express"
import { userAuth } from "../middlewares/verifyAuth.middleware.js"
import { getMyAlerts, getAlertForPlan, toggleAlert, removeAlert } from "../controllers/alert.controller.js"

export const alertRouter = express.Router()

alertRouter.get("/", userAuth, getMyAlerts)
alertRouter.get("/:planId", userAuth, getAlertForPlan)
alertRouter.post("/:planId", userAuth, toggleAlert)
alertRouter.delete("/:planId", userAuth, removeAlert)
