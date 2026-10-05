import { buildPlan, parseDataText, parseSms, isUnlimitedVoice } from "./normalize.js";
import { SourceNotConfiguredError, SourcePayloadError } from "./errors.js";

export const BSNL_SOURCE = "bsnl-sync";

const API_URL = "https://bsnl.co.in/api/bsnl-proxy/myBsnlApp/rest/cofetchtariffnew";
const SITE = "https://bsnl.co.in";

const BROWSER_HEADERS = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "application/json, text/plain, */*",
    "accept-language": "en-IN,en;q=0.9",
    "content-type": "application/json",
    "x-requested-with": "XMLHttpRequest",
    origin: SITE,
    referer: `${SITE}/en/pricing-plans/prepaid`,
};

/**
 * Extra headers captured from the browser request, as a JSON object in
 * BSNL_EXTRA_HEADERS. BSNL's proxy sometimes requires a token header, and this
 * lets you paste it (e.g. from "Copy as cURL") without touching the code.
 */
const extraHeaders = () => {
    const raw = process.env.BSNL_EXTRA_HEADERS;
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        console.error("BSNL_EXTRA_HEADERS is not valid JSON - ignoring it");
        return {};
    }
};

const pick = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

/**
 * BSNL's myBSNL tariff rows use several different key spellings across circles,
 * so this reads the documented names first and falls back to tolerant aliases.
 * The exact live shape still needs verifying with a real session cookie.
 */
export const normalizeBsnlPlan = (raw, { circle } = {}) => {
    const sourceRef = pick(raw, ["PLAN_ID", "PLAN_CODE", "productId", "productCode", "short_desc", "PLAN_NAME", "id"]);
    if (!sourceRef) return null;

    const benefitText = [
        pick(raw, ["BENEFIT", "BENEFITS", "BENEFIT_DESC"]),
        pick(raw, ["DATA", "DATA_BENEFIT", "DATA_BENEFIT_DESC"]),
        pick(raw, ["description", "DESCRIPTION", "PLAN_DESC", "TARIFF_DESC", "DETAILS", "TARIFF"]),
    ]
        .filter(Boolean)
        .join(" | ");

    const dataText = pick(raw, ["DATA", "DATA_BENEFIT", "DATA_BENEFIT_DESC"]) || benefitText;
    const voiceText = pick(raw, ["VOICE", "VOICE_BENEFIT", "VOICE_DESC"]) || benefitText;
    const smsText = pick(raw, ["SMS", "SMS_BENEFIT", "SMS_DESC"]) || benefitText;

    const data = parseDataText(dataText);
    const sms = parseSms(smsText);

    return buildPlan({
        operator: "BSNL",
        source: BSNL_SOURCE,
        // Circle-scoped id keeps the same pack in two circles distinct.
        sourceRef: circle ? `${circle}:${sourceRef}` : String(sourceRef),
        price: pick(raw, ["MRP", "price", "amount", "denomination", "DISCOUNTED_FMC", "FMC"]),
        validityDays: pick(raw, ["VALIDITY", "validityDesc", "validity", "VALIDITY_DESC", "validity_desc"]),
        dailyData: data.dailyGb,
        totalData: data.totalGb,
        sms: sms.sms,
        isUnlimitedCalls: isUnlimitedVoice(voiceText) || !voiceText,
        isUnlimitedSMS: sms.unlimitedSms,
        ottApps: [],
    });
};

/**
 * Fetches BSNL prepaid tariff rows.
 *
 * BSNL serves these through its own Next.js proxy, which answers
 * `401 Authentication required` without a signed-in session (and blocks direct
 * API access with 403). Supply a session cookie to enable this source.
 */
export const fetchBsnlPlans = async ({ circle, svctype, cookie, timeoutMs = 25000 } = {}) => {
    const sessionCookie = cookie || process.env.BSNL_PROXY_COOKIE;
    const selectedCircle = circle || process.env.BSNL_CIRCLE || "MH";
    const serviceType = svctype || process.env.BSNL_SVCTYPE || "prepaid";

    if (!sessionCookie) {
        throw new SourceNotConfiguredError(
            "BSNL blocks its tariff API without a browser session (HTTP 401). " +
                "Open bsnl.co.in/en/pricing-plans/prepaid, DevTools > Network > Fetch/XHR, " +
                "change the circle so the cofetchtariffnew request appears, then right-click it and " +
                "use Copy as cURL: put the Cookie header in BSNL_PROXY_COOKIE and any x-* token " +
                "header in BSNL_EXTRA_HEADERS (JSON) in Backend/.env"
        );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { ...BROWSER_HEADERS, ...extraHeaders(), cookie: sessionCookie },
            body: JSON.stringify({ svctype: serviceType, circle: selectedCircle }),
            signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
            throw new SourceNotConfiguredError(
                `BSNL rejected the session (HTTP ${response.status}). Re-copy the Cookie header, and the ` +
                    `x-* token header if the request has one, into BSNL_PROXY_COOKIE / BSNL_EXTRA_HEADERS.`
            );
        }
        if (!response.ok) throw new Error(`BSNL returned HTTP ${response.status}`);

        const data = await response.json();
        const rows = Array.isArray(data?.PLANS) ? data.PLANS : Array.isArray(data) ? data : null;
        if (!rows) throw new SourcePayloadError("BSNL response did not contain a PLANS array");

        const plans = rows
            .map((row) => normalizeBsnlPlan(row, { circle: selectedCircle }))
            .filter(Boolean);

        if (plans.length === 0) {
            throw new SourcePayloadError("BSNL returned no plans that could be normalised");
        }

        return {
            plans,
            meta: { circle: selectedCircle, svctype: serviceType, rows: rows.length },
        };
    } finally {
        clearTimeout(timer);
    }
};
