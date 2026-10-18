// Turns a free-text search ("vi jio 2.5gb data plan with hotstar") into MongoDB
// clauses. Deterministic: no LLM, no network. Every recognised piece becomes a
// clause and a display chip; anything unrecognised is reported back as `ignored`.

const MAX_QUERY_LENGTH = 120;

const OTT_PATTERNS = [
    [/(?<!\w)(?:jiohotstar|disney\+?\s*hotstar|hotstar|disney)(?![a-z])/g, "JioHotstar"],
    [/(?<!\w)(?:amazon\s*prime|prime\s*video|prime|amazon)(?![a-z])/g, "Prime"],
    [/(?<!\w)netflix(?![a-z])/g, "Netflix"],
    [/(?<!\w)(?:sony\s*liv|sonyliv)(?![a-z])/g, "SonyLiv"],
    [/(?<!\w)(?:zee\s*5|zee5|zee)(?![a-z])/g, "Zee5"],
];

const OPERATOR_PATTERNS = [
    [/(?<!\w)(?:vodafone\s+idea|vodafone|idea|vi)(?![a-z])/g, "VI"],
    [/(?<!\w)jio(?![a-z])/g, "Jio"],
    [/(?<!\w)airtel(?![a-z])/g, "Airtel"],
    [/(?<!\w)bsnl(?![a-z])/g, "BSNL"],
];

