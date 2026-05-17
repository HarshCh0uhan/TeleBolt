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