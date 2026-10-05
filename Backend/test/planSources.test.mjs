import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
    normalizeViPlan,
    parseViPlans,
    extractViPayload,
} from "../src/services/planSources/vi.source.js";
import { normalizeBsnlPlan } from "../src/services/planSources/bsnl.source.js";
import {
    buildPlan,
    parseValidityDays,
    parseDataText,
    parseSms,
    mbToGb,
} from "../src/services/planSources/normalize.js";
import { listPlanSources } from "../src/services/planSources/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const readFixture = (name) => JSON.parse(readFileSync(path.join(here, "fixtures", name), "utf8"));

// The Vi fixture holds real records captured from myvi.in's embedded catalogue.
const viFixture = readFixture("vi-plans.json");
// BSNL's fixture is modelled on the field names documented in BSNL's own JS
// bundle; the live shape still needs a session cookie to verify.
const bsnlFixture = readFixture("bsnl-plans.synthetic.json");

test("parseValidityDays understands days, months, years and bare numbers", () => {
    assert.equal(parseValidityDays("180 Days"), 180);
    assert.equal(parseValidityDays("28 Days"), 28);
    assert.equal(parseValidityDays("1 Month"), 30);
    assert.equal(parseValidityDays("2 Months"), 60);
    assert.equal(parseValidityDays("1 Year"), 365);
    assert.equal(parseValidityDays("28"), 28);
    assert.equal(parseValidityDays(45), 45);
    assert.equal(parseValidityDays("Unlimited"), null);
    assert.equal(parseValidityDays(null), null);
});

test("parseDataText separates daily quotas from total allowances", () => {
    assert.deepEqual(parseDataText("1.5GB/Day"), { dailyGb: 1.5, totalGb: null });
    assert.deepEqual(parseDataText("2 GB/day"), { dailyGb: 2, totalGb: null });
    assert.deepEqual(parseDataText("10GB"), { dailyGb: null, totalGb: 10 });
    assert.deepEqual(parseDataText("Unlimited"), { dailyGb: null, totalGb: null });
});

test("parseSms reads counts and unlimited flags", () => {
    assert.deepEqual(parseSms("100 SMS/Day"), { sms: 100, unlimitedSms: false });
    assert.deepEqual(parseSms("300 SMS"), { sms: 300, unlimitedSms: false });
    assert.deepEqual(parseSms("Unlimited SMS"), { sms: null, unlimitedSms: true });
    assert.deepEqual(parseSms("No Outgoing SMS"), { sms: null, unlimitedSms: false });
});

test("mbToGb converts operator data allowances", () => {
    assert.equal(mbToGb("172032.0"), 168);
    assert.equal(mbToGb("10240"), 10);
    assert.equal(mbToGb(undefined), null);
});

test("buildPlan enforces the catalogue invariants", () => {
    const base = { operator: "VI", source: "vi-sync", sourceRef: "x", validityDays: 28, totalData: 10 };

    assert.equal(buildPlan({ ...base, price: 0 }), null, "price of 0 is rejected");
    assert.equal(buildPlan({ ...base, price: 199, validityDays: 400 }), null, "validity over a year is rejected");
    assert.equal(buildPlan({ ...base, price: 199, totalData: null, dailyData: null }), null, "plans need data");
    assert.equal(buildPlan({ ...base, price: 199, validityDays: null }), null, "validity is required");

    const daily = buildPlan({ ...base, price: 199, totalData: null, dailyData: 2 });
    assert.equal(daily.category, "Daily");
    assert.equal(daily.totalData, 56, "total data is derived from the daily quota");

    const explicit = buildPlan({ ...base, price: 199, dailyData: 2 });
    assert.equal(explicit.totalData, 10, "an explicit total is kept as given");
});

test("normalizeViPlan maps a real daily-quota pack", () => {
    const plan = normalizeViPlan(viFixture[0]);

    assert.equal(plan.operator, "VI");
    assert.equal(plan.source, "vi-sync");
    assert.equal(plan.sourceRef, "MH_0014_2399_MH_0014_2399");
    assert.equal(plan.price, 2399);
    assert.equal(plan.validityDays, 180);
    assert.equal(plan.dailyData, 1.5);
    assert.equal(plan.totalData, 168, "FUP total comes from DATAUSAGE_ATTR");
    assert.equal(plan.category, "Daily");
    assert.equal(plan.sms, 100);
    assert.equal(plan.isUnlimitedCalls, true);
});

