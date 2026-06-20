import {Plans} from "../models/plans.js"
import { yearlyPlan } from "../utils/yearlyPlan.js";
import mongoose from "mongoose"

export const getPlans = async (req, res) => {
    try {
        const {operator, category, minPrice, maxPrice, validityDays, ottApps,
        dailyData, minData, maxData, isActive, isUnlimitedCalls, isUnlimitedSMS} = req.query;

        const filter ={isActive: true}

        if(operator) filter.operator = { $in: operator.split(',') }
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
        // if(isUnlimitedCalls) filter.isUnlimitedCalls = isUnlimitedCalls === 'true'
        // if(isUnlimitedSMS) filter.isUnlimitedSMS = isUnlimitedSMS === 'true'
        
        const plansData = await Plans.find(filter);
        if(plansData.length === 0) throw new Error("No Plans Exist");

        const plansWithYearly = plansData.map((plan) => yearlyPlan(plan))

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

export const getSinglePlan = async (req, res) => {
    try {
        const planId = req.params.id;

        if(!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan Id")

        const planData = await Plans.findById(planId)

        if(!planData) throw new Error("Plan does not exist")

        const plansWithYearly = yearlyPlan(planData)

        res.status(200).json({
            success: true,
            message: "Plan Fetched",
            plan: plansWithYearly
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const comparePlans = async (req, res) => {
    try {
        if(!req.query.planIds) throw new Error("No Plan IDs provided")

        const planIds = req.query.planIds.split(',');
        
        for(const planId of planIds){
            if(!mongoose.Types.ObjectId.isValid(planId))
                throw new Error("Inavalid Plan ID")
        }

        const plansData = await Plans.find({ _id: {$in: planIds}})
        if(plansData.length === 0) throw new Error("No Plans Exist");

        const plansWithYearly = plansData.map((plan) => yearlyPlan(plan));
        
        res.status(200).json({
            success: true,
            message: "Successfully fetched all compare plans",
            comparePlans: plansWithYearly
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}