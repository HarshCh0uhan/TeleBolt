import mongoose from "mongoose"

const detectedChangeSchema = new mongoose.Schema({
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans",
        required: true,
    },
    field: {
        type: String,
        required: true,
        enum: ["Price", "ValidityDays"]
    },
    oldValue: {
        type: Number,
        required: true,
        min: 1
    },
    newValue: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    }
}, {timestamps: true})

export const DetectedChange = mongoose.model("DetectedChange", detectedChangeSchema);