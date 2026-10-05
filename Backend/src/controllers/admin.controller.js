import mongoose from "mongoose";
import {Plans} from "../models/plans.js"
import { validatePlans } from "../utils/validations.js";
import { DetectedChange } from "../models/detectedChange.js";
import { PriceHistory } from "../models/priceHistory.js";
import { PlanSubmission } from "../models/planSubmission.js";
import { AuditLog } from "../models/auditLog.js";
import { User } from "../models/user.js";
import { logAudit } from "../services/audit.service.js";
import { PlanSyncRun } from "../models/planSyncRun.js";
import { runPlanSync } from "../services/planSync.service.js";
import { DEFAULT_SOURCES, getPlanSource, listPlanSources } from "../services/planSources/index.js";

export const getAllPlans = async (req, res) => {
     try {
        const plans = await Plans.find()
        res.status(200).json({
            success: true,
            plans
        })
    } catch(err) {
        console.error("Error: ", err.message)
        res.status(400).json({ message: err.message })
    }
}

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

        await logAudit({actor: req.user, action: "create_plan", entity: "Plan", entityId: plan._id, details: `${operator} ₹${price} (${category})`})

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

        const update = await Plans.findByIdAndUpdate(planId, updateData, {returnDocument: 'after'})
        if(!update) throw new Error("Plan does not exist")

        await logAudit({actor: req.user, action: "update_plan", entity: "Plan", entityId: planId, details: `${update.operator} ₹${update.price}`})

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

        await logAudit({actor: req.user, action: "delete_plan", entity: "Plan", entityId: planId, details: `${deletePlan.operator} ₹${deletePlan.price}`})

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
        const changes = await DetectedChange.find()
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

// Scalar fields a sync proposal can apply straight onto a plan.
const APPLICABLE_FIELDS = {
    Price: "price",
    ValidityDays: "validityDays",
    DailyData: "dailyData",
    TotalData: "totalData",
    Sms: "sms",
};

