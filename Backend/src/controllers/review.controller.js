import mongoose from "mongoose"
import { Review } from "../models/review.js"
import { Plans } from "../models/plans.js"

// Recomputes the denormalised rating fields on a plan after any write.
const refreshPlanRating = async (planId) => {
    const stats = await Review.aggregate([
        { $match: { plan: new mongoose.Types.ObjectId(planId) } },
        { $group: { _id: "$plan", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])

    const avg = stats[0]?.avg || 0
    const count = stats[0]?.count || 0

    await Plans.findByIdAndUpdate(planId, {
        ratingAvg: Math.round(avg * 10) / 10,
        ratingCount: count
    })
}

export const getPlanReviews = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Plan ID")

        const reviews = await Review.find({ plan: id })
            .sort({ createdAt: -1 })
            .populate("user", "username")
            .lean()

        res.status(200).json({ success: true, reviews })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const createReview = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Plan ID")

        const { rating, comment } = req.body
        const ratingNum = Number(rating)
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5)
            throw new Error("Rating must be a whole number from 1 to 5")

        const plan = await Plans.findById(id)
        if (!plan) throw new Error("Plan does not exist")

        const existing = await Review.findOne({ user: req.user._id, plan: id })
        if (existing) throw new Error("You have already reviewed this plan")

        const review = await Review.create({
            user: req.user._id,
            plan: id,
            rating: ratingNum,
            comment: typeof comment === "string" ? comment.slice(0, 500) : ""
        })

        await refreshPlanRating(id)

        res.status(201).json({ success: true, review })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Review ID")

        const review = await Review.findById(id)
        if (!review) throw new Error("Review does not exist")
        if (review.user.toString() !== req.user._id.toString())
            throw new Error("You can only edit your own review")

        if (req.body.rating !== undefined) {
            const ratingNum = Number(req.body.rating)
            if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5)
                throw new Error("Rating must be a whole number from 1 to 5")
            review.rating = ratingNum
        }
        if (typeof req.body.comment === "string") {
            review.comment = req.body.comment.slice(0, 500)
        }

        await review.save()
        await refreshPlanRating(review.plan)

        res.status(200).json({ success: true, review })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Review ID")

        const review = await Review.findById(id)
        if (!review) throw new Error("Review does not exist")
        if (review.user.toString() !== req.user._id.toString())
            throw new Error("You can only delete your own review")

        const planId = review.plan
        await Review.findByIdAndDelete(id)
        await refreshPlanRating(planId)

        res.status(200).json({ success: true, message: "Review deleted" })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

// Admin moderation: delete any review.
export const adminDeleteReview = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid Review ID")

        const review = await Review.findById(id)
        if (!review) throw new Error("Review does not exist")

        const planId = review.plan
        await Review.findByIdAndDelete(id)
        await refreshPlanRating(planId)

        res.status(200).json({ success: true, message: "Review removed" })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}