const BETWEEN = /(?<!\w)between\s+(\d+(?:\.\d+)?)\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\s*(gb|days?|d)?(?![a-z])/g;
const PLAIN_RANGE = /(?<![\w.])(\d+(?:\.\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(gb|days?)?(?![a-z\d])/g;
const COMPARE =
    /(?<!\w)(under|below|less\s+than|upto|up\s+to|max|maximum|within|at\s+most|at\s+least|more\s+than|above|over|min|minimum|<=|>=|<|>)\s*(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(gb|days?|d|months?)?(?![a-z])/g;
const DAILY_AFTER = /(?<![\w.])(\d+(?:\.\d+)?)\s*gb\s*(?:\/|per\s+|a\s+)?\s*(?:day|daily|d)(?![a-z])/g;
const DAILY_BEFORE = /(?<!\w)(?:daily|per\s+day)\s*(\d+(?:\.\d+)?)\s*gb(?![a-z])/g;
const TOTAL_AFTER = /(?<![\w.])(\d+(?:\.\d+)?)\s*gb\s*total(?![a-z])/g;
const TOTAL_BEFORE = /(?<!\w)total\s*(\d+(?:\.\d+)?)\s*gb(?![a-z])/g;
const BARE_GB = /(?<![\w.])(\d+(?:\.\d+)?)\s*gb(?![a-z])/g;
const VALIDITY_DAYS = /(?<![\w.])(\d+)\s*(?:days?|d)(?![a-z])/g;
const VALIDITY_MONTHS = /(?<![\w.])(\d+)\s*months?(?![a-z])/g;
const YEARLY = /(?<!\w)(?:yearly|annually|annual|1\s*year|one\s*year|year)(?![a-z])/g;
const NON_DAILY = /(?<!\w)non[\s-]?daily(?![a-z])/g;
const DAILY = /(?<!\w)daily(?![a-z])/g;
const ANY_OTT = /(?<!\w)otts?(?![a-z])/g;
const PRICE_PREFIX = /(?<!\w)(?:rs\.?|inr|rupees?)\s*(\d+(?:\.\d+)?)/g;
const PRICE_SUFFIX = /(?<![\w.])(\d+(?:\.\d+)?)\s*(?:rs|inr|rupees?)(?![a-z])/g;
const BARE_NUMBER = /(?<![\w.])(\d+(?:\.\d+)?)(?![\w]|\.\d)/g;

const LOWER_BOUND_WORDS = new Set([
    "under", "below", "less than", "upto", "up to", "max", "maximum", "within", "at most", "<=", "<",
]);

const STOP_WORDS = new Set([
    "plan", "plans", "pack", "packs", "recharge", "recharges", "prepaid", "data", "internet",
    "with", "and", "or", "for", "a", "an", "the", "rs", "inr", "rupee", "rupees", "of", "in", "on",
    "me", "show", "find", "get", "give", "ott", "subscription", "free", "offer", "offers",
    "unlimited", "calls", "call", "calling", "voice", "sms", "per", "day", "days", "best", "cheap",
    "cheapest", "budget", "value", "top", "good", "please", "want", "need", "i", "my", "to", "than",
    "at", "only", "validity", "benefits", "benefit",
]);

const sym = (op) => (op === "$lte" ? "≤" : "≥");

export const parseSearchQuery = (input) => {
    const clauses = [];
    const chips = [];
    const operators = [];
    const otts = [];
    let wantsOtt = false;

    const source = String(input ?? "").slice(0, MAX_QUERY_LENGTH).toLowerCase();
    let rest = ` ${source.replace(/₹/g, " rs ").replace(/[,;]+/g, " ")} `;

    const consume = (pattern, handler) => {
        rest = rest.replace(pattern, (...args) => {
            handler(...args);
            return " ";
        });
    };

    const addPrice = (condition, label) => {
        clauses.push({ price: condition });
        chips.push(label);
    };
    const addValidity = (condition, label) => {
        clauses.push({ validityDays: condition });
        chips.push(label);
    };
    const addData = (condition, label) => {
        clauses.push({ $or: [{ dailyData: condition }, { totalData: condition }] });
        chips.push(label);
    };

    const addRange = (a, b, unit) => {
        const lo = Math.min(Number(a), Number(b));
        const hi = Math.max(Number(a), Number(b));
        if (unit === "gb") addData({ $gte: lo, $lte: hi }, `${lo}–${hi} GB`);
        else if (unit) addValidity({ $gte: lo, $lte: hi }, `${lo}–${hi} days`);
        else addPrice({ $gte: lo, $lte: hi }, `₹${lo}–${hi}`);
    };

    // 1. Ranges and comparators first, so their numbers are not read again.
    consume(BETWEEN, (_m, a, b, unit) => addRange(a, b, unit));
    consume(PLAIN_RANGE, (_m, a, b, unit) => addRange(a, b, unit));

    consume(COMPARE, (_m, word, amount, unit) => {
        const op = LOWER_BOUND_WORDS.has(word.replace(/\s+/g, " ")) ? "$lte" : "$gte";
        const value = Number(amount);
        if (unit === "gb") {
            addData({ [op]: value }, `${sym(op)} ${value} GB`);
        } else if (unit && unit.startsWith("month")) {
            addValidity(
                { [op]: op === "$lte" ? value * 31 : value * 28 },
                `${sym(op)} ${value} month${value === 1 ? "" : "s"}`
            );
        } else if (unit) {
            addValidity({ [op]: value }, `${sym(op)} ${value} days`);
        } else {
            addPrice({ [op]: value }, `${sym(op)} ₹${value}`);
        }
    });

    // 2. Data quantities.
    consume(DAILY_AFTER, (_m, v) => {
        clauses.push({ dailyData: Number(v) });
        chips.push(`${Number(v)} GB/day`);
    });
    consume(DAILY_BEFORE, (_m, v) => {
        clauses.push({ dailyData: Number(v) });
        chips.push(`${Number(v)} GB/day`);
    });
    consume(TOTAL_AFTER, (_m, v) => {
        clauses.push({ totalData: Number(v) });
        chips.push(`${Number(v)} GB total`);
    });
    consume(TOTAL_BEFORE, (_m, v) => {
        clauses.push({ totalData: Number(v) });
        chips.push(`${Number(v)} GB total`);
    });
    consume(BARE_GB, (_m, v) => addData(Number(v), `${Number(v)} GB`));

    // 3. Validity.
    consume(VALIDITY_DAYS, (_m, v) => addValidity(Number(v), `${Number(v)} days`));
    consume(VALIDITY_MONTHS, (_m, v) => {
        const months = Number(v);
        addValidity({ $gte: months * 28, $lte: months * 31 }, `${months} month${months === 1 ? "" : "s"}`);
    });
    consume(YEARLY, () => addValidity({ $gte: 336 }, "yearly"));

    // 4. Category. "non daily" must be consumed before "daily".
    consume(NON_DAILY, () => {
        clauses.push({ category: "Non-Daily" });
        chips.push("Non-Daily");
    });
    consume(DAILY, () => {
        clauses.push({ category: "Daily" });
        chips.push("Daily");
    });

    // 5. OTT apps, then operators ("jiohotstar" must not become the Jio operator).
    for (const [pattern, label] of OTT_PATTERNS) {
        consume(pattern, () => {
            if (!otts.includes(label)) otts.push(label);
        });
    }
    consume(ANY_OTT, () => {
        wantsOtt = true;
    });

    for (const [pattern, label] of OPERATOR_PATTERNS) {
        consume(pattern, () => {
            if (!operators.includes(label)) operators.push(label);
        });
    }

    // 6. Explicit prices, then any number left over.
    consume(PRICE_PREFIX, (_m, v) => addPrice(Number(v), `₹${Number(v)}`));
    consume(PRICE_SUFFIX, (_m, v) => addPrice(Number(v), `₹${Number(v)}`));
    consume(BARE_NUMBER, (_m, v) => {
        const value = Number(v);
        if (Number.isInteger(value) && value >= 10) {
            clauses.push({ $or: [{ price: value }, { validityDays: value }] });
            chips.push(String(value));
        } else {
            addData(value, `${value} GB`);
        }
    });

    if (operators.length > 0) {
        clauses.push({ operator: { $in: operators } });
        chips.unshift(...operators);
    }
    if (otts.length > 0) {
        clauses.push({ ottApps: { $all: otts } });
        chips.push(...otts);
    } else if (wantsOtt) {
        clauses.push({ "ottApps.0": { $exists: true } });
        chips.push("Any OTT");
    }

    const leftover = rest
        .replace(/[^a-z0-9.+\s]/g, " ")
        .split(/\s+/)
        .map((token) => token.replace(/^\.+|\.+$/g, ""))
        .filter((token) => token && !STOP_WORDS.has(token));

    // Words we cannot understand and nothing else to go on: match nothing rather
    // than silently returning the whole catalogue.
    const matchNothing = leftover.length > 0 && clauses.length === 0;
    if (matchNothing) clauses.push({ _id: { $in: [] } });

    return { clauses, chips, ignored: leftover, matchNothing };
};
