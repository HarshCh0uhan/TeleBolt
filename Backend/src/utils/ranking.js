import { yearlyPlan } from "./yearlyPlan.js";

export const RANKING_FORMATS = [
  {
    id: "best-value",
    label: "Best Value",
    blurb: "Cheapest data per GB, yearly cost and yearly data as correctors.",
    gate: null,
    weights: { costPerGB: 0.6, yearlyCost: 0.25, yearlyData: 0.15 },
  },
  {
    id: "long-term",
    label: "Long Term",
    blurb: "Long validity packs so you recharge less often.",
    gate: null,
    weights: { validityDays: 0.55, yearlyCost: 0.3, costPerGB: 0.15 },
  },
  {
    id: "entertainment",
    label: "Entertainment",
    blurb: "Plans that bundle the OTT subscriptions you care about.",
    gate: "ott",
    weights: { ottMatch: 0.5, costPerGB: 0.25, yearlyCost: 0.15, validityDays: 0.1 },
  },
  {
    id: "budget",
    label: "Budget",
    blurb: "Cheapest to run over a year, with meaningful data.",
    gate: "data",
    weights: { yearlyCost: 0.55, yearlyData: 0.45 },
  },
  {
    id: "heavy-data",
    label: "Heavy Data",
    blurb: "Big daily quotas for streaming and hotspot use.",
    gate: "daily-data",
    weights: { dailyData: 0.5, costPerGB: 0.3, yearlyData: 0.2 },
  },
];

export const DEFAULT_FORMAT = "best-value";

export const findFormat = (id) =>
  RANKING_FORMATS.find((f) => f.id === id) || RANKING_FORMATS[0];

export const passesGlobalGate = (plan) => plan?.isUnlimitedCalls === true;

const hasPositive = (value) => Number(value) > 0;

export const passesCategoryGate = (format, plan, selectedOtt = []) => {
  switch (format.gate) {
    case "ott": {
      const apps = plan.ottApps || [];
      if (selectedOtt.length > 0) return selectedOtt.every((app) => apps.includes(app));
      return apps.length > 0;
    }
    case "data":
      return hasPositive(plan.dailyData) || hasPositive(plan.totalData);
    case "daily-data":
      return hasPositive(plan.dailyData);
    default:
      return true;
  }
};

const toPositive = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Min-max normalises one signal to 0..1 across the given plans. Missing values
// score 0. Rupee-denominated signals are log-scaled first so a Rs.19 to
// Rs.3599 spread does not get squashed against the data signals.
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

const ottMatchScore = (plan, selectedOtt) => {
  const apps = plan.ottApps || [];
  if (selectedOtt.length > 0) {
    const matched = selectedOtt.filter((app) => apps.includes(app)).length;
    return matched / selectedOtt.length;
  }
  return apps.length > 0 ? 1 : 0;
};

/**
 * Ranks plans for one category: global gate, category gate, then scoring.
 * Runs over the whole set before any pagination so "top 3" is never "top 3 of
 * a page".
 */
export const rankPlans = (plans, { formatId = DEFAULT_FORMAT, ottApps = [] } = {}) => {
  const format = findFormat(formatId);

  const candidates = plans.filter(
    (plan) => passesGlobalGate(plan) && passesCategoryGate(format, plan, ottApps)
  );

  if (candidates.length === 0) return [];

  const yearly = candidates.map((plan) => yearlyPlan(plan));

  const signals = {
    costPerGB: normalize(yearly, (p) => p.costPerGB, { lowerIsBetter: true, log: true }),
    yearlyCost: normalize(yearly, (p) => p.yearlyCost, { lowerIsBetter: true, log: true }),
    price: normalize(yearly, (p) => p.price, { lowerIsBetter: true, log: true }),
    yearlyData: normalize(yearly, (p) => p.yearlyData),
    validityDays: normalize(yearly, (p) => p.validityDays),
    dailyData: normalize(yearly, (p) => p.dailyData),
  };

  const ottScore = yearly.map((plan) => ottMatchScore(plan, ottApps));

  const weightSum = Object.values(format.weights).reduce((a, b) => a + b, 0) || 1;

  const scored = yearly.map((plan, i) => {
    let total = 0;
    for (const [key, weight] of Object.entries(format.weights)) {
      const value = key === "ottMatch" ? ottScore[i] : signals[key]?.[i] ?? 0;
      total += value * weight;
    }
    return { ...plan, score: Math.round((total / weightSum) * 10000) / 10000 };
  });

  scored.sort((a, b) => b.score - a.score || a.yearlyCost - b.yearlyCost);
  return scored;
};

/**
 * Plans that pass the global gate but fail every category gate. Unscored,
 * sorted by lowest upfront price. `formats` is overridable only so the check
 * script can exercise the path.
 */
export const findOtherPlans = (plans, { ottApps = [], formats = RANKING_FORMATS } = {}) =>
  plans
    .filter(
      (plan) =>
        passesGlobalGate(plan) &&
        !formats.some((format) => passesCategoryGate(format, plan, ottApps))
    )
    .map((plan) => yearlyPlan(plan))
    .sort((a, b) => a.price - b.price);