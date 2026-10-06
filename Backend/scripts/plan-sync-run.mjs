/**
 * Runs a real plan sync and records it, exactly as the admin "Run sync now"
 * button does.
 *
 *   node scripts/plan-sync-run.mjs                 # every source
 *   node scripts/plan-sync-run.mjs bsnl-sync       # one source
 *   node scripts/plan-sync-run.mjs --dry bsnl-sync # same checks, writes nothing
 *
 * Use this when the deployed backend cannot reach a source. BSNL drops
 * connections from the datacenter IPs Render uses, while a home connection in
 * India gets through - and this writes to the same database, so the proposals it
 * creates appear in the deployed review queue.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const requested = args.filter((arg) => !arg.startsWith("-"));

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
console.log(`connected${dryRun ? " (dry run - nothing will be written)" : ""}\n`);

const { runPlanSync } = await import("../src/services/planSync.service.js");
const { listPlanSources } = await import("../src/services/planSources/index.js");

const sources = requested.length > 0 ? requested : listPlanSources().map((source) => source.name);
console.log(`sources: ${sources.join(", ")}\n`);

const { results, totals, status } = await runPlanSync({ sources, trigger: "admin", dryRun });

for (const row of results) {
    console.log(`=== ${row.source}  [${row.status}]`);
    if (row.message) console.log(`  note      ${row.message}`);
    console.log(`  fetched   ${row.fetched}`);
    console.log(`  new plans ${row.newPlans}`);
    console.log(`  changes   ${row.changes}`);
    console.log(`  unchanged ${row.unchanged}`);
    console.log(`  capped    ${row.skipped}`);
    console.log(`  stale     ${row.missingFromSource}`);
    (row.notes || []).slice(0, 5).forEach((note) => console.log(`  info      ${note}`));
}

console.log(
    `\nTOTAL fetched=${totals.fetched} new=${totals.newPlans} changes=${totals.changes} unchanged=${totals.unchanged}`
);
console.log(`run status: ${status}`);

await mongoose.disconnect();
