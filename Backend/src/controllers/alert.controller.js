import mongoose from "mongoose"
import { Alert } from "../models/alert.js"
import { Plans } from "../models/plans.js"

export const getMyAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ user: req.user._id, active: true })
            .populate("plan", "operator price validityDays category")
            .lean()

        res.status(200).json({ success: true, alerts })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const getAlertForPlan = async (req, res) => {
    try {
        const { planId } = req.params
        if (!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan ID")

        const alert = await Alert.findOne({ user: req.user._id, plan: planId, active: true }).lean()

        res.status(200).json({ success: true, alert: alert || null })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const toggleAlert = async (req, res) => {
    try {
        const { planId } = req.params
        if (!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan ID")

        const plan = await Plans.findOne({ _id: planId, isActive: true })
        if (!plan) throw new Error("Plan does not exist")

        const existing = await Alert.findOne({ user: req.user._id, plan: planId })

        if (existing) {
            existing.active = !existing.active
            if (existing.active) existing.lastNotifiedAt = null
            await existing.save()
            return res.status(200).json({ success: true, alert: existing, isActive: existing.active })
        }

        const alert = await Alert.create({ user: req.user._id, plan: planId })
        res.status(201).json({ success: true, alert, isActive: true })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const removeAlert = async (req, res) => {
    try {
        const { planId } = req.params
        if (!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan ID")

        await Alert.findOneAndDelete({ user: req.user._id, plan: planId })

        res.status(200).json({ success: true })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}
