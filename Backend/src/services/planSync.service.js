import { Plans } from "../models/plans.js";
import { DetectedChange } from "../models/detectedChange.js";
import { PlanSyncRun } from "../models/planSyncRun.js";
import { DEFAULT_SOURCES, getPlanSource } from "./planSources/index.js";
import { SourceNotConfiguredError, SourceUnavailableError } from "./planSources/errors.js";
import { diffPlanFields } from "./planSources/matching.js";
import { sendSyncSummaryEmail } from "./email.service.js";

const MAX_NEW_PER_RUN = Number(process.env.SYNC_MAX_NEW_PER_RUN || 200);

const bundleQuery = (plan, sourceName) => ({
    operator: plan.operator,
    validityDays: plan.validityDays,
    $and: [
        {
            $or: [
                { sourceRef: "" },
                { sourceRef: { $exists: false } },
                { source: { $ne: sourceName } },
            ],
        },
        plan.dailyData
            ? { dailyData: plan.dailyData }
            : { $or: [{ dailyData: null }, { dailyData: { $exists: false } }] },
        plan.totalData
            ? { totalData: plan.totalData }
            : { $or: [{ totalData: null }, { totalData: { $exists: false } }] },
    ],
});

const findMatch = async (plan, sourceName) => {
    const exact = await Plans.findOne({ source: sourceName, sourceRef: plan.sourceRef });
    if (exact) return { plan: exact, matchedBy: "sourceRef" };

    const bundle = await Plans.findOne(bundleQuery(plan, sourceName));
    if (bundle) return { plan: bundle, matchedBy: "bundle" };

    return { plan: null, matchedBy: null };
};

const proposalExists = (filter) => DetectedChange.exists({ ...filter, status: "Pending" });

const syncSource = async (sourceName, { maxNew = MAX_NEW_PER_RUN, dryRun = false } = {}) => {
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
        notes: [],
    };

    let fetched;
    try {
        fetched = await source.fetch();
    } catch (err) {
        if (err instanceof SourceNotConfiguredError || err instanceof SourceUnavailableError) {
            result.status = "Skipped";
            result.message = err.message;
            return result;
        }
        result.status = "Failed";
        result.message = err.message;
        result.notes.push(err.message);
        return result;
    }

    const plans = fetched.plans;
    result.fetched = plans.length;
    if (fetched.meta?.malformed) {
        result.message = `${fetched.meta.malformed} record(s) could not be parsed`;
    }

    let newThisRun = 0;
    const proposedThisRun = new Set();

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

            if (!dryRun) {
                await DetectedChange.create({
                    field: "NewPlan",
                    snapshot: plan,
                    source: sourceName,
                    sourceRef: plan.sourceRef,
                    status: "Pending",
                });
            }

            newThisRun += 1;
            result.newPlans += 1;
            continue;
        }

        if (!existing.sourceRef && !dryRun) {
            existing.source = sourceName;
            existing.sourceRef = plan.sourceRef;
            if (!existing.sourceUrl && plan.sourceUrl) existing.sourceUrl = plan.sourceUrl;
            await existing.save();
            result.adopted += 1;
        } else if (!existing.sourceRef && dryRun) {
            result.adopted += 1;
        }

        let changed = 0;
        for (const { field, oldValue, newValue } of diffPlanFields(existing, plan)) {
            const alreadyProposed =
                proposedThisRun.has(`${existing._id}:${field}`) ||
                (await proposalExists({ planId: existing._id, field, source: sourceName }));
            if (alreadyProposed) continue;

            proposedThisRun.add(`${existing._id}:${field}`);

            if (!dryRun) {
                await DetectedChange.create({
                    planId: existing._id,
                    field,
                    oldValue,
                    newValue,
                    source: sourceName,
                    sourceRef: plan.sourceRef,
                    status: "Pending",
                });
            }
            changed += 1;
        }

        if (changed > 0) result.changes += changed;
        else result.unchanged += 1;

        if (matchedBy !== "sourceRef") {
            result.notes.push(`matched ${plan.sourceRef} to an existing plan with an identical bundle`);
        }
    }

    const fetchedRefs = plans.map((plan) => plan.sourceRef);
    result.missingFromSource = await Plans.countDocuments({
        source: sourceName,
        isActive: true,
        sourceRef: { $nin: fetchedRefs },
    });

    if (result.skipped > 0 && result.newPlans >= maxNew) {
        result.message = [
            result.message,
            `${result.skipped} plan(s) were left for the next run because the per-run cap of ${maxNew} new plans was reached.`,
        ]
            .filter(Boolean)
            .join(" ");
    } else if (result.skipped > 0 && result.message) {
        result.status = "Partial";
    }

    return result;
};

export const runPlanSync = async ({
    sources = DEFAULT_SOURCES,
    trigger = "cron",
    triggeredBy = null,
    dryRun = false,
    maxNew,
} = {}) => {
    const startedAt = new Date();
    const results = [];

    for (const sourceName of sources) {
        try {
            results.push(await syncSource(sourceName, dryRun ? { dryRun: true, maxNew } : { maxNew }));
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
                notes: [err.message],
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

    const runData = {
        trigger,
        status,
        startedAt,
        finishedAt,
        durationMs: finishedAt - startedAt,
        totals,
        sources: results,
        triggeredBy,
    };

    if (dryRun) return { run: { ...runData, dryRun: true }, results, totals, status };

    const run = await PlanSyncRun.create(runData);

    // Notify the admin only when something actually needs review.
    try {
        await sendSyncSummaryEmail({ status, totals, sources: results });
    } catch (err) {
        console.error("Sync summary email failed: ", err.message);
    }

    return { run, results, totals, status };
};