export const approveChange = async(req, res) => {
    try {
        const detectedChangeId = req.params.id
        if(!mongoose.Types.ObjectId.isValid(detectedChangeId))
            throw new Error("Invalid Id")

        const change = await DetectedChange.findById(detectedChangeId)
        if(!change) throw new Error("Change does not exist")
        if(change.status !== 'Pending') throw new Error("Change is not in pending state")

        // A brand new pack proposed by the sync service or a contributor.
        if(change.field === 'NewPlan'){
            const snapshot = change.snapshot || {}
            const created = await Plans.create({
                operator: snapshot.operator,
                category: snapshot.category,
                price: snapshot.price,
                validityDays: snapshot.validityDays,
                dailyData: snapshot.dailyData,
                totalData: snapshot.totalData,
                sms: snapshot.sms,
                isUnlimitedCalls: snapshot.isUnlimitedCalls,
                isUnlimitedSMS: snapshot.isUnlimitedSMS,
                ottApps: snapshot.ottApps || [],
                isActive: true,
                source: change.source || "manual",
                sourceRef: change.sourceRef || "",
            })

            change.status = "Approved"
            change.planId = created._id
            await change.save()

            await logAudit({actor: req.user, action: "approve_new_plan", entity: "Plan", entityId: created._id, details: `${created.operator} ₹${created.price} (${created.validityDays} days) via ${change.source}`})

            return res.status(200).json({
                success: true,
                message: "New plan added to the catalogue",
                newPlan: created
            })
        }

        const plan = await Plans.findById(change.planId);
        if(!plan) throw new Error("Plan does not exist")

        const path = APPLICABLE_FIELDS[change.field]
        if(!path) throw new Error("Unsupported change type")

        const newPlan = await Plans.findByIdAndUpdate(change.planId, {[path]: change.newValue}, {returnDocument: 'after'})

        // Only a real price change with a known previous value is historic.
        if(change.field === 'Price' && change.oldValue != null && change.newValue != null){
            await PriceHistory.create({
                planId: change.planId,
                oldPrice: change.oldValue,
                newPrice: change.newValue
            })
        }

        await DetectedChange.findByIdAndUpdate(detectedChangeId, {status: "Approved"}, {returnDocument: 'after'})

        await logAudit({actor: req.user, action: "approve_change", entity: "DetectedChange", entityId: detectedChangeId, details: `${change.field}: ${change.oldValue} → ${change.newValue}`})

        res.status(200).json({
            success: true,
            message: "Change approved successfully",
            newPlan
        })

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const rejectChange = async (req, res) => {
    try {
        const detectedChangeId = req.params.id
        if(!mongoose.Types.ObjectId.isValid(detectedChangeId))
            throw new Error("Invalid Id")
        
        const change = await DetectedChange.findById(detectedChangeId)
        if(!change) throw new Error("Change does not exist")
        if(change.status !== 'Pending') throw new Error("Change is not in pending state")

        // NewPlan proposals only get a planId once they are approved.
        if (change.planId) {
            const plan = await Plans.findById(change.planId);
            if(!plan) throw new Error("Plan does not exist")
        }

        await DetectedChange.findByIdAndUpdate(detectedChangeId, {status: "Rejected"})

        await logAudit({actor: req.user, action: "reject_change", entity: "DetectedChange", entityId: detectedChangeId, details: `${change.field}: ${change.oldValue} → ${change.newValue}`})

        res.status(200).json({
            success: true,
            message: "Change Rejected"
        })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(400).json(err.message)
    }
}

export const getStats = async (req, res) => {
    try {
        const [
            totalPlans, activePlans,
            operatorBreakdown, categoryBreakdown,
            pendingDetected, approvedDetected, rejectedDetected,
            priceHistoryCount,
            pendingSubmissions, approvedSubmissions, rejectedSubmissions,
            usersCount,
            recentAudit
        ] = await Promise.all([
            Plans.countDocuments(),
            Plans.countDocuments({ isActive: true }),
            Plans.aggregate([{ $group: { _id: "$operator", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            Plans.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            DetectedChange.countDocuments({ status: "Pending" }),
            DetectedChange.countDocuments({ status: "Approved" }),
            DetectedChange.countDocuments({ status: "Rejected" }),
            PriceHistory.countDocuments(),
            PlanSubmission.countDocuments({ status: "Pending" }),
            PlanSubmission.countDocuments({ status: "Approved" }),
            PlanSubmission.countDocuments({ status: "Rejected" }),
            User.countDocuments(),
            AuditLog.find().sort({ createdAt: -1 }).limit(8).populate("actor", "username email").lean()
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalPlans,
                activePlans,
                inactivePlans: totalPlans - activePlans,
                operators: operatorBreakdown,
                categories: categoryBreakdown,
                detectedChanges: { pending: pendingDetected, approved: approvedDetected, rejected: rejectedDetected },
                priceHistoryCount,
                submissions: { pending: pendingSubmissions, approved: approvedSubmissions, rejected: rejectedSubmissions },
                usersCount,
                recentAudit
            }
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const getAuditLogs = async (req, res) => {
    try {
        const { action, entity, actor, limit = "50", skip = "0" } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (entity) filter.entity = entity;
        if (actor) filter.actor = actor;

        const limitNum = Math.min(Number(limit) || 50, 100);
        const skipNum = Math.max(Number(skip) || 0, 0);

        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skipNum)
                .limit(limitNum)
                .populate("actor", "username email")
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            logs,
            total,
            hasMore: skipNum + logs.length < total
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const getSubmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const submissions = await PlanSubmission.find(filter)
            .sort({ createdAt: -1 })
            .populate("submittedBy", "username email")
            .populate("reviewedBy", "username email")
            .lean();

        res.status(200).json({
            success: true,
            submissions
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const approveSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(submissionId)) throw new Error("Invalid Id")

        const submission = await PlanSubmission.findById(submissionId)
        if (!submission) throw new Error("Submission does not exist")
        if (submission.status !== "Pending") throw new Error("Submission is not pending")

        const plan = await Plans.create({
            operator: submission.operator,
            category: submission.category,
            price: submission.price,
            validityDays: submission.validityDays,
            dailyData: submission.dailyData,
            totalData: submission.totalData,
            sms: submission.sms,
            isUnlimitedCalls: submission.isUnlimitedCalls,
            isUnlimitedSMS: submission.isUnlimitedSMS,
            ottApps: submission.ottApps,
            isActive: true
        })

        submission.status = "Approved";
        submission.reviewedBy = req.user._id;
        await submission.save();

        await logAudit({actor: req.user, action: "approve_submission", entity: "PlanSubmission", entityId: submission._id, details: `${submission.operator} ₹${submission.price} → plan created`})

        res.status(200).json({
            success: true,
            message: "Submission approved and plan created",
            plan
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const rejectSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(submissionId)) throw new Error("Invalid Id")

        const submission = await PlanSubmission.findById(submissionId)
        if (!submission) throw new Error("Submission does not exist")
        if (submission.status !== "Pending") throw new Error("Submission is not pending")

        submission.status = "Rejected";
        submission.reviewedBy = req.user._id;
        submission.reviewNote = typeof req.body?.reviewNote === "string" ? req.body.reviewNote : "";
        await submission.save();

        await logAudit({actor: req.user, action: "reject_submission", entity: "PlanSubmission", entityId: submission._id, details: `${submission.operator} ₹${submission.price}`})

        res.status(200).json({
            success: true,
            message: "Submission rejected"
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const getPlanSyncSources = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            sources: listPlanSources(),
            defaults: DEFAULT_SOURCES,
            cron: process.env.SYNC_CRON || "0 3 * * *",
            timezone: process.env.SYNC_TIMEZONE || "Asia/Kolkata",
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const triggerPlanSync = async (req, res) => {
    try {
        const requested = Array.isArray(req.body?.sources) && req.body.sources.length > 0
            ? req.body.sources
            : DEFAULT_SOURCES

        const sources = requested.filter((name) => getPlanSource(name))
        if (sources.length === 0) throw new Error("No valid plan sources requested")

        const { run, results, totals, status } = await runPlanSync({
            sources,
            trigger: "admin",
            triggeredBy: req.user._id,
        })

        await logAudit({
            actor: req.user,
            action: "run_plan_sync",
            entity: "PlanSyncRun",
            entityId: run._id,
            details: `${status}: fetched=${totals.fetched} new=${totals.newPlans} changes=${totals.changes}`,
        })

        res.status(200).json({
            success: true,
            message: `Plan sync finished (${status})`,
            run,
            results,
            totals,
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const getPlanSyncRuns = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 50)

        const runs = await PlanSyncRun.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()

        res.status(200).json({
            success: true,
            runs
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}