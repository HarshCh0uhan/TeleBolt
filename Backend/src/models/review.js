import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: "",
        maxlength: 500
    }
}, {timestamps: true})

// One review per user per plan.
reviewSchema.index({ user: 1, plan: 1 }, { unique: true });
reviewSchema.index({ plan: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);