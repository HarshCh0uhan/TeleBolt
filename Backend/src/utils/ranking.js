import { yearlyPlan } from "./yearlyPlan.js";

// Format definitions. `gate` is a hard filter applied before scoring; `weights`
// decide how much each signal counts. Weights are normalised, so they only need
// to be relative to each other.
export const RANKING_FORMATS = [
  {
    id: "best-value",
    label: "Best Value",
    blurb: "Cheapest data per GB, yearly cost as tie-breaker.",
    weights: { costPerGB: 0.7, yearlyCost: 0.2, totalData: 0.1 },
  },
  {
    id: "long-term",
    label: "Long Term",
    blurb: "Long validity packs so you recharge less often.",
    weights: { validityDays: 0.6, yearlyCost: 0.25, costPerGB: 0.15 },
  },
  {
    id: "entertainment",
    label: "Entertainment",
    blurb: "Plans that bundle OTT subscriptions.",
    gate: "ott",
    weights: { ottMatch: 0.55, costPerGB: 0.25, validityDays: 0.2 },
  },
  {
    id: "budget",
    label: "Budget",
    blurb: "Low upfront price, good for a backup SIM.",
    weights: { price: 0.55, yearlyCost: 0.3, validityDays: 0.15 },
  },
  {
    id: "heavy-data",
    label: "Heavy Data",
    blurb: "Big daily quotas for streaming and hotspot use.",
    weights: { dailyData: 0.55, costPerGB: 0.3, totalData: 0.15 },
  },
];

export const DEFAULT_FORMAT = "best-value";

export const findFormat = (id) =>
  RANKING_FORMATS.find((f) => f.id === id) || RANKING_FORMATS[0];

const toPositive = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Normalises one signal across all plans to 0..1. Nulls score 0, so a plan
 * missing dailyData simply gains nothing from that weight rather than being
 * dropped. Price-like signals are log-scaled first: Rs.19 to Rs.3599 spans two
 * orders of magnitude and a linear scale would squash everything into a
 * narrow band, letting the data signals dominate.
 */
const normalize = (plans, getter, { lowerIsBetter = false, log = false } = {}) => {
  const raw = plans.map((p) => toPositive(getter(p)));
  const transformed = raw.map((v) => (v === null ? null : log ? Math.log(v) : v));
  const clean = transformed.filter((v) => v !== null);
  const min = clean.length ? Math.min(...clean) : 0;
  const max = clean.length ? Math.max(...clean) : 0;
  const range = max - min || 1;

  return transformed.map((v) => {
    if (v === null) return 0;
    const n = (v - min) / range;
    return lowerIsBetter ? 1 - n : n;
  });
};

/**
 * Ranks a filtered set of plans for a chosen format.
 *
 * Scoring runs over the whole set before any pagination happens upstream in the
 * controller - sorting a page slice would silently turn "top 3" into "top 3 of
 * page 1".
 */
export const rankPlans = (plans, { formatId = DEFAULT_FORMAT, ottApps = [] } = {}) => {
  const format = findFormat(formatId);
  let candidates = plans;

  // Entertainment gate. With specific apps requested, a plan must carry all of
  // them (user asked for Netflix + Prime -> show both, not either). With no
  // apps requested, any OTT at all qualifies.
  if (format.gate === "ott") {
    candidates = candidates.filter((plan) => {
      const apps = plan.ottApps || [];
      if (ottApps.length > 0) return ottApps.every((app) => apps.includes(app));
      return apps.length > 0;
    });
  }

  if (candidates.length === 0) return [];

  const yearly = candidates.map((plan) => yearlyPlan(plan));

  const signals = {
    costPerGB: normalize(yearly, (p) => p.costPerGB, { lowerIsBetter: true, log: true }),
    yearlyCost: normalize(yearly, (p) => p.yearlyCost, { lowerIsBetter: true, log: true }),
    price: normalize(yearly, (p) => p.price, { lowerIsBetter: true, log: true }),
    validityDays: normalize(yearly, (p) => p.validityDays),
    dailyData: normalize(yearly, (p) => p.dailyData),
    totalData: normalize(yearly, (p) => p.totalData),
  };

  // How much of what the user asked for this plan actually carries.
  const ottScore = yearly.map((plan) => {
    const apps = plan.ottApps || [];
    if (ottApps.length > 0) {
      const matched = ottApps.filter((app) => apps.includes(app)).length;
      return matched / ottApps.length;
    }
    return apps.length > 0 ? 1 : 0;
  });

  const weightSum = Object.values(format.weights).reduce((a, b) => a + b, 0) || 1;

  const scored = yearly.map((plan, i) => {
    let total = 0;
    for (const [key, weight] of Object.entries(format.weights)) {
      const value = key === "ottMatch" ? ottScore[i] : signals[key]?.[i] ?? 0;
      total += value * weight;
    }
    return { ...plan, score: Math.round((total / weightSum) * 10000) / 10000 };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
};