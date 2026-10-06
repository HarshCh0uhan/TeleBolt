/**
 * Prints recent plan-sync runs straight from the database.
 *
 *   node scripts/plan-sync-runs.mjs          # the last 5 runs
 *   node scripts/plan-sync-runs.mjs 20       # the last 20
 *
 * The admin UI shows the latest run, but this reaches the full history - useful
 * when a deployed sync behaves differently from a local one, since it shows each
 * source's status and message exactly as it was recorded.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

const limit = Number(process.argv.slice(2).find((arg) => /^\d+$/.test(arg)) || 5);

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const { PlanSyncRun } = await import("../src/models/planSyncRun.js");

const runs = await PlanSyncRun.find().sort({ createdAt: -1 }).limit(limit).lean();
console.log(`${runs.length} run(s)\n`);

for (const run of runs) {
    const when = run.createdAt ? new Date(run.createdAt).toISOString() : "unknown";
    console.log(`=== ${when}  trigger=${run.trigger}  status=${run.status}  ${run.durationMs || 0}ms`);

    for (const row of run.sources || []) {
        console.log(
            `  [${row.status}] ${row.source}  fetched=${row.fetched} new=${row.newPlans} ` +
            `changes=${row.changes} unchanged=${row.unchanged} skipped=${row.skipped} stale=${row.missingFromSource}`
        );
        if (row.message) console.log(`      ${row.message}`);
        for (const note of row.notes || []) console.log(`      note: ${note}`);
    }
}

await mongoose.disconnect();
