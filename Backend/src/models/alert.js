import mongoose from "mongoose"

const alertSchema = new mongoose.Schema({
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
    active: {
        type: Boolean,
        default: true
    },
    lastNotifiedAt: {
        type: Date,
        default: null
    }
}, {timestamps: true})

alertSchema.index({ user: 1, plan: 1 }, { unique: true });
alertSchema.index({ plan: 1, active: 1 });

export const Alert = mongoose.model("Alert", alertSchema);
