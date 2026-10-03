import { AuditLog } from "../models/auditLog.js"

// Records an admin action. Failures are logged but never block the caller,
// because an audit miss should not break the actual operation.
export const logAudit = async ({ actor, action, entity, entityId, details = "" }) => {
    try {
        await AuditLog.create({
            actor: actor?._id,
            actorEmail: actor?.email || "unknown",
            action,
            entity,
            entityId: entityId || undefined,
            details
        })
    } catch (err) {
        console.error("Audit log write failed: ", err.message)
    }
}
