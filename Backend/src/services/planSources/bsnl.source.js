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
 * Fetches BSNL tariff rows.
 *
 * Verified against the live service with a real browser session: a bare request
 * is refused with 403 "Direct API access is strictly prohibited." (same-origin
 * check), a same-origin request without a session gets 401 "Authentication
 * required", and with the site's `bsnl_session` cookie the POST body must also
 * be AES-encrypted or it answers 403 "Plain text requests are not allowed".
 *
 * Even fully authenticated this endpoint returns BROADBAND only - "Bharat Air
 * Fiber" gives 57 fibre plans and "LANDLINE" gives 8 landline plans. The prepaid
 * catalogue (recharge-plansnew) answers "No recharge plans found" for BSNL in
 * every circle, because its real inputs come from fetch-operator, which needs a
 * live BSNL mobile number plus a captcha. Hence this source is expected to be
 * Skipped, and BSNL plans belong in the CSV import or Suggest a Plan flow.
 */
export const fetchBsnlPlans = async ({ circle, svctype, cookie, timeoutMs = 25000 } = {}) => {
    const sessionCookie = cookie || process.env.BSNL_PROXY_COOKIE;
    const selectedCircle = circle || process.env.BSNL_CIRCLE || "MH";
    const serviceType = svctype || process.env.BSNL_SVCTYPE || "prepaid";

    if (!sessionCookie) {
        throw new SourceNotConfiguredError(
            "BSNL prepaid plans are not available from any public endpoint. Its tariff API needs a " +
                "browser session AND an AES-encrypted body, and then returns broadband only " +
                "(Bharat Air Fiber / Landline). The prepaid lookup requires a live BSNL mobile " +
                "number plus a captcha. Add BSNL plans via CSV upload or Suggest a Plan instead."
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
