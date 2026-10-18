import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSearchQuery } from "../src/utils/searchQuery.js";

const has = (parsed, clause) =>
    parsed.clauses.some((c) => JSON.stringify(c) === JSON.stringify(clause));

test("jio 299 plan -> Jio operator and a 299 price/validity match", () => {
    const p = parseSearchQuery("jio 299 plan");
    assert.ok(has(p, { operator: { $in: ["Jio"] } }));
    assert.ok(has(p, { $or: [{ price: 299 }, { validityDays: 299 }] }));
    assert.deepEqual(p.ignored, []);
    assert.equal(p.matchNothing, false);
});

test("vi jio 2.5gb data plan with hotstar -> two operators, 2.5 GB, JioHotstar", () => {
    const p = parseSearchQuery("vi jio 2.5gb data plan with hotstar");
    assert.ok(has(p, { operator: { $in: ["VI", "Jio"] } }));
    assert.ok(has(p, { $or: [{ dailyData: 2.5 }, { totalData: 2.5 }] }));
    assert.ok(has(p, { ottApps: { $all: ["JioHotstar"] } }));
    assert.deepEqual(p.ignored, []);
});

test("airtel under 300 -> price upper bound", () => {
    const p = parseSearchQuery("airtel under 300");
    assert.ok(has(p, { operator: { $in: ["Airtel"] } }));
    assert.ok(has(p, { price: { $lte: 300 } }));
});

test("2gb/day netflix -> exact daily data and Netflix", () => {
    const p = parseSearchQuery("2gb/day netflix");
    assert.ok(has(p, { dailyData: 2 }));
    assert.ok(has(p, { ottApps: { $all: ["Netflix"] } }));
});

test("non daily bsnl 28 days -> category, operator, validity", () => {
    const p = parseSearchQuery("non daily bsnl 28 days");
    assert.ok(has(p, { category: "Non-Daily" }));
    assert.ok(has(p, { operator: { $in: ["BSNL"] } }));
    assert.ok(has(p, { validityDays: 28 }));
});

test("rupee sign gives an exact price", () => {
    const p = parseSearchQuery("jio ₹299");
    assert.ok(has(p, { price: 299 }));
});

test("between a and b is a price range", () => {
    const p = parseSearchQuery("between 200 and 300");
    assert.ok(has(p, { price: { $gte: 200, $lte: 300 } }));
});

test("unknown words alone match nothing", () => {
    const p = parseSearchQuery("xyzzy");
    assert.equal(p.matchNothing, true);
    assert.deepEqual(p.ignored, ["xyzzy"]);
    assert.ok(has(p, { _id: { $in: [] } }));
});

test("unknown words next to known ones are ignored, not fatal", () => {
    const p = parseSearchQuery("jio xyzzy");
    assert.equal(p.matchNothing, false);
    assert.deepEqual(p.ignored, ["xyzzy"]);
});

test("blank query adds no clauses", () => {
    const p = parseSearchQuery("   ");
    assert.deepEqual(p.clauses, []);
    assert.deepEqual(p.chips, []);
    assert.equal(p.matchNothing, false);
});
