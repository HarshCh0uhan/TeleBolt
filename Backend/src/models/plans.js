import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
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
        type: Number,
    },
    totalData: {
        type: Number,
    },
    sms: {
        type: Number,
    },
    isUnlimitedCalls: {
        type: Boolean,
        default: true
    },
    isUnlimitedSMS:{
        type: Boolean,
        default: false
    },
    ottApps: [{
        type: String,
        enum: ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"]
    }],
    isActive: {
        type: Boolean,
        default: true   
    },
    // Provenance for plans imported by the sync service. "manual" means an
    // admin typed it in or uploaded it by CSV; sourceRef is the operator's id.
    source: {
        type: String,
        default: "manual"
    },
    sourceRef: {
        type: String,
        default: ""
    }
}, {timestamps: true})

planSchema.index({ operator: 1, category: 1 });
planSchema.index({ source: 1, sourceRef: 1 });

planSchema.pre('save', async function(){
    if(this.dailyData === undefined && this.totalData === undefined)
        throw new Error("Either daily data or total data must be provided")
})

export const Plans = mongoose.model("Plans", planSchema);