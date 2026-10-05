import mongoose from "mongoose"

// One entry per plan source inside a sync run.
const sourceResultSchema = new mongoose.Schema({
    source: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ["Success", "Partial", "Skipped", "Failed"]
    },
    message: { type: String, default: "" },
    fetched: { type: Number, default: 0 },
    newPlans: { type: Number, default: 0 },
    changes: { type: Number, default: 0 },
    unchanged: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    // Existing plans that were linked to this source for the first time.
    adopted: { type: Number, default: 0 },
    // Catalogue plans from this source that no longer appear upstream.
    missingFromSource: { type: Number, default: 0 },
    // Plain notes rather than "errors": that key is reserved by Mongoose.
    notes: [{ type: String }]
}, { _id: false })

const planSyncRunSchema = new mongoose.Schema({
    trigger: {
        type: String,
        enum: ["cron", "admin"],
        default: "cron"
    },
    status: {
        type: String,
        required: true,
        enum: ["Success", "Partial", "Failed"]
    },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date, required: true },
    durationMs: { type: Number, default: 0 },
    totals: {
        fetched: { type: Number, default: 0 },
        newPlans: { type: Number, default: 0 },
        changes: { type: Number, default: 0 },
        unchanged: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 }
    },
    sources: [sourceResultSchema],
    triggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true })

planSyncRunSchema.index({ createdAt: -1 });

export const PlanSyncRun = mongoose.model("PlanSyncRun", planSyncRunSchema);
