import express from "express"
import { userAuth } from "../middlewares/verifyAuth.middleware.js"
import {
    getMyNotifications,
    getUnreadCount,
    markOneRead,
    markAllRead,
    dismissNotification,
} from "../controllers/notification.controller.js"

export const notificationRouter = express.Router()

notificationRouter.get("/", userAuth, getMyNotifications)
notificationRouter.get("/unread-count", userAuth, getUnreadCount)
notificationRouter.post("/read-all", userAuth, markAllRead)
notificationRouter.post("/:id/read", userAuth, markOneRead)
notificationRouter.delete("/:id", userAuth, dismissNotification)
