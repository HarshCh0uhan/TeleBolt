import {Plans} from "../models/plans.js"

export const getPlans = async (req, res) => {
    try {
        const {operator, category, minPrice, maxPrice, validityDays, ottApps,
        dailyData, minData, maxData, isActive, isUnlimitedCalls, isUnlimitedSMS} = req.query;

        const filter ={}

        if(operator) filter.operator = operator
        if(category) filter.category = category
        if(ottApps) filter.ottApps = {$in: [ottApps]}
        if(minPrice || maxPrice){
            filter.price = {}
            if(minPrice) filter.price.$gte = Number(minPrice)
            if(maxPrice) filter.price.$lte = Number(maxPrice)
        } 
        if(validityDays) filter.validityDays = Number(validityDays)
        if(dailyData) filter.dailyData = Number(dailyData)
        if(minData || maxData) {
            filter.totalData = {}
            if(minData) filter.totalData.$gte = Number(minData)
            if(maxData) filter.totalData.$lte = Number(maxData)
        }
        if(isUnlimitedCalls) filter.isUnlimitedCalls = isUnlimitedCalls === 'true'
        if(isUnlimitedSMS) filter.isUnlimitedSMS = isUnlimitedSMS === 'true'
        if(isActive) filter.isActive = isActive === "true"
        
        const plansData = await Plans.find(filter);
        if(plansData.length === 0) throw new Error("No Plans Exist");

        const plansWithYearly = plansData.map((plan) => {
            const multiplier = Math.ceil(365 / plan.validityDays)
            return {
                ...plan.toObject(),
                yearlyCost: multiplier * plan.price,
                yearlyData: multiplier * plan.totalData
            }
        })

        res.status(200).json({
            success: true,
            message: "All Plans Fetched Successfully",
            plans: plansWithYearly
        })

    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}