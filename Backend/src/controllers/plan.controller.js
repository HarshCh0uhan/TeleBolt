import {Plans} from "../models/plans.js"
import { PriceHistory } from "../models/priceHistory.js";
import { PlanSubmission } from "../models/planSubmission.js";
import { yearlyPlan } from "../utils/yearlyPlan.js";
import { validatePlans } from "../utils/validations.js";
import { rankPlans, findOtherPlans, RANKING_FORMATS, DEFAULT_FORMAT } from "../utils/ranking.js";
import mongoose from "mongoose"

// Shared by getPlans and getRankings so a filter means the same thing on both.
const buildPlanFilter = (query) => {
    const {operator, category, minPrice, maxPrice, minValidity, maxValidity, ottApps,
        dailyData, minData, maxData} = query;

    const filter = { isActive: true };

    if(operator) filter.operator = { $in: operator.split(',') }
    if(category) filter.category = category
    if(ottApps) filter.ottApps = { $in: ottApps.split(',') }
    if(minPrice || maxPrice){
        filter.price = {}
        if(minPrice) filter.price.$gte = Number(minPrice)
        if(maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if(minValidity || maxValidity){
        filter.validityDays = {}
        if(minValidity) filter.validityDays.$gte = Number(minValidity)
        if(maxValidity) filter.validityDays.$lte = Number(maxValidity)
    }
    if(dailyData) filter.dailyData = Number(dailyData)
    if(minData || maxData) {
        filter.totalData = {}
        if(minData) filter.totalData.$gte = Number(minData)
        if(maxData) filter.totalData.$lte = Number(maxData)
    }
    return filter;
}

export const getPlans = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const filter = buildPlanFilter(req.query);

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [plansData, total] = await Promise.all([
            Plans.find(filter).skip(skip).limit(limitNum).lean(),
            Plans.countDocuments(filter)
        ]);

        const plansWithYearly = plansData.map((plan) => yearlyPlan(plan))

        res.status(200).json({
            success: true,
            message: "All Plans Fetched Successfully",
            plans: plansWithYearly,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
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

        const planIds = req.query.planIds.split(',').map((id) => id.trim()).filter(Boolean);
        const uniquePlanIds = [...new Set(planIds)];

        if(uniquePlanIds.length < 2) throw new Error("Select at least 2 distinct plans to compare")
        if(uniquePlanIds.length > 3) throw new Error("You can compare at most 3 plans")
        
        for(const planId of uniquePlanIds){
            if(!mongoose.Types.ObjectId.isValid(planId))
                throw new Error("Invalid Plan ID")
        }

        const plansData = await Plans.find({ _id: {$in: uniquePlanIds}, isActive: true })
        if(plansData.length < 2) throw new Error("At least 2 active plans are required to compare");

        // Mongo does not preserve $in order – keep the order the client selected.
        const requestedOrder = new Map(uniquePlanIds.map((id, index) => [id, index]));
        const plansWithYearly = plansData
            .sort((a, b) => requestedOrder.get(a._id.toString()) - requestedOrder.get(b._id.toString()))
            .map((plan) => yearlyPlan(plan));
        
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

export const getPriceHistory = async (req, res) => {
    try {
        const planId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(planId)) throw new Error("Invalid Plan ID");

        const history = await PriceHistory.find({planId}).sort({createdAt: -1})

        res.status(200).json({
            success: true,
            history
        });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message);
    }
}

export const submitPlan = async (req, res) => {
    try {
        const {operator, category, price, validityDays, dailyData, totalData, sms,
            isUnlimitedCalls, isUnlimitedSMS, ottApps, note} = req.body;

        validatePlans({ operator, category, price, validityDays });

        const priceNum = Number(price);
        const validityNum = Number(validityDays);

        const submission = await PlanSubmission.create({
            operator,
            category,
            price: priceNum,
            validityDays: validityNum,
            dailyData: dailyData ? Number(dailyData) : undefined,
            totalData: totalData ? Number(totalData) : (dailyData && validityNum ? Number(dailyData) * validityNum : undefined),
            sms: sms ? Number(sms) : undefined,
            isUnlimitedCalls: isUnlimitedCalls !== false,
            isUnlimitedSMS: isUnlimitedSMS === true,
            ottApps: Array.isArray(ottApps) ? ottApps : [],
            note: typeof note === "string" ? note.slice(0, 500) : "",
            submittedBy: req.user._id
        })

        res.status(201).json({
            success: true,
            message: "Plan submitted for review",
            submission
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const getRankingFormats = (req, res) => {
    res.status(200).json({
        success: true,
        formats: RANKING_FORMATS.map(({ id, label, blurb }) => ({ id, label, blurb })),
        defaultFormat: DEFAULT_FORMAT,
    })
}

export const getRankings = async (req, res) => {
    try {
        const { format, ottApps: ottQuery, limit } = req.query;
        const filter = buildPlanFilter(req.query);

        const plansData = await Plans.find(filter).lean();

        const requestedOtt = ottQuery
            ? ottQuery.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        const rankings = rankPlans(plansData, {
            formatId: format || DEFAULT_FORMAT,
            ottApps: requestedOtt,
        });

        const otherPlans = findOtherPlans(plansData, { ottApps: requestedOtt });

        const capped = limit ? rankings.slice(0, Math.max(1, Number(limit))) : rankings;

        res.status(200).json({
            success: true,
            message: "Rankings fetched successfully",
            format: format || DEFAULT_FORMAT,
            total: rankings.length,
            rankings: capped,
            otherPlans,
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}