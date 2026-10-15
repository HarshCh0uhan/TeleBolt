import { test } from "node:test";
import assert from "node:assert/strict";
import { rankPlans, findOtherPlans, RANKING_FORMATS } from "../src/utils/ranking.js";

const base = {
  isActive: true,
  category: "Daily",
  isUnlimitedCalls: true,
  isUnlimitedSMS: false,
  ottApps: [],
  source: "manual",
  sourceRef: "",
};

const cheapShort = { ...base, _id: "a", operator: "Jio", price: 19, validityDays: 1, dailyData: 1, totalData: 1 };
const midMonthly = { ...base, _id: "b", operator: "Airtel", price: 299, validityDays: 28, dailyData: 1.5, totalData: 42 };
const longTerm = { ...base, _id: "c", operator: "VI", price: 2799, validityDays: 365, dailyData: 3, totalData: 1095 };
const dataOnly = { ...base, _id: "d", operator: "BSNL", price: 100, validityDays: 30, dailyData: null, totalData: 50 };
const noCalls = { ...base, _id: "e", operator: "Jio", price: 10, validityDays: 1, dailyData: 1, totalData: 1, isUnlimitedCalls: false };
const withNetflix = { ...base, _id: "f", operator: "Jio", price: 399, validityDays: 28, dailyData: 2, totalData: 56, ottApps: ["Netflix"] };
const withNetflixAndPrime = { ...base, _id: "g", operator: "Airtel", price: 499, validityDays: 28, dailyData: 2, totalData: 56, ottApps: ["Netflix", "Prime"] };
const heavyDaily = { ...base, _id: "h", operator: "Jio", price: 899, validityDays: 84, dailyData: 3, totalData: 252 };

const all = [cheapShort, midMonthly, longTerm, dataOnly, noCalls, withNetflix, withNetflixAndPrime, heavyDaily];

const ids = (plans) => plans.map((p) => p._id);

test("plans without unlimited calls are excluded from every format", () => {
  for (const format of RANKING_FORMATS) {
    const ranked = rankPlans(all, { formatId: format.id });
    assert.ok(!ranked.some((p) => p._id === "e"), `${format.id} leaked noCalls`);
  }
});

test("plans without calls are not in otherPlans either", () => {
  const other = findOtherPlans(all);
  assert.ok(!other.some((p) => p._id === "e"));
});

test("entertainment requires at least one OTT app", () => {
  const ranked = rankPlans(all, { formatId: "entertainment" });
  assert.ok(ranked.every((p) => (p.ottApps || []).length > 0));
  assert.ok(!ranked.some((p) => p._id === "b"));
});

test("entertainment with selected apps requires ALL of them", () => {
  const ranked = rankPlans(all, { formatId: "entertainment", ottApps: ["Netflix", "Prime"] });
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0]._id, "g");
});

test("budget requires data (daily or total)", () => {
  const ranked = rankPlans(all, { formatId: "budget" });
  assert.ok(ranked.every((p) => Number(p.dailyData) > 0 || Number(p.totalData) > 0));
});

test("heavy-data requires daily data specifically", () => {
  const ranked = rankPlans(all, { formatId: "heavy-data" });
  assert.ok(ranked.every((p) => Number(p.dailyData) > 0));
  assert.ok(!ranked.some((p) => p._id === "d"));
});

test("best-value puts the cheapest cost per GB first", () => {
  const ranked = rankPlans(all, { formatId: "best-value" });
  assert.ok(ranked.length > 0);
  for (let i = 1; i < ranked.length; i++) {
    const a = ranked[i - 1];
    const b = ranked[i];
    const aCpg = a.costPerGB ?? Infinity;
    const bCpg = b.costPerGB ?? Infinity;
    assert.ok(aCpg <= bCpg, `best-value out of order: ${a._id}(${aCpg}) > ${b._id}(${bCpg})`);
  }
});

test("long-term puts higher validity ahead of lower", () => {
  const ranked = rankPlans(all, { formatId: "long-term" });
  assert.equal(ranked[0]._id, "c");
});

test("heavy-data puts the biggest daily quota first", () => {
  const ranked = rankPlans(all, { formatId: "heavy-data" });
  assert.equal(ranked[0]._id, "h");
});

test("budget prefers plans with lower yearly cost when data is comparable", () => {
  const ranked = rankPlans(all, { formatId: "budget" });
  const posLong = ranked.findIndex((p) => p._id === "c");
  const posCheap = ranked.findIndex((p) => p._id === "a");
  assert.ok(posLong !== -1 && posCheap !== -1);
  assert.ok(posLong < posCheap, `expected longTerm before cheapShort in budget, got ${ids(ranked)}`);
});

test("otherPlans contains only plans that fail every category gate", () => {
  const withNoData = { ...base, _id: "z", operator: "Jio", price: 200, validityDays: 30, dailyData: null, totalData: null };
  const other = findOtherPlans([...all, withNoData]);
  assert.deepEqual(ids(other), ["z"]);
});

test("otherPlans is empty when every plan qualifies for at least one category", () => {
  const qualified = [cheapShort, midMonthly, longTerm];
  assert.deepEqual(findOtherPlans(qualified), []);
});

test("empty input returns empty for every format", () => {
  for (const format of RANKING_FORMATS) {
    assert.deepEqual(rankPlans([], { formatId: format.id }), []);
  }
  assert.deepEqual(findOtherPlans([]), []);
});

test("unknown format id falls back to the default format", () => {
  const ranked = rankPlans(all, { formatId: "does-not-exist" });
  assert.ok(ranked.length > 0);
});