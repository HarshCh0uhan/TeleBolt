export const LIMITS = {
  price: { min: 99, max: 3000, step: 1 },
  validity: { min: 1, max: 365, step: 1 },
};

export const OPERATORS = ["Jio", "Airtel", "VI", "BSNL"];
export const CATEGORIES = ["Daily", "Non-Daily"];
export const OTT_APPS = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5"];
export const DAILY_DATA_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export const DEFAULT_FILTERS = {
  operators: [],
  category: "",
  dailyData: 0,
  ottApps: [],
  minPrice: LIMITS.price.min,
  maxPrice: LIMITS.price.max,
  minValidity: LIMITS.validity.min,
  maxValidity: LIMITS.validity.max,
};

export const isPriceActive = (f) =>
  f.minPrice > LIMITS.price.min || f.maxPrice < LIMITS.price.max;

export const isValidityActive = (f) =>
  f.minValidity > LIMITS.validity.min || f.maxValidity < LIMITS.validity.max;

export const countActive = (f) =>
  f.operators.length +
  f.ottApps.length +
  (f.category ? 1 : 0) +
  (f.dailyData > 0 ? 1 : 0) +
  (isPriceActive(f) ? 1 : 0) +
  (isValidityActive(f) ? 1 : 0);

// Order-insensitive comparison so [Jio, VI] equals [VI, Jio].
const normalize = (f) => ({
  ...f,
  operators: [...f.operators].sort(),
  ottApps: [...f.ottApps].sort(),
});
export const sameFilters = (a, b) =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

// Only sends params that differ from the defaults.
export const toApiParams = (f) => {
  const params = {};
  if (f.operators.length) params.operator = f.operators.join(",");
  if (f.category) params.category = f.category;
  if (f.ottApps.length) params.ottApps = f.ottApps.join(",");
  if (f.dailyData > 0) params.dailyData = f.dailyData;
  if (f.minPrice > LIMITS.price.min) params.minPrice = f.minPrice;
  if (f.maxPrice < LIMITS.price.max) params.maxPrice = f.maxPrice;
  if (f.minValidity > LIMITS.validity.min) params.minValidity = f.minValidity;
  if (f.maxValidity < LIMITS.validity.max) params.maxValidity = f.maxValidity;
  return params;
};