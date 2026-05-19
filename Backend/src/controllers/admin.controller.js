import mongoose from "mongoose";
import {Plans} from "../models/plans.js"
import { validatePlans } from "../utils/validations.js";
import { DetectedChange } from "../models/detectedChange.js";
import { PriceHistory } from "../models/priceHistory.js";

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
        
        if(updateData.dailyData && updateData.validityDays){
            updateData.totalData = updateData.dailyData * updateData.validityDays
        }

        const update = await Plans.findByIdAndUpdate(planId, updateData, {new: true})
        if(!update) throw new Error("Plan does not exist")

        res.status(200).json({
            success: true,
            message: "Plan Update Successful",
            updatedPlan: update
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const deletePlans = async (req, res) => {
    try {
        const planId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(planId))
            throw new Error("Invalid Plan ID")

        
        const deletePlan = await Plans.findByIdAndDelete(planId);
        if(!deletePlan) throw new Error("Plan does not exist")

        res.status(200).json({
            success: true,
            message: "Plan Deleted Successfully"
        })
    } catch (err) {
        console.error(err.message);
        res.status(400).json(err.message)
    }
}

export const detectedChanges = async (req, res) => {
    try {
        const changes = await DetectedChange.find({status: 'Pending'})
        if(changes.length === 0) throw new Error("No changes detected")

        res.status(200).json({
            success: true,
            message: "Changes Detected Successfully",
            detectedChanges: changes
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const approveChange = async(req, res) => {
    try {
        const detectedChangeId = req.params.id
        if(!mongoose.Types.ObjectId.isValid(detectedChangeId))
            throw new Error("Invalid Plan Id")

        const change = await DetectedChange.findById(detectedChangeId)
        if(!change) throw new Error("Change does not exist")
        if(change.status !== 'Pending') throw new Error("Plan is not in pending state")
                
        const plan = await Plans.findById(change.planId);
        if(!plan) throw new Error("Plan does not exist")
            
        let newPlan
        let priceHistory
        if(change.field === 'Price' && plan.price === change.oldValue){
            newPlan = await Plans.findByIdAndUpdate(change.planId, {price: change.newValue})
            priceHistory = await PriceHistory.create({
                planId: change.planId,
                oldPrice: change.oldValue,
                newPrice: change.newValue
            })
        }
        else if(change.field === 'Validity Days' && plan.validityDays === change.oldValue){
            newPlan = await Plans.findByIdAndUpdate(change.planId, {validityDays: change.newValue}, {new: true})
        }
        else throw new Error("Invalid Old Value")

        await DetectedChange.findByIdAndUpdate(detectedChangeId, {status: "Approved"}, {new: true})
        
        res.status(200).json({
            success: true,
            message: "Changes Approve Successfuly",
            newPlan,
            priceHistory
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}