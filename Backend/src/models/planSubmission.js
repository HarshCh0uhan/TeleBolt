import mongoose from "mongoose"

const planSubmissionSchema = new mongoose.Schema({
    operator: {
        type: String,
        required: true,
        enum: ["Jio", "Airtel", "VI", "BSNL"],
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Daily", "Non-Daily"]
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    validityDays: {
        type: Number,
        required: true,
        min: 1,
        max: 365
    },
    dailyData: {
        type: Number
    },
    totalData: {
        type: Number
    },
    sms: {
        type: Number
    },
    isUnlimitedCalls: {
        type: Boolean,
        default: true
    },
    isUnlimitedSMS: {
        type: Boolean,
        default: false
    },
    ottApps: [{
        type: String,
        enum: ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"]
    }],
    note: {
        type: String,
        default: "",
        maxlength: 500
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviewNote: {
        type: String,
        default: ""
    }
}, {timestamps: true})

planSubmissionSchema.index({ status: 1, createdAt: -1 });
planSubmissionSchema.index({ submittedBy: 1, createdAt: -1 });

export const PlanSubmission = mongoose.model("PlanSubmission", planSubmissionSchema);
