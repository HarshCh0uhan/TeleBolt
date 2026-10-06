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
import { normalizeBsnlPlan, extractSession } from "../src/services/planSources/bsnl.source.js";
import { normalizeJioPlan, EXCLUDED_CATEGORIES } from "../src/services/planSources/jio.source.js";
import {
    buildPlan,
    parseValidityDays,
    parseDataText,
    parseSms,
    mbToGb,
} from "../src/services/planSources/normalize.js";
import { listPlanSources } from "../src/services/planSources/index.js";
import { encryptCryptoJs, decryptCryptoJs, unwrapEncrypted } from "../src/services/planSources/cryptoJs.js";
import {
    isSameBundle,
    diffPlanFields,
    sameNumber,
} from "../src/services/planSources/matching.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const readFixture = (name) => JSON.parse(readFileSync(path.join(here, "fixtures", name), "utf8"));

// The Vi fixture holds real records captured from myvi.in's embedded catalogue.
const viFixture = readFixture("vi-plans.json");
// BSNL rows captured from the live recharge-plansnew response.
const bsnlFixture = readFixture("bsnl-plans.json");
// Jio rows captured from the live mdmdata recharge API.
const jioFixture = readFixture("jio-plans.json");

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

test("normalizeBsnlPlan maps real BSNL recharge rows", () => {
    // Rows captured from BSNL's own recharge-plansnew response.
    const combo = normalizeBsnlPlan(bsnlFixture[3], { circle: "Madhya Pradesh" });

    assert.equal(combo.operator, "BSNL");
    assert.equal(combo.source, "bsnl-sync");
    assert.equal(combo.sourceRef, "219", "the product id is the stable key");
    assert.equal(combo.price, 219);
    assert.equal(combo.validityDays, 28);
    assert.equal(combo.dailyData, 2);
    assert.equal(combo.totalData, 56, "derived from the daily quota");
    assert.equal(combo.category, "Daily");
    assert.equal(combo.sms, 100);
    assert.equal(combo.isUnlimitedCalls, true);

    const yearly = normalizeBsnlPlan(bsnlFixture[2], { circle: "Madhya Pradesh" });
    assert.equal(yearly.price, 2799);
    assert.equal(yearly.validityDays, 365);
    assert.equal(yearly.dailyData, 3);

    // A data voucher with no "/day" quota becomes a total-data plan.
    const voucher = normalizeBsnlPlan(bsnlFixture[0], { circle: "Madhya Pradesh" });
    assert.equal(voucher.validityDays, 7);
    assert.equal(voucher.dailyData, undefined);
    assert.equal(voucher.totalData, 8);
    assert.equal(voucher.category, "Non-Daily");
});

test("normalizeBsnlPlan rejects rows it cannot identify", () => {
    assert.equal(normalizeBsnlPlan({}, { circle: "Madhya Pradesh" }), null);
    assert.equal(normalizeBsnlPlan({ productId: "X", price: 0 }, { circle: "Madhya Pradesh" }), null);
});

test("the source registry exposes both operators", () => {
    const names = listPlanSources().map((source) => source.name);

    assert.ok(names.includes("vi-sync"));
    assert.ok(names.includes("bsnl-sync"));
});

test("normalizeJioPlan maps real Jio rows", () => {
    const yearly = normalizeJioPlan(jioFixture[0]);

    assert.equal(yearly.operator, "Jio");
    assert.equal(yearly.source, "jio-sync");
    assert.equal(yearly.sourceRef, "1033485");
    assert.equal(yearly.price, 3599);
    assert.equal(yearly.validityDays, 365);
    assert.equal(yearly.dailyData, 2.5);
    // Jio states 912.5GB total, which is exactly 2.5GB x 365.
    assert.equal(yearly.totalData, 912.5);
    assert.equal(yearly.category, "Daily");
    assert.equal(yearly.sms, 100);
    // JioTV and JioAICloud are in-house apps, not OTT brands, so nothing is claimed.
    assert.deepEqual(yearly.ottApps, []);
});

test("normalizeJioPlan reads a single-day data pack", () => {
    const pack = normalizeJioPlan(jioFixture[1]);

    assert.equal(pack.price, 19);
    assert.equal(pack.validityDays, 1);
    assert.equal(pack.dailyData, undefined, "no per-day quota is stated");
    assert.equal(pack.totalData, 1);
    assert.equal(pack.category, "Non-Daily");
});

test("normalizeJioPlan maps Jio's OTT bundles onto the schema enum", () => {
    const plan = normalizeJioPlan(jioFixture[3]);

    assert.equal(plan.price, 200);
    assert.equal(plan.validityDays, 28);
    assert.equal(plan.totalData, 30);
    // Only brands the schema knows about, in a stable order - Lionsgate Play,
    // YouTube Premium and JioTV are deliberately not claimed.
    assert.deepEqual(plan.ottApps, ["JioHotstar", "Prime", "SonyLiv", "Zee5"]);
});

