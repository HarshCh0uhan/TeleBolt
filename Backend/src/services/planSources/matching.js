/**
 * Rules for deciding whether an upstream record is a plan we already have.
 *
 * Vi has no stable price-independent id: ITEM_ID embeds the price
 * (MH_0014_299_MH_0014_299), so
 *   - a validity/data/SMS change keeps the id  -> matched by sourceRef
 *   - a price change produces a brand new id   -> needs a shape fallback
 *
 * The fallback is deliberately strict: the bundle must be identical (operator,
 * daily data, total data and validity). Guessing any looser rewrites unrelated
 * plans - a 365-day 10 GB pack is not "the same plan" as a 28-day 10 GB pack.
 */

export const COMPARABLE_FIELDS = [
    { key: "price", field: "Price" },
    { key: "validityDays", field: "ValidityDays" },
    { key: "dailyData", field: "DailyData" },
    { key: "totalData", field: "TotalData" },
    { key: "sms", field: "Sms" },
];

const isNullish = (value) => value === undefined || value === null;

/** Treats null and undefined as equal, and compares numbers with tolerance. */
export const sameNumber = (a, b) => {
    if (isNullish(a) && isNullish(b)) return true;
    if (isNullish(a) || isNullish(b)) return false;
    return Math.abs(Number(a) - Number(b)) < 0.005;
};

/** True when both records describe the same bundle, ignoring price. */
export const isSameBundle = (existing, candidate) =>
    existing.operator === candidate.operator &&
    sameNumber(existing.dailyData, candidate.dailyData) &&
    sameNumber(existing.totalData, candidate.totalData) &&
    sameNumber(existing.validityDays, candidate.validityDays);

/** Fields that differ between a catalogue plan and an upstream record. */
export const diffPlanFields = (existing, candidate) =>
    COMPARABLE_FIELDS.filter(({ key }) => !sameNumber(existing[key], candidate[key])).map(
        ({ key, field }) => ({
            key,
            field,
            oldValue: isNullish(existing[key]) ? null : Number(existing[key]),
            newValue: isNullish(candidate[key]) ? null : Number(candidate[key]),
        })
    );
