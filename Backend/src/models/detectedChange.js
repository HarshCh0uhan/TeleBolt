import mongoose from "mongoose"

// Field types the sync service (or an admin) can propose.
// "NewPlan" carries the whole proposed plan in `snapshot`; the other types
// carry a scalar old/new pair for a field on an existing plan.
export const DETECTED_FIELDS = ["Price", "ValidityDays", "DailyData", "TotalData", "Sms", "NewPlan"];

const detectedChangeSchema = new mongoose.Schema({
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans",
        default: null
    },
    field: {
        type: String,
        required: true,
        enum: DETECTED_FIELDS
    },
    oldValue: {
        type: Number,
        min: 0,
        default: null
    },
    newValue: {
        type: Number,
        min: 0,
        default: null
    },
    // Proposed plan payload for "NewPlan" proposals.
    snapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Where the proposal came from plus the operator's own plan id when known.
    source: {
        type: String,
        default: "manual"
    },
    sourceRef: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    }
}, {timestamps: true})

detectedChangeSchema.index({ status: 1, createdAt: -1 });
// Used to avoid raising the same proposal twice.
detectedChangeSchema.index({ source: 1, sourceRef: 1, field: 1, status: 1 });

export const DetectedChange = mongoose.model("DetectedChange", detectedChangeSchema);
