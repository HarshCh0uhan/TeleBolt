import { test } from "node:test";
import assert from "node:assert/strict";
import { rankPlans, RANKING_FORMATS } from "../src/utils/ranking.js";

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

test("every format's weights sum to 1", () => {
  for (const format of RANKING_FORMATS) {
    const sum = Object.values(format.weights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `${format.id} weights sum to ${sum}`);
  }
});

test("scores stay within 0..1 and never increase down the list", () => {
  for (const format of RANKING_FORMATS) {
    const ranked = rankPlans(all, { formatId: format.id });
    for (let i = 0; i < ranked.length; i++) {
      assert.ok(ranked[i].score >= 0 && ranked[i].score <= 1, `${format.id} score out of range`);
      if (i > 0) assert.ok(ranked[i - 1].score >= ranked[i].score, `${format.id} out of order`);
    }
  }
});

test("every ranked plan explains itself", () => {
  for (const format of RANKING_FORMATS) {
    const ranked = rankPlans(all, { formatId: format.id });
    for (const plan of ranked) {
      assert.deepEqual(
        Object.keys(plan.scoreBreakdown).sort(),
        Object.keys(format.weights).sort()
      );
      const sum = Object.values(plan.scoreBreakdown).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(sum - plan.score) < 0.001, `${format.id} breakdown does not add up`);
      assert.ok(Array.isArray(plan.reasons));
    }
  }
});

test("entertainment requires at least one OTT app", () => {
  const ranked = rankPlans(all, { formatId: "entertainment" });
  assert.ok(ranked.every((p) => (p.ottApps || []).length > 0));
  assert.ok(!ranked.some((p) => p._id === "b"));
});

test("entertainment with selected apps accepts ANY of them, and rewards matching more", () => {
  const ranked = rankPlans(all, { formatId: "entertainment", ottApps: ["Netflix", "Prime"] });
  assert.deepEqual(ids(ranked).sort(), ["f", "g"]);
  const f = ranked.find((p) => p._id === "f");
  const g = ranked.find((p) => p._id === "g");
  assert.ok(g.scoreBreakdown.ottMatch > f.scoreBreakdown.ottMatch);
});

test("entertainment with a single selected app returns only plans that have it", () => {
  const ranked = rankPlans(all, { formatId: "entertainment", ottApps: ["Prime"] });
  assert.deepEqual(ids(ranked), ["g"]);
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

test("best-value puts the cheapest cost per GB first and the worst last", () => {
  const ranked = rankPlans(all, { formatId: "best-value" });
  assert.ok(ranked.length > 0);
  assert.equal(ranked[0]._id, "d");
  const lowest = Math.min(...ranked.map((p) => p.costPerGB ?? Infinity));
  assert.equal(ranked[0].costPerGB, lowest);
  assert.equal(ranked[ranked.length - 1]._id, "a");
});

test("best-value gives the top plan a reason", () => {
  const ranked = rankPlans(all, { formatId: "best-value" });
  assert.ok(ranked[0].reasons.includes("Among the cheapest per GB"));
});

test("long-term puts higher validity ahead of lower", () => {
  const ranked = rankPlans(all, { formatId: "long-term" });
  assert.equal(ranked[0]._id, "c");
});

test("heavy-data puts the biggest daily quota first", () => {
  const ranked = rankPlans(all, { formatId: "heavy-data" });
  assert.equal(ranked[0].dailyData, 3);
});

test("budget ranks by cost per day: cheapest per day first, long plans ahead of one-day packs", () => {
  const ranked = rankPlans(all, { formatId: "budget" });
  assert.equal(ranked[0]._id, "d");
  const posLong = ranked.findIndex((p) => p._id === "c");
  const posCheap = ranked.findIndex((p) => p._id === "a");
  assert.ok(posLong !== -1 && posCheap !== -1);
  assert.ok(posLong < posCheap, `expected longTerm before cheapShort in budget, got ${ids(ranked)}`);
});

test("validity that does not divide 365 is not penalised (no yearly rounding)", () => {
  const x = { ...base, _id: "x84", operator: "Jio", price: 840, validityDays: 84, dailyData: 2, totalData: 168 };
  const y = { ...base, _id: "y90", operator: "Jio", price: 900, validityDays: 90, dailyData: 2, totalData: 180 };
  const ranked = rankPlans([y, x], { formatId: "budget" });
  assert.equal(ranked[0].score, ranked[1].score);
  assert.deepEqual(ids(ranked), ["x84", "y90"]);
});

test("a well-reviewed plan beats an identical unrated one", () => {
  const unrated = { ...base, _id: "r1", operator: "Jio", price: 299, validityDays: 28, dailyData: 1.5, totalData: 42 };
  const rated = { ...unrated, _id: "r2", ratingAvg: 4.8, ratingCount: 40 };
  const ranked = rankPlans([unrated, rated], { formatId: "best-value" });
  assert.equal(ranked[0]._id, "r2");
});

test("one 5-star review does not beat forty reviews at 4.5", () => {
  const plan = { ...base, operator: "Jio", price: 299, validityDays: 28, dailyData: 1.5, totalData: 42 };
  const oneReview = { ...plan, _id: "one", ratingAvg: 5, ratingCount: 1 };
  const manyReviews = { ...plan, _id: "many", ratingAvg: 4.5, ratingCount: 40 };
  const ranked = rankPlans([oneReview, manyReviews], { formatId: "best-value" });
  assert.equal(ranked[0]._id, "many");
});

test("one extreme outlier does not flatten the scores of everyone else", () => {
  const normal = Array.from({ length: 11 }, (_, i) => ({
    ...base,
    _id: `n${i}`,
    operator: "Jio",
    price: 200 + i * 10,
    validityDays: 28,
    dailyData: 1.5,
    totalData: 42,
  }));
  const outlier = { ...base, _id: "x", operator: "Jio", price: 99999, validityDays: 28, dailyData: 1.5, totalData: 42 };

  const ranked = rankPlans([...normal, outlier], { formatId: "best-value" });
  const rest = ranked.filter((p) => p._id !== "x");
  assert.equal(rest[0]._id, "n0");
  assert.ok(rest[0].score - rest[rest.length - 1].score > 0.2);
});

test("empty input returns empty for every format", () => {
  for (const format of RANKING_FORMATS) {
    assert.deepEqual(rankPlans([], { formatId: format.id }), []);
  }
});

test("unknown format id falls back to the default format", () => {
  const ranked = rankPlans(all, { formatId: "does-not-exist" });
  assert.ok(ranked.length > 0);
});
