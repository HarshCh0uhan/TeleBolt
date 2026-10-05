/**
 * Runs every plan source without touching the database.
 *
 *   node scripts/plan-sync-dry-run.mjs            # all sources
 *   node scripts/plan-sync-dry-run.mjs vi-sync    # one source
 *
 * Useful for checking whether an operator changed its page/API shape before the
 * nightly job runs against it.
 */
import { listPlanSources, getPlanSource } from "../src/services/planSources/index.js";
import { SourceNotConfiguredError } from "../src/services/planSources/errors.js";

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const sources = requested.length > 0 ? requested : listPlanSources().map((source) => source.name);

let failed = 0;

for (const name of sources) {
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
