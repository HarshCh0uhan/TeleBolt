import mongoose from "mongoose"

const priceHistorySchema = new mongoose.Schema({
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans",
        required: true
    },
    oldPrice: {
        type: Number,
        required: true,
        min: 1
    },
    newPrice: {
        type: Number,
        required: true,
        min: 1
    }
}, {timestamps: true})

export const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);