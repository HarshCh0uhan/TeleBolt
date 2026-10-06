import { buildPlan, parseDataText, parseSms, isUnlimitedVoice } from "./normalize.js";
import { encryptCryptoJs, unwrapEncrypted } from "./cryptoJs.js";
import { SourceNotConfiguredError, SourcePayloadError, SourceUnavailableError } from "./errors.js";

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
const RETRY_DELAY_MS = 1200;

const circlesToTry = () =>
    (process.env.BSNL_CIRCLES || DEFAULT_CIRCLES.join(","))
        .split(",")
        .map((circle) => circle.trim())
        .filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pick = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

/**
 * A Node `fetch` failure is just "fetch failed"; the reason lives on `cause`
 * (and on `cause.errors` for the aggregate from a dual-stack connect attempt).
 * Without this the run report is unactionable.
 */
const describeFetchError = (err) => {
    const cause = err?.cause;
    const details = [];

    if (Array.isArray(cause?.errors)) {
        for (const inner of cause.errors) details.push(inner?.code || inner?.message);
    } else if (cause) {
        if (cause.code) details.push(cause.code);
        if (cause.message) details.push(cause.message);
    }

    return [err?.message || String(err), ...details.filter(Boolean)].join(" | ");
};

const isNetworkFailure = (err) =>
    err?.name === "AbortError" ||
    (err?.name === "TypeError" && /fetch failed|terminated|other side closed/i.test(String(err.message)));

/** Used only once a request has already failed, to say whether the host reaches BSNL at all. */
const probeSite = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(SITE, {
            headers: { "user-agent": BROWSER_HEADERS["user-agent"] },
            signal: controller.signal,
        });
        return `bsnl.co.in itself answers from this host (HTTP ${response.status}), so the block is on the plan API`;
    } catch (err) {
        return `bsnl.co.in does not answer from this host either (${describeFetchError(err)})`;
    } finally {
        clearTimeout(timer);
    }
};

/** Reads `bsnl_session` from Set-Cookie, with or without getSetCookie() support. */
export const extractSession = (headers) => {
    const list = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    const fromList = list.map((entry) => entry.split(";")[0]).find((entry) => entry.startsWith("bsnl_session="));
    if (fromList) return fromList;

    // Some runtimes only expose the combined header, where cookies are comma separated.
    const combined = headers.get("set-cookie") || "";
    const match = combined.match(/bsnl_session=[^;,\s]+/);
    return match ? match[0] : null;
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
 *
 * A session is minted on every run in preference to a configured cookie, so a
 * stale BSNL_PROXY_COOKIE cannot wedge the source, and a rejected session is
 * retried once with a fresh one.
 */
export const fetchBsnlPlans = async ({ circles, cookie, timeoutMs = 30000 } = {}) => {
    const wantedCircles = circles || circlesToTry();
    const configuredCookie = process.env.BSNL_PROXY_COOKIE;

    const meta = {
        circles: {},
        session: null,
        passphrase: process.env.BSNL_PASSPHRASE ? "env" : "bundle",
    };

    const request = async (url, options) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: controller.signal, redirect: "follow" });
        } finally {
            clearTimeout(timer);
        }
    };

    const mintSession = async () => {
        const page = await request(RECHARGE_PAGE, {
            headers: { "user-agent": BROWSER_HEADERS["user-agent"], accept: "text/html" },
        });
        const session = extractSession(page.headers);
        if (!session) {
            throw new SourceNotConfiguredError(
                `BSNL did not issue a session cookie from ${RECHARGE_PAGE} (HTTP ${page.status}). ` +
                    "The site may be down or its flow may have changed."
            );
        }
        return session;
    };

    let sessionCookie = cookie || null;
    let sessionMinted = false;

    const ensureSession = async () => {
        if (sessionCookie) return;

        try {
            sessionCookie = await mintSession();
            sessionMinted = true;
            meta.session = "minted";
        } catch (err) {
            // Fall back to a configured cookie only if we have one to fall back to.
            if (configuredCookie && err instanceof SourceNotConfiguredError) {
                sessionCookie = configuredCookie;
                meta.session = "supplied-after-mint-failure";
                return;
            }
            throw err;
        }
    };

    const postForCircle = async (circle) =>
        request(PLANS_URL, {
            method: "POST",
            headers: { ...BROWSER_HEADERS, cookie: sessionCookie },
            body: JSON.stringify({
                enc: encryptCryptoJs(JSON.stringify({ operatorCode: "BSNL", circleCode: circle }), BUNDLE_PASSPHRASE),
            }),
        });

    const attempt = async () => {
        const plans = [];
        const seen = new Set();

        for (const circle of wantedCircles) {
            await ensureSession();

            let response = await postForCircle(circle);

            // A supplied cookie that is stale or expired is worth one fresh attempt.
            if ((response.status === 401 || response.status === 403) && !sessionMinted) {
                sessionCookie = await mintSession();
                sessionMinted = true;
                meta.session = "minted-after-rejection";
                response = await postForCircle(circle);
            }

            if (response.status === 401 || response.status === 403) {
                throw new SourceNotConfiguredError(
                    `BSNL rejected the session (HTTP ${response.status}) even after minting a fresh one. ` +
                        "Their proxy may have changed."
                );
            }
            if (!response.ok) {
                const body = (await response.text()).slice(0, 120);
                throw new Error(`BSNL returned HTTP ${response.status} for ${circle}: ${body}`);
            }

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

    let lastError;
    try {
        return await attempt();
    } catch (err) {
        lastError = err;
    }
    if (!isNetworkFailure(lastError)) throw lastError;

    // Datacenter links reset often enough to be worth a second try.
    await sleep(RETRY_DELAY_MS);
    try {
        return await attempt();
    } catch (err) {
        lastError = err;
    }
    if (!isNetworkFailure(lastError)) throw lastError;

    const probe = await probeSite();
    throw new SourceUnavailableError(
        `BSNL could not be reached from this host: ${describeFetchError(lastError)}. ${probe}. ` +
            "If it is unreachable, run the sync from a connection that can reach BSNL - " +
            "`node scripts/plan-sync-run.mjs bsnl-sync` writes to the same database."
    );
};
