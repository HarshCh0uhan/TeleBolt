import mongoose from "mongoose"
import { Notification } from "../models/notification.js"

export const getMyNotifications = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 30, 100)

        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            Notification.countDocuments({ user: req.user._id, read: false })
        ])

        res.status(200).json({ success: true, notifications, unreadCount })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false })
        res.status(200).json({ success: true, unreadCount })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const markOneRead = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Notification ID")

        await Notification.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { read: true }
        )

        res.status(200).json({ success: true })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
        res.status(200).json({ success: true })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const dismissNotification = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Notification ID")

        await Notification.findOneAndDelete({ _id: id, user: req.user._id })
        res.status(200).json({ success: true })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}