test("normalizeViPlan maps an unlimited pack to a non-daily plan", () => {
    const plan = normalizeViPlan(viFixture[1]);

    assert.equal(plan.price, 399);
    assert.equal(plan.validityDays, 28);
    assert.equal(plan.dailyData, undefined);
    assert.equal(plan.totalData, 56);
    assert.equal(plan.category, "Non-Daily");
});

test("normalizeViPlan maps a total-data add-on", () => {
    const plan = normalizeViPlan(viFixture[2]);

    assert.equal(plan.price, 251);
    assert.equal(plan.validityDays, 30);
    assert.equal(plan.totalData, 10);
    assert.equal(plan.category, "Non-Daily");
});

test("normalizeViPlan skips rows without usable data", () => {
    // The roaming pack in the fixture carries no data allowance at all.
    assert.equal(normalizeViPlan(viFixture[3]), null);
    assert.equal(normalizeViPlan({ UNIT_COST: "199" }), null, "no plan id");
    assert.equal(normalizeViPlan({ ITEM_ID: "X", UNIT_COST: "199", VALIDITY_ATTR: "28" }), null, "no data");
    assert.equal(normalizeViPlan({ ...viFixture[0], STATUS: "FAILURE" }), null, "failed status");
});

test("parseViPlans extracts, normalises and de-duplicates records", () => {
    const record = {
        UNIT_COST: "199",
        ITEM_ID: "MH_0014_199_MH_0014_199",
        VALIDITY_ATTR: "28.0",
        "WEB-VALIDITY": "28 Days",
        DATA_LINE_1: "1GB/Day",
        SMS_LINE_1: "100 SMS/Day",
        VOICE_LINE_1: "Unlimited",
        STATUS: "SUCCESS",
    };

    // Mirrors the escaping Next.js uses inside self.__next_f.push chunks.
    const escape = (value) => JSON.stringify(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const html = `<script>self.__next_f.push([1,"${escape(record)}"])</script>` +
        `<script>self.__next_f.push([1,"${escape(record)}"])</script>`;

    const payload = extractViPayload(html);
    const { plans, malformed } = parseViPlans(payload);

    assert.equal(malformed, 0);
    assert.equal(plans.length, 1, "duplicate source refs collapse to one plan");
    assert.equal(plans[0].sourceRef, "MH_0014_199_MH_0014_199");
    assert.equal(plans[0].dailyData, 1);
});

test("normalizeBsnlPlan maps BSNL tariff rows", () => {
    const combo = normalizeBsnlPlan(bsnlFixture[0], { circle: "MH" });

    assert.equal(combo.operator, "BSNL");
    assert.equal(combo.source, "bsnl-sync");
    assert.equal(combo.sourceRef, "MH:BSNL_PRE_187", "ids are circle scoped");
    assert.equal(combo.price, 187);
    assert.equal(combo.validityDays, 28);
    assert.equal(combo.dailyData, 2);
    assert.equal(combo.category, "Daily");
    assert.equal(combo.sms, 100);

    const addOn = normalizeBsnlPlan(bsnlFixture[2], { circle: "MH" });
    assert.equal(addOn.totalData, 2);
    assert.equal(addOn.validityDays, 1);
    assert.equal(addOn.category, "Non-Daily");
});

test("normalizeBsnlPlan rejects rows it cannot identify", () => {
    assert.equal(normalizeBsnlPlan({}, { circle: "MH" }), null);
    assert.equal(normalizeBsnlPlan({ PLAN_ID: "X", MRP: "0" }, { circle: "MH" }), null);
});

test("the source registry exposes both operators", () => {
    const names = listPlanSources().map((source) => source.name);

    assert.ok(names.includes("vi-sync"));
    assert.ok(names.includes("bsnl-sync"));
});
