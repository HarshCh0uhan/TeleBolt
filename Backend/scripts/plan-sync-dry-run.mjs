/**
 * Checks the plan sources without changing anything.
 *
 *   node scripts/plan-sync-dry-run.mjs            # fetch + normalise only (no database)
 *   node scripts/plan-sync-dry-run.mjs vi-sync    # one source
 *   node scripts/plan-sync-dry-run.mjs --db       # full engine dry run against the configured database
 *
 * The `--db` form runs the real matcher and diff logic and reports exactly what
 * the next sync would propose, but writes no proposals and records no run.
 */
import { listPlanSources, getPlanSource } from "../src/services/planSources/index.js";
import { SourceNotConfiguredError } from "../src/services/planSources/errors.js";

const args = process.argv.slice(2);
const useDb = args.includes("--db");
const requested = args.filter((arg) => !arg.startsWith("-"));
const sourceNames = requested.length > 0 ? requested : listPlanSources().map((source) => source.name);

let failed = 0;

// ── Database-backed dry run: exercises the real sync engine ────────────────
if (useDb) {
    const { default: mongoose } = await import("mongoose");
    const { default: dotenv } = await import("dotenv");
    const { runPlanSync } = await import("../src/services/planSync.service.js");

    dotenv.config();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected - dry run, nothing will be written\n");

    const { results, totals, status } = await runPlanSync({
        sources: sourceNames,
        trigger: "admin",
        dryRun: true,
    });

    for (const row of results) {
        console.log(`=== ${row.source}  [${row.status}]`);
        if (row.message) console.log(`  note      ${row.message}`);
        console.log(`  fetched   ${row.fetched}`);
        console.log(`  new plans ${row.newPlans}`);
        console.log(`  changes   ${row.changes}`);
        console.log(`  unchanged ${row.unchanged}`);
        console.log(`  capped    ${row.skipped}`);
        console.log(`  adoptable ${row.adopted}`);
        console.log(`  stale     ${row.missingFromSource}`);
        row.notes.slice(0, 5).forEach((note) => console.log(`  info      ${note}`));
    }

    console.log(
        `\nTOTAL fetched=${totals.fetched} new=${totals.newPlans} changes=${totals.changes} ` +
        `unchanged=${totals.unchanged} skipped=${totals.skipped}`
    );
    console.log(`run status: ${status} (dry run - no proposals created, no run recorded)`);

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

// ── Source-only dry run: fetch and normalise ───────────────────────────────
for (const name of sourceNames) {
    const source = getPlanSource(name);
    if (!source) {
        console.log(`\n=== ${name}\n  UNKNOWN source - check the registry in services/planSources/index.js`);
        failed += 1;
        continue;
    }

    console.log(`\n=== ${source.label}`);
    const startedAt = Date.now();

    try {
        const { plans, meta } = await source.fetch();
        const daily = plans.filter((plan) => plan.category === "Daily").length;
        const cheapest = [...plans].sort((a, b) => a.price - b.price)[0];
        const bestPerGb = plans
            .filter((plan) => plan.totalData)
            .sort((a, b) => a.price / a.totalData - b.price / b.totalData)[0];

        console.log(`  OK       ${plans.length} plans in ${Date.now() - startedAt}ms`);
        console.log(`  meta     ${JSON.stringify(meta)}`);
        console.log(`  split    ${daily} daily / ${plans.length - daily} non-daily`);
        if (cheapest) console.log(`  cheapest ₹${cheapest.price} for ${cheapest.validityDays} days`);
        if (bestPerGb) {
            console.log(`  best/GB  ₹${(bestPerGb.price / bestPerGb.totalData).toFixed(2)} (${bestPerGb.sourceRef})`);
        }
        console.log("  samples");
        plans.slice(0, 3).forEach((plan) => {
            console.log(
                `    - ${plan.operator} ₹${plan.price} ${plan.validityDays}d ` +
                `daily=${plan.dailyData ?? "-"} total=${plan.totalData ?? "-"} ${plan.category}`
            );
        });
    } catch (err) {
        if (err instanceof SourceNotConfiguredError) {
            console.log("  SKIPPED  needs credentials");
            console.log(`           ${err.message}`);
        } else {
            console.log(`  FAILED   ${err.message}`);
            failed += 1;
        }
    }
}

console.log(`\nDry run complete - ${failed} source(s) failed.`);
process.exitCode = failed > 0 ? 1 : 0;
