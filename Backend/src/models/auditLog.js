import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    actorEmail: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            "create_plan", "update_plan", "delete_plan",
            "approve_change", "reject_change",
            "import_plans",
            "approve_submission", "reject_submission"
        ]
    },
    entity: {
        type: String,
        required: true,
        enum: ["Plan", "DetectedChange", "PlanSubmission"]
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: String,
        default: ""
    }
}, {timestamps: true})

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
