import { Plans } from "../models/plans.js";
import { DetectedChange } from "../models/detectedChange.js";
import { PlanSyncRun } from "../models/planSyncRun.js";
import { DEFAULT_SOURCES, getPlanSource } from "./planSources/index.js";
import { SourceNotConfiguredError } from "./planSources/errors.js";

// Safety valve so a first run cannot flood the review queue.
const MAX_NEW_PER_RUN = Number(process.env.SYNC_MAX_NEW_PER_RUN || 50);

const COMPARABLE_FIELDS = [
    { key: "price", field: "Price" },
    { key: "validityDays", field: "ValidityDays" },
    { key: "dailyData", field: "DailyData" },
    { key: "totalData", field: "TotalData" },
    { key: "sms", field: "Sms" },
];

const isNullish = (value) => value === undefined || value === null;

const sameNumber = (a, b) => {
    if (isNullish(a) && isNullish(b)) return true;
    if (isNullish(a) || isNullish(b)) return false;
    return Math.abs(Number(a) - Number(b)) < 0.005;
};

// Matches "no value" against either null or a missing field.
const dataClause = (plan) => ({
    $and: [
        plan.dailyData
            ? { dailyData: plan.dailyData }
            : { $or: [{ dailyData: null }, { dailyData: { $exists: false } }] },
        plan.totalData
            ? { totalData: plan.totalData }
            : { $or: [{ totalData: null }, { totalData: { $exists: false } }] },
    ],
});

/**
 * Finds the catalogue plan a source record refers to.
 *
 * Vi bakes the price into its plan ids (MH_0014_2399_MH_0014_2399), so a price
 * hike arrives as an unseen id. Matching therefore falls back to the plan's
 * shape – same data allowance, then same validity – which is what turns a hike
 * into a "Price" proposal instead of a duplicate new plan.
 */
const findMatch = async (plan, sourceName) => {
    const exact = await Plans.findOne({ source: sourceName, sourceRef: plan.sourceRef });
    if (exact) return { plan: exact, matchedBy: "sourceRef" };

    const shaped = { operator: plan.operator, ...dataClause(plan) };

    const sameValidity = await Plans.findOne({ ...shaped, validityDays: plan.validityDays });
    if (sameValidity) return { plan: sameValidity, matchedBy: "shape" };

    const anyValidity = await Plans.findOne(shaped).sort({ createdAt: 1 });
    if (anyValidity) return { plan: anyValidity, matchedBy: "shape-validity" };

    return { plan: null, matchedBy: null };
};

// Avoids raising an identical proposal twice while one is still pending.
const proposalExists = (filter) => DetectedChange.exists({ ...filter, status: "Pending" });

const syncSource = async (sourceName, { maxNew = MAX_NEW_PER_RUN } = {}) => {
    const source = getPlanSource(sourceName);
    if (!source) throw new Error(`Unknown plan source "${sourceName}"`);

    const result = {
        source: sourceName,
        status: "Success",
        message: "",
        fetched: 0,
        newPlans: 0,
        changes: 0,
        unchanged: 0,
        skipped: 0,
        adopted: 0,
        missingFromSource: 0,
        errors: [],
    };

    let fetched;
    try {
        fetched = await source.fetch();
    } catch (err) {
        if (err instanceof SourceNotConfiguredError) {
            result.status = "Skipped";
            result.message = err.message;
            return result;
        }
        result.status = "Failed";
        result.message = err.message;
        result.errors.push(err.message);
        return result;
    }

    const plans = fetched.plans;
    result.fetched = plans.length;
    if (fetched.meta?.malformed) {
        result.message = `${fetched.meta.malformed} record(s) could not be parsed`;
    }

    let newThisRun = 0;

    for (const plan of plans) {
        const { plan: existing, matchedBy } = await findMatch(plan, sourceName);

        if (!existing) {
            if (newThisRun >= maxNew) {
                result.skipped += 1;
                continue;
            }

            if (await proposalExists({ field: "NewPlan", source: sourceName, sourceRef: plan.sourceRef })) {
                result.skipped += 1;
                continue;
            }

            await DetectedChange.create({
                field: "NewPlan",
                snapshot: plan,
                source: sourceName,
                sourceRef: plan.sourceRef,
                status: "Pending",
            });

            newThisRun += 1;
            result.newPlans += 1;
            continue;
        }

        // Link an existing catalogue plan to this source the first time we see it.
        if (!existing.sourceRef) {
            existing.source = sourceName;
            existing.sourceRef = plan.sourceRef;
            await existing.save();
            result.adopted += 1;
        }

        let changed = 0;
        for (const { key, field } of COMPARABLE_FIELDS) {
            const oldValue = existing[key];
            const newValue = plan[key];
            if (sameNumber(oldValue, newValue)) continue;

            const duplicate = await proposalExists({
                planId: existing._id,
                field,
                source: sourceName,
                newValue: isNullish(newValue) ? null : Number(newValue),
            });
            if (duplicate) continue;

            await DetectedChange.create({
                planId: existing._id,
                field,
                oldValue: isNullish(oldValue) ? null : Number(oldValue),
                newValue: isNullish(newValue) ? null : Number(newValue),
                source: sourceName,
                sourceRef: plan.sourceRef,
                status: "Pending",
            });
            changed += 1;
        }

        if (changed > 0) result.changes += changed;
        else result.unchanged += 1;

        if (matchedBy !== "sourceRef") {
            result.errors.push(
                `matched ${plan.sourceRef} to an existing plan by ${matchedBy === "shape" ? "data + validity" : "data alone"}`
            );
        }
    }

    // Plans we previously imported from this source that are no longer offered.
    const fetchedRefs = plans.map((plan) => plan.sourceRef);
    result.missingFromSource = await Plans.countDocuments({
        source: sourceName,
        isActive: true,
        sourceRef: { $nin: fetchedRefs },
    });

    if (result.skipped > 0 && result.message) {
        result.status = "Partial";
    }

    return result;
};

/**
 * Runs every requested source, records the run, and returns a summary.
 * Never throws: a failing source is reported on its own result row.
 */
export const runPlanSync = async ({ sources = DEFAULT_SOURCES, trigger = "cron", triggeredBy = null } = {}) => {
    const startedAt = new Date();
    const results = [];

    for (const sourceName of sources) {
        try {
            results.push(await syncSource(sourceName));
        } catch (err) {
            results.push({
                source: sourceName,
                status: "Failed",
                message: err.message,
                fetched: 0,
                newPlans: 0,
                changes: 0,
                unchanged: 0,
                skipped: 0,
                adopted: 0,
                missingFromSource: 0,
                errors: [err.message],
            });
        }
    }

    const finishedAt = new Date();
    const totals = results.reduce(
        (acc, row) => ({
            fetched: acc.fetched + row.fetched,
            newPlans: acc.newPlans + row.newPlans,
            changes: acc.changes + row.changes,
            unchanged: acc.unchanged + row.unchanged,
            skipped: acc.skipped + row.skipped,
        }),
        { fetched: 0, newPlans: 0, changes: 0, unchanged: 0, skipped: 0 }
    );

    const statuses = results.map((row) => row.status);
    const status = statuses.every((s) => s === "Failed")
        ? "Failed"
        : statuses.every((s) => s === "Success")
          ? "Success"
          : "Partial";

    const run = await PlanSyncRun.create({
        trigger,
        status,
        startedAt,
        finishedAt,
        durationMs: finishedAt - startedAt,
        totals,
        sources: results,
        triggeredBy,
    });

    return { run, results, totals, status };
};