test("normalizeJioPlan drops rows without quantifiable data", () => {
    // The JioShield plan states no GB figure at all, so it cannot be compared.
    assert.equal(normalizeJioPlan(jioFixture[2]), null);
    assert.equal(normalizeJioPlan({}), null);
    assert.equal(normalizeJioPlan({ id: "1", amount: "0" }), null);
});

test("Jio's voucher and roaming categories are excluded by default", () => {
    for (const category of ["Top-up Voucher", "International Roaming", "ISD", "JioSaavn Pro"]) {
        assert.ok(EXCLUDED_CATEGORIES.includes(category), `${category} should be excluded`);
    }
    for (const category of ["Popular Plans", "Annual Plans", "Data Packs", "True 5G Unlimited Plans"]) {
        assert.ok(!EXCLUDED_CATEGORIES.includes(category), `${category} is a real plan category`);
    }
});

test("BSNL session extraction survives runtimes without getSetCookie", () => {
    // Modern Node exposes the cookies separately.
    const modern = {
        getSetCookie: () => ["NEXT_LOCALE=en; Path=/", "bsnl_session=abc%3D%3D.def; Path=/; HttpOnly"],
        get: () => null,
    };
    assert.equal(extractSession(modern), "bsnl_session=abc%3D%3D.def");

    // Older runtimes only expose the combined header, comma separated.
    const legacy = { get: () => "NEXT_LOCALE=en; Path=/, bsnl_session=xyz.123; Path=/; HttpOnly" };
    assert.equal(extractSession(legacy), "bsnl_session=xyz.123");

    assert.equal(extractSession({ get: () => "other=1" }), null);
    assert.equal(extractSession({ get: () => null }), null);
});

test("cryptoJs matches the OpenSSL format BSNL expects", () => {
    const passphrase = "9a7b8e1f2c3d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b";
    const payload = JSON.stringify({ operatorCode: "BSNL", circleCode: "Madhya Pradesh" });

    const cipher = encryptCryptoJs(payload, passphrase);
    assert.ok(cipher.startsWith("U2FsdGVkX1"), "base64 of the literal Salted__ header");

    assert.equal(decryptCryptoJs(cipher, passphrase), payload, "round trips");
    assert.throws(() => decryptCryptoJs(cipher, "wrong-passphrase"), "a wrong passphrase fails");

    // Real captured response shape from BSNL.
    const wrapped = JSON.stringify({ enc: cipher });
    assert.deepEqual(unwrapEncrypted(wrapped, passphrase), JSON.parse(payload));
    assert.deepEqual(unwrapEncrypted(JSON.stringify({ ok: true }), passphrase), { ok: true });
});

test("sameNumber treats missing values as equal and compares with tolerance", () => {
    assert.equal(sameNumber(null, undefined), true);
    assert.equal(sameNumber(null, 0), false);
    assert.equal(sameNumber(1.5, 1.5), true);
    assert.equal(sameNumber(1.5000001, 1.5), true);
    assert.equal(sameNumber(10, 11), false);
});

test("isSameBundle matches only identical bundles", () => {
    const master = { operator: "VI", dailyData: 1.5, totalData: 42, validityDays: 28 };

    assert.equal(isSameBundle(master, { ...master, price: 999 }), true, "price is ignored on purpose");
    assert.equal(isSameBundle(master, { ...master, validityDays: 30 }), false);
    assert.equal(isSameBundle(master, { ...master, dailyData: 2 }), false);
    assert.equal(isSameBundle(master, { ...master, operator: "BSNL" }), false);
});

test("isSameBundle refuses the loose matches that produced bad proposals", () => {
    // Regression from a real dry run: a 365-day 10 GB pack was paired with a
    // 28-day one, so a ₹1599 plan looked like it had "changed" to ₹348.
    const yearPack = { operator: "VI", dailyData: null, totalData: 10, validityDays: 365 };
    const monthPack = { operator: "VI", dailyData: null, totalData: 10, validityDays: 28 };
    assert.equal(isSameBundle(yearPack, monthPack), false);

    // The same trap for daily packs: ₹219/22 days is not the ₹299/28 day pack.
    const d22 = { operator: "VI", dailyData: 1, totalData: 22, validityDays: 22 };
    const d28 = { operator: "VI", dailyData: 1, totalData: 28, validityDays: 28 };
    assert.equal(isSameBundle(d22, d28), false);
});

test("diffPlanFields reports only the fields that actually differ", () => {
    const master = { operator: "VI", price: 219, validityDays: 22, dailyData: 1, totalData: 22, sms: 100 };

    assert.deepEqual(diffPlanFields(master, { ...master }), [], "an unchanged plan proposes nothing");

    assert.deepEqual(diffPlanFields(master, { ...master, price: 299 }), [
        { key: "price", field: "Price", oldValue: 219, newValue: 299 },
    ]);

    const both = diffPlanFields(master, { ...master, price: 299, validityDays: 28 });
    assert.deepEqual(both.map((diff) => diff.field), ["Price", "ValidityDays"]);

    assert.deepEqual(diffPlanFields({ ...master, sms: null }, { ...master, sms: 100 }), [
        { key: "sms", field: "Sms", oldValue: null, newValue: 100 },
    ]);
});
