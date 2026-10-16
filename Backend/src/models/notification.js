import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    kind: {
        type: String,
        enum: ["plan_change", "plan_new", "system"],
        default: "plan_change"
    },
    read: {
        type: Boolean,
        default: false
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {timestamps: true})

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
