// Ranking formats and their weights. Every format's weights sum to 1. Signals
// are all scaled to 0..1 so a score means the same thing in every format.
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
