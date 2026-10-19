import { yearlyPlan } from "./yearlyPlan.js";

// Every format's weights sum to 1. Signals are all scaled to 0..1, so a score is
// always 0..1 and a score means the same thing in every format.
//   costPerGB    rupees per GB over the plan's life (lower is better)
//   costPerDay   rupees per day of validity (lower is better)
//   dataPerDay   total GB divided by validity days (higher is better)
//   dailyData    the plan's GB/day quota (higher is better)
//   validityDays days of validity (higher is better)
//   ottMatch     share of the picked OTT apps included, or how many OTTs it bundles
//   rating       Bayesian average of user reviews on a fixed 1..5 scale
export const RANKING_FORMATS = [
  {
    id: "best-value",
    label: "Best Value",
    blurb: "Cheapest data per GB, with cost per day and data per day as correctors.",
    gate: null,
    weights: { costPerGB: 0.55, costPerDay: 0.15, dataPerDay: 0.15, rating: 0.1, validityDays: 0.05 },
  },
  {
    id: "long-term",
    label: "Long Term",
    blurb: "Long validity packs so you recharge less often.",
    gate: null,
    weights: { validityDays: 0.45, costPerDay: 0.3, costPerGB: 0.15, rating: 0.1 },
  },
  {
    id: "entertainment",
    label: "Entertainment",
    blurb: "Plans that bundle the OTT subscriptions you care about.",
    gate: "ott",
    weights: { ottMatch: 0.5, costPerGB: 0.2, costPerDay: 0.15, rating: 0.1, validityDays: 0.05 },
  },
  {
    id: "budget",
    label: "Budget",
    blurb: "Cheapest to run per day, with meaningful data.",
    gate: "data",
    weights: { costPerDay: 0.55, dataPerDay: 0.25, rating: 0.1, costPerGB: 0.1 },
  },
  {
    id: "heavy-data",
    label: "Heavy Data",
    blurb: "Big daily quotas for streaming and hotspot use.",
    gate: "daily-data",
    weights: { dailyData: 0.5, costPerGB: 0.25, costPerDay: 0.1, rating: 0.1, validityDays: 0.05 },
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
      // Same meaning as the OTT filter: any of the picked apps qualifies. Plans
      // that match more of them score higher through the ottMatch signal.
      if (selectedOtt.length > 0) return selectedOtt.some((app) => apps.includes(app));
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

const round4 = (value) => Math.round(value * 10000) / 10000;

// Linear-interpolated quantile of an ascending array.
const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

// Scales one signal to 0..1 across the candidates. Missing values score 0.
// Rupee and day signals are log-scaled first. With enough plans, genuine
// outliers (beyond Tukey's fences) are clipped so one absurd plan cannot
// flatten everyone else. If every plan has the same value the signal is
// neutral (0.5) and cannot affect the order.
const normalize = (values, { lowerIsBetter = false, log = false } = {}) => {
  const transformed = values.map((raw) => {
    const v = toPositive(raw);
    return v === null ? null : log ? Math.log(v) : v;
  });

  const clean = transformed.filter((v) => v !== null).sort((a, b) => a - b);
  if (clean.length === 0) return transformed.map(() => 0);

  let lo = clean[0];
  let hi = clean[clean.length - 1];

  if (clean.length >= 8) {
    const q1 = quantile(clean, 0.25);
    const q3 = quantile(clean, 0.75);
    const iqr = q3 - q1;
    if (iqr > 0) {
      lo = Math.max(lo, q1 - 1.5 * iqr);
      hi = Math.min(hi, q3 + 1.5 * iqr);
    }
  }

  if (hi === lo) return transformed.map((v) => (v === null ? 0 : 0.5));

  return transformed.map((v) => {
    if (v === null) return 0;
    const n = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
    return lowerIsBetter ? 1 - n : n;
  });
};

const totalGbOf = (plan) => {
  const total = toPositive(plan.totalData);
  if (total) return total;
  const daily = toPositive(plan.dailyData);
  const days = toPositive(plan.validityDays);
  return daily && days ? daily * days : null;
};

// Exact per-plan metrics. No yearly multiplier: rounding a plan up to whole
// recharges per year penalised plans whose validity does not divide 365.
const metricsOf = (plan) => {
  const price = toPositive(plan.price);
  const days = toPositive(plan.validityDays);
  const gb = totalGbOf(plan);
  return {
    costPerGB: price && gb ? price / gb : null,
    costPerDay: price && days ? price / days : null,
    dataPerDay: gb && days ? gb / days : null,
    dailyData: toPositive(plan.dailyData),
    validityDays: days,
  };
};

const ottMatchScore = (plan, selectedOtt) => {
  const apps = plan.ottApps || [];
  if (selectedOtt.length > 0) {
    const matched = selectedOtt.filter((app) => apps.includes(app)).length;
    return matched / selectedOtt.length;
  }
  return Math.min(apps.length, 3) / 3;
};

// A plan with no reviews sits at a neutral 3.5. A few reviews barely move it;
// many reviews decide it. Fixed 1..5 scale, so an unrated catalogue stays neutral.
const RATING_PRIOR_COUNT = 5;
const RATING_PRIOR_MEAN = 3.5;

const ratingScore = (plan) => {
  const count = Math.max(0, Number(plan.ratingCount) || 0);
  const avg = Number(plan.ratingAvg) || 0;
  const bayes =
    count > 0
      ? (count * avg + RATING_PRIOR_COUNT * RATING_PRIOR_MEAN) / (count + RATING_PRIOR_COUNT)
      : RATING_PRIOR_MEAN;
  return Math.min(1, Math.max(0, (bayes - 1) / 4));
};

const REASON_LABELS = {
  costPerGB: "Among the cheapest per GB",
  costPerDay: "Low cost per day",
  dataPerDay: "Plenty of data per day",
  dailyData: "Big daily data quota",
  validityDays: "Long validity",
  rating: "Well rated by users",
};

const buildReasons = (format, signals, index, plan, selectedOtt) => {
  const entries = Object.entries(format.weights).filter(([key, weight]) => {
    if (weight < 0.1) return false;
    if ((signals[key]?.[index] ?? 0) < 0.85) return false;
    if (key === "rating" && !(Number(plan.ratingCount) >= 3)) return false;
    return true;
  });

  entries.sort(
    ([keyA, weightA], [keyB, weightB]) =>
      weightB * signals[keyB][index] - weightA * signals[keyA][index]
  );

  return entries.slice(0, 3).map(([key]) => {
    if (key === "ottMatch") {
      return selectedOtt.length > 0 ? "Has the OTT apps you picked" : "Bundles OTT subscriptions";
    }
    return REASON_LABELS[key];
  });
};

/**
 * Ranks plans for one category: global gate, category gate, then scoring.
 * Runs over the whole set before any pagination so "top 3" is never "top 3 of
 * a page". Every returned plan carries `score` (0..1), `scoreBreakdown` (each
 * signal's contribution) and `reasons` (short human-readable highlights).
 */
export const rankPlans = (plans, { formatId = DEFAULT_FORMAT, ottApps = [] } = {}) => {
  const format = findFormat(formatId);

  const candidates = plans.filter(
    (plan) => passesGlobalGate(plan) && passesCategoryGate(format, plan, ottApps)
  );

  if (candidates.length === 0) return [];

  const metrics = candidates.map(metricsOf);

  const signals = {
    costPerGB: normalize(metrics.map((m) => m.costPerGB), { lowerIsBetter: true, log: true }),
    costPerDay: normalize(metrics.map((m) => m.costPerDay), { lowerIsBetter: true, log: true }),
    dataPerDay: normalize(metrics.map((m) => m.dataPerDay), { log: true }),
    dailyData: normalize(metrics.map((m) => m.dailyData)),
    validityDays: normalize(metrics.map((m) => m.validityDays), { log: true }),
    ottMatch: candidates.map((plan) => ottMatchScore(plan, ottApps)),
    rating: candidates.map(ratingScore),
  };

  const weightSum = Object.values(format.weights).reduce((a, b) => a + b, 0) || 1;

  const scored = candidates.map((plan, i) => {
    const breakdown = {};
    let total = 0;
    for (const [key, weight] of Object.entries(format.weights)) {
      const contribution = ((signals[key]?.[i] ?? 0) * weight) / weightSum;
      breakdown[key] = round4(contribution);
      total += contribution;
    }

    return {
      raw: total,
      costPerDay: metrics[i].costPerDay,
      plan: {
        ...yearlyPlan(plan),
        score: round4(total),
        scoreBreakdown: breakdown,
        reasons: buildReasons(format, signals, i, plan, ottApps),
      },
    };
  });

  scored.sort((a, b) => {
    const scoreDiff = b.raw - a.raw;
    if (Math.abs(scoreDiff) > 1e-9) return scoreDiff;
    // Tie-breakers: cheaper per day, then cheaper upfront, then a stable id order.
    const perDay = (a.costPerDay ?? 1e9) - (b.costPerDay ?? 1e9);
    if (perDay !== 0) return perDay;
    const upfront = (a.plan.price ?? 0) - (b.plan.price ?? 0);
    if (upfront !== 0) return upfront;
    return String(a.plan._id).localeCompare(String(b.plan._id));
  });

  return scored.map((row) => row.plan);
};
