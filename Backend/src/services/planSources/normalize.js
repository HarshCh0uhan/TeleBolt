// Shared helpers that turn operator-specific values into TeleBolt's plan shape.

export const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : null;
};

// "180 Days" -> 180, "1 Month" -> 30, "1 Year" -> 365, "28" -> 28
export const parseValidityDays = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value > 0 ? Math.round(value) : null;

  const text = String(value).trim().toLowerCase();
  if (!text) return null;

  const years = text.match(/(\d+(?:\.\d+)?)\s*year/);
  if (years) return Math.round(parseFloat(years[1]) * 365);

  const months = text.match(/(\d+(?:\.\d+)?)\s*month/);
  if (months) return Math.round(parseFloat(months[1]) * 30);

  const days = text.match(/(\d+(?:\.\d+)?)\s*day/);
  if (days) return Math.round(parseFloat(days[1]));

  const bare = text.match(/^(\d+(?:\.\d+)?)$/);
  if (bare) return Math.round(parseFloat(bare[1]));

  return null;
};

// "1.5GB/Day" -> { dailyGb: 1.5 }, "10GB" -> { totalGb: 10 }
export const parseDataText = (value) => {
  const result = { dailyGb: null, totalGb: null };
  if (!value) return result;

  const text = String(value);
  const daily = text.match(/(\d+(?:\.\d+)?)\s*gb\s*(?:\/|per\s*)\s*day/i);
  if (daily) {
    result.dailyGb = parseFloat(daily[1]);
    return result;
  }

  const total = text.match(/(\d+(?:\.\d+)?)\s*gb/i);
  if (total) result.totalGb = parseFloat(total[1]);
  return result;
};

export const parseSms = (value) => {
  if (!value) return { sms: null, unlimitedSms: false };
  const text = String(value);
  if (/unlimited/i.test(text)) return { sms: null, unlimitedSms: true };
  const match = text.match(/(\d+)\s*sms/i);
  return { sms: match ? Number(match[1]) : null, unlimitedSms: false };
};

export const isUnlimitedVoice = (value) => /unlimited/i.test(String(value || ""));

// Converts megabytes (some operator APIs return MB) into GB.
export const mbToGb = (mb) => {
  const value = Number(mb);
  return Number.isFinite(value) && value > 0 ? Math.round((value / 1024) * 100) / 100 : null;
};

/**
 * Builds the plan object we store or propose, or null when the row is unusable.
 * Guarantees the schema invariants: price >= 1, 1 <= validityDays <= 365 and at
 * least one of dailyData / totalData present.
 */
export const buildPlan = ({
  operator,
  source,
  sourceRef,
  price,
  validityDays,
  dailyData,
  totalData,
  sms,
  isUnlimitedCalls,
  isUnlimitedSMS,
  ottApps,
}) => {
  const priceNum = toNumber(price);
  const validity = parseValidityDays(validityDays);
  if (!priceNum || !validity || validity < 1 || validity > 365) return null;

  const daily = Number(dailyData) > 0 ? Number(dailyData) : null;
  let total = Number(totalData) > 0 ? Number(totalData) : null;
  if (daily && !total) total = Math.round(daily * validity * 100) / 100;
  if (!daily && !total) return null;

  return {
    operator,
    category: daily ? "Daily" : "Non-Daily",
    price: priceNum,
    validityDays: validity,
    dailyData: daily || undefined,
    totalData: total || undefined,
    sms: Number(sms) > 0 ? Number(sms) : undefined,
    isUnlimitedCalls: isUnlimitedCalls !== false,
    isUnlimitedSMS: isUnlimitedSMS === true,
    ottApps: Array.isArray(ottApps) ? ottApps : [],
    isActive: true,
    source,
    sourceRef: String(sourceRef || ""),
  };
};
