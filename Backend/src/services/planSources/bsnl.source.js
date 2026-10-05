import { buildPlan, parseDataText, parseSms, isUnlimitedVoice } from "./normalize.js";
import { encryptCryptoJs, unwrapEncrypted } from "./cryptoJs.js";
import { SourceNotConfiguredError, SourcePayloadError } from "./errors.js";

export const BSNL_SOURCE = "bsnl-sync";

const SITE = "https://bsnl.co.in";
const RECHARGE_PAGE = `${SITE}/en/mobile/recharge`;
const PLANS_URL = `${SITE}/api/bsnl-proxy/api/recharge-plansnew`;

// Found in BSNL's own JS bundle, which uses CryptoJS with this passphrase for
// request bodies and responses. It is not a secret - it ships to every browser -
// but it can change whenever they redeploy, hence the env override.
const BUNDLE_PASSPHRASE =
    process.env.BSNL_PASSPHRASE || "9a7b8e1f2c3d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b";

const BROWSER_HEADERS = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    origin: SITE,
    referer: RECHARGE_PAGE,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
};

// Groups that hold actual mobile plans. TOPUP / VAS / FRC are vouchers or
// add-ons, and International Roaming is not a domestic plan.
const PLAN_TABS = new Set([
    "UNLIMITED",
    "UNLIMTED",
    "Voice & Data Packs",
    "Data Packs",
    "Voice Packs",
    "RECHARGE",
    "Combo",
]);

const DEFAULT_CIRCLES = ["Madhya Pradesh"];

const circlesToTry = () =>
    (process.env.BSNL_CIRCLES || DEFAULT_CIRCLES.join(","))
        .split(",")
        .map((circle) => circle.trim())
        .filter(Boolean);

const pick = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

/** Maps one BSNL recharge row onto the TeleBolt plan shape. */
export const normalizeBsnlPlan = (raw, { circle } = {}) => {
    const sourceRef = pick(raw, ["productId", "productCode", "PLAN_ID", "id"]);
    if (!sourceRef) return null;

    const description = [
        pick(raw, ["description", "shortDescription", "BENEFIT", "DETAILS"]),
        pick(raw, ["productName", "PLAN_NAME"]),
    ]
        .filter(Boolean)
        .join(" | ");

    const data = parseDataText(description);
    const sms = parseSms(description);

    return buildPlan({
        operator: "BSNL",
        source: BSNL_SOURCE,
        sourceRef: String(sourceRef),
        price: pick(raw, ["price", "denomination", "amount", "MRP"]),
        validityDays: pick(raw, ["validityDesc", "validity", "VALIDITY"]),
        dailyData: data.dailyGb,
        totalData: data.totalGb,
        sms: sms.sms,
        isUnlimitedCalls: isUnlimitedVoice(description) || !description,
        isUnlimitedSMS: sms.unlimitedSms,
        ottApps: [],
    });
};

/**
 * Fetches BSNL prepaid plans for the configured circles.
 *
 * BSNL hands out an anonymous `bsnl_session` cookie just for loading the
 * recharge page, and that is all the API needs - no login, no mobile number and
 * no captcha. Request bodies must be AES encrypted and responses come back
 * encrypted as well. Verified live: 59-61 plans per working circle.
 */
export const fetchBsnlPlans = async ({ circles, cookie, timeoutMs = 30000 } = {}) => {
    const wantedCircles = circles || circlesToTry();

    const request = async (url, options) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: controller.signal, redirect: "follow" });
        } finally {
            clearTimeout(timer);
        }
    };

    // 1. Mint an anonymous session, unless one was supplied.
    let sessionCookie = cookie || process.env.BSNL_PROXY_COOKIE;
    let mintedSession = false;
    if (!sessionCookie) {
        const page = await request(RECHARGE_PAGE, {
            headers: { "user-agent": BROWSER_HEADERS["user-agent"], accept: "text/html" },
        });
        const setCookies = typeof page.headers.getSetCookie === "function" ? page.headers.getSetCookie() : [];
        const session = setCookies
            .map((entry) => entry.split(";")[0])
            .find((entry) => entry.startsWith("bsnl_session="));

        if (!session) {
            throw new SourceNotConfiguredError(
                `BSNL did not issue a session cookie from ${RECHARGE_PAGE} (HTTP ${page.status}). ` +
                    "The site may be down or its flow may have changed."
            );
        }
        sessionCookie = session;
        mintedSession = true;
    }

    // 2. Pull each circle's catalogue.
    const plans = [];
    const seen = new Set();
    const meta = {
        circles: {},
        session: mintedSession ? "minted" : "supplied",
        passphrase: process.env.BSNL_PASSPHRASE ? "env" : "bundle",
    };

    for (const circle of wantedCircles) {
        const response = await request(PLANS_URL, {
            method: "POST",
            headers: { ...BROWSER_HEADERS, cookie: sessionCookie },
            body: JSON.stringify({
                enc: encryptCryptoJs(JSON.stringify({ operatorCode: "BSNL", circleCode: circle }), BUNDLE_PASSPHRASE),
            }),
        });

        if (response.status === 401 || response.status === 403) {
            throw new SourceNotConfiguredError(
                `BSNL rejected the session (HTTP ${response.status}). Clear BSNL_PROXY_COOKIE so a fresh one is minted.`
            );
        }
        if (!response.ok) throw new Error(`BSNL returned HTTP ${response.status} for ${circle}`);

        const data = unwrapEncrypted(await response.text(), BUNDLE_PASSPHRASE);
        const groups = data?.mobilePlans || data?.PLANS || {};
        const rows = Object.entries(groups).flatMap(([tab, list]) =>
            PLAN_TABS.has(tab) && Array.isArray(list) ? list : []
        );

        meta.circles[circle] = { message: data?.message || "", rows: rows.length };

        for (const row of rows) {
            const plan = normalizeBsnlPlan(row, { circle });
            if (plan && !seen.has(plan.sourceRef)) {
                seen.add(plan.sourceRef);
                plans.push(plan);
            }
        }
    }

    if (plans.length === 0) {
        throw new SourcePayloadError(
            `BSNL returned no usable prepaid plans for ${wantedCircles.join(", ")}. Some circles ` +
                "(Delhi, Tamil Nadu) answer 'No recharge plans found' - pick another via BSNL_CIRCLES."
        );
    }

    return { plans, meta };
};
