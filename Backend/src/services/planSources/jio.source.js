import { buildPlan, parseDataText, parseSms, isUnlimitedVoice } from "./normalize.js";
import { SourcePayloadError } from "./errors.js";

export const JIO_SOURCE = "jio-sync";

const PLANS_URL = "https://www.jio.com/api/jio-mdmdata-service/mdmdata/recharge/plans";
// What we send the user to when they click "View on Jio". The API itself is not
// a page a human can browse, so the link points at the public prepaid listing.
const PUBLIC_PLANS_URL = "https://www.jio.com/selfcare/plans/mobility/prepaid-plans-list/";

const PRODUCT_TYPE = "MOBILITY";
const BILLING_TYPE = "1";

export const EXCLUDED_CATEGORIES = [
    "International Roaming",
    "ISD",
    "In-Flight Packs",
    "IR Wi-Fi Calling",
    "Top-up Voucher",
    "JioSaavn Pro",
    "JioLink",
    "4G Feature Phone Addon",
    "4G Feature Phone Plan",
];

const excludedCategories = () => {
    const configured = process.env.JIO_EXCLUDE_CATEGORIES;
    if (configured === undefined) return EXCLUDED_CATEGORIES;
    return configured
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
};

const OTT_BRANDS = [
    [/jiohotstar|hotstar|disney/i, "JioHotstar"],
    [/amazon\s*prime|\bprime\s*video\b/i, "Prime"],
    [/netflix/i, "Netflix"],
    [/sony\s*liv|sonyliv/i, "SonyLiv"],
    [/zee\s*5|zee5/i, "Zee5"],
];

const collectOttApps = (raw) => {
    const haystack = [
        raw?.description,
        raw?.planName,
        raw?.primeData ? JSON.stringify(raw.primeData) : "",
        raw?.misc ? JSON.stringify(raw.misc) : "",
    ]
        .filter(Boolean)
        .join(" ");

    return [...new Set(OTT_BRANDS.filter(([pattern]) => pattern.test(haystack)).map(([, label]) => label))];
};

const validitySource = (raw) => {
    const labelled = String(raw?.description || "").match(/validity\s*[-:]\s*([^.|]{1,24})/i);
    if (labelled) return labelled[1];

    const fromPlanName = String(raw?.planName || "").match(/(\d+)\s*D\b/i);
    if (fromPlanName) return fromPlanName[1];

    const expiry = Number(raw?.expiryDays);
    return Number.isFinite(expiry) && expiry > 0 ? expiry : undefined;
};

export const normalizeJioPlan = (raw, { sourceUrl } = {}) => {
    if (!raw?.id) return null;

    const description = String(raw.description || "");
    const data = parseDataText(description);
    const sms = parseSms(description);

    return buildPlan({
        operator: "Jio",
        source: JIO_SOURCE,
        sourceRef: String(raw.id),
        sourceUrl,
        price: raw.amount ?? raw.name,
        validityDays: validitySource(raw),
        dailyData: data.dailyGb,
        totalData: data.dailyGb ? null : data.totalGb,
        sms: sms.sms,
        isUnlimitedCalls: isUnlimitedVoice(description),
        isUnlimitedSMS: sms.unlimitedSms,
        ottApps: collectOttApps(raw),
    });
};

const flatten = (payload) => {
    const rows = [];
    for (const category of payload?.planCategories || []) {
        for (const sub of category.subCategories || []) {
            for (const plan of sub.plans || []) {
                rows.push({ ...plan, categoryLabel: category.type });
            }
        }
    }
    return rows;
};

export const fetchJioPlans = async ({ timeoutMs = 30000 } = {}) => {
    const url = `${PLANS_URL}?productType=${PRODUCT_TYPE}&billingType=${BILLING_TYPE}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
        response = await fetch(url, {
            headers: {
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
                accept: "application/json, text/plain, */*",
                "accept-language": "en-IN,en;q=0.9",
                referer: PUBLIC_PLANS_URL,
            },
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) throw new Error(`Jio returned HTTP ${response.status}`);

    const payload = await response.json();
    const skip = new Set(excludedCategories());
    const rows = flatten(payload).filter((row) => !skip.has(row.categoryLabel));

    const plans = [];
    const seen = new Set();
    for (const row of rows) {
        const plan = normalizeJioPlan(row, { sourceUrl: PUBLIC_PLANS_URL });
        if (plan && !seen.has(plan.sourceRef)) {
            seen.add(plan.sourceRef);
            plans.push(plan);
        }
    }

    const meta = {
        productType: PRODUCT_TYPE,
        billingType: BILLING_TYPE,
        categories: (payload?.planCategories || []).length,
        rows: rows.length,
        skippedCategories: [...skip],
    };

    if (plans.length === 0) {
        throw new SourcePayloadError(
            "Jio returned no usable prepaid plans. Their API shape may have changed, or " +
                "JIO_EXCLUDE_CATEGORIES is filtering out everything."
        );
    }

    return { plans, meta };
};
