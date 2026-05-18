import mongoose from "mongoose";
import {Plans} from "../models/plans.js"
import { validatePlans } from "../utils/validations.js";

export const createPlans = async (req, res) => {
    try {
        
        validatePlans(req.body)

        const {operator, category, price, validityDays, dailyData, 
        sms, isUnlimitedCalls, isUnlimitedSMS, ottApps, isActive} = req.body;
            
        let totalData = req.body.totalData
        if(dailyData && validityDays){
            totalData = dailyData * validityDays
        }

        const plan = await Plans.create({
            operator,
            category,
            price,
            validityDays,
            dailyData,
            totalData,
            sms,
            isUnlimitedCalls,
            isUnlimitedSMS,
            ottApps,
            isActive
        })

        res.status(201).json({
            success: true,
            message: "Plan Created Successfully",
            plan: plan
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const updatePlans = async (req, res) => {
    try {
        const planId = req.params.id;
        const updateData = req.body;
        if(!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan ID")
        
        const isPlanExist = await Plans.findById(planId);
        if(!isPlanExist) throw new Error("Plan does not exist")

        const update = await Plans.findByIdAndUpdate(planId, updateData, {new: true})

        res.status(200).json({
            success: true,
            message: "Plan Update Successful",
            plan: update
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const deletePlans = async (req, res) => {
    
}