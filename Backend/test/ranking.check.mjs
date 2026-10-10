import assert from "node:assert/strict";
import { RANKING_FORMATS, rankPlans, findOtherPlans } from "../src/utils/ranking.js";

let nextId = 1;
const make = (overrides) => ({
  _id: String(nextId++),
  operator: "Jio",
  category: "Non-Daily",
  price: 100,
  validityDays: 28,
  isUnlimitedCalls: true,
  isUnlimitedSMS: false,
  ottApps: [],
  isActive: true,
  ...overrides,
});

const pack1 = make({ price: 19, validityDays: 1, totalData: 1, isUnlimitedCalls: false });
const pack2 = make({ price: 19, validityDays: 1, totalData: 1, isUnlimitedCalls: false });
const pack3 = make({ price: 19, validityDays: 1, totalData: 1, isUnlimitedCalls: false });
const noCallsField = make({ price: 29, validityDays: 2, totalData: 2, isUnlimitedCalls: undefined });
const cheapReal = make({ price: 55, validityDays: 30, totalData: 3 });
const dailyOneDay = make({ price: 19, validityDays: 1, totalData: 1 });
const netflixPrime = make({
  category: "Daily", price: 999, validityDays: 84, dailyData: 2, totalData: 168,
  ottApps: ["Netflix", "Prime"],
});
const netflixOnly = make({
  category: "Daily", price: 499, validityDays: 56, dailyData: 1.5, totalData: 84,
  ottApps: ["Netflix"],
});
const noOtt = make({
  category: "Daily", price: 299, validityDays: 28, dailyData: 1.5, totalData: 42,
});

const all = [pack1, pack2, pack3, noCallsField, cheapReal, dailyOneDay, netflixPrime, netflixOnly, noOtt];
const blockedIds = new Set([pack1._id, pack2._id, pack3._id, noCallsField._id]);
const ids = (list) => list.map((p) => p._id);

// 1. No plan without isUnlimitedCalls === true appears anywhere.
for (const format of RANKING_FORMATS) {
  const ranked = rankPlans(all, { formatId: format.id });
  for (const plan of ranked) {
    assert.equal(plan.isUnlimitedCalls, true, `${format.id} leaked a no-voice plan`);
    assert.ok(!blockedIds.has(plan._id), `${format.id} leaked a blocked id`);
  }
}
const gatedOnly = RANKING_FORMATS.filter((f) => f.gate);
const orphanA = make({ price: 200 });
const orphanB = make({ price: 100 });
for (const plan of findOtherPlans([...all, orphanA, orphanB], { formats: gatedOnly })) {
  assert.equal(plan.isUnlimitedCalls, true);
  assert.ok(!blockedIds.has(plan._id));
}

// 2. Budget: the Rs.715/year plan outranks the Rs.6935/year plan.
const budgetPair = rankPlans([cheapReal, dailyOneDay], { formatId: "budget" });
assert.equal(budgetPair[0]._id, cheapReal._id);
assert.equal(budgetPair[0].yearlyCost, 715);
assert.equal(budgetPair[1].yearlyCost, 6935);
const budgetAll = ids(rankPlans(all, { formatId: "budget" }));
assert.ok(budgetAll.indexOf(cheapReal._id) < budgetAll.indexOf(dailyOneDay._id));

// 3. No three Rs.19 one-day packs on the Budget podium.
const budgetPodium = budgetAll.slice(0, 3);
for (const id of [pack1._id, pack2._id, pack3._id]) {
  assert.ok(!budgetPodium.includes(id));
}

// 4. Entertainment gate.
const entBoth = rankPlans(all, { formatId: "entertainment", ottApps: ["Netflix", "Prime"] });
assert.deepEqual(ids(entBoth), [netflixPrime._id]);
const entAny = rankPlans(all, { formatId: "entertainment" });
assert.deepEqual(ids(entAny).sort(), [netflixPrime._id, netflixOnly._id].sort());

// 5. Failing the Entertainment gate does not remove a plan from other categories.
assert.ok(!ids(entAny).includes(noOtt._id));
assert.ok(ids(rankPlans(all, { formatId: "best-value" })).includes(noOtt._id));
assert.ok(ids(rankPlans(all, { formatId: "heavy-data" })).includes(noOtt._id));

// Category gates for Budget and Heavy Data.
for (const plan of rankPlans(all, { formatId: "heavy-data" })) assert.ok(plan.dailyData > 0);
for (const plan of rankPlans(all, { formatId: "budget" })) {
  assert.ok(plan.dailyData > 0 || plan.totalData > 0);
}

// 6. Other Plans: global pass, no category pass, price ascending.
const others = findOtherPlans([...all, orphanA, orphanB], { formats: gatedOnly });
assert.deepEqual(others.map((p) => p.price), [100, 200]);
assert.deepEqual(findOtherPlans(all), []);

// Tie-break: identical scores resolve by lower yearly cost.
const twinA = make({ price: 200, validityDays: 28, totalData: 10 });
const twinB = make({ price: 150, validityDays: 28, totalData: 10 });
const tied = rankPlans([twinA, twinB], { formatId: "long-term" });
assert.ok(tied[0].yearlyCost <= tied[1].yearlyCost);

console.log("ranking checks passed");