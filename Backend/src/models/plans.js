    import mongoose from "mongoose";

    const planSchema = new mongoose.Schema({
        operator: {
            type: String,
            required: true,
            enum: ["Jio", "Airtel", "VI"],
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
        }
    }, {timestamps: true})

    planSchema.index({ operator: 1, category: 1 });

    export const Plans = mongoose.model("Plans", planSchema);