import https from "node:https";
import { buildPlan, parseDataText, parseSms, isUnlimitedVoice } from "./normalize.js";
import { encryptCryptoJs, unwrapEncrypted } from "./cryptoJs.js";
import { SourceNotConfiguredError, SourcePayloadError, SourceUnavailableError } from "./errors.js";

export const BSNL_SOURCE = "bsnl-sync";

const SITE = "https://bsnl.co.in";
const RECHARGE_PAGE = `${SITE}/en/mobile/recharge`;
const PLANS_URL = `${SITE}/api/bsnl-proxy/api/recharge-plansnew`;

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

const PLAN_TABS = new Set([
    "UNLIMITED",
    "UNLIMTED",
    "Voice & Data Packs",
    "Data Packs",
    "Voice Packs",
    "RECHARGE",
    "Combo",
]);

// BSNL sells plans per circle — there is no national catalogue. TeleBolt is
// committed to the Madhya Pradesh circle on purpose: the same five-rupee plan
// can differ by circle, and the dedupe-by-id logic below would silently keep
// whichever circle fetched first. Rather than imply a national catalogue we
// don't have, we commit to one circle and label it in the UI.
//
// Overriding BSNL_CIRCLES is still supported for anyone who wants a different
// circle, but at this point in the project's life the choice is deliberate and
// the UI says so.
const DEFAULT_CIRCLES = ["Madhya Pradesh"];
const RETRY_DELAY_MS = 1200;

const circlesToTry = () => {
    const configured = process.env.BSNL_CIRCLES;
    if (!configured || !configured.trim()) return DEFAULT_CIRCLES;
    return configured
        .split(",")
        .map((circle) => circle.trim())
        .filter(Boolean);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const headerBag = (headers) => ({
    getSetCookie: () => {
        const cookies = headers["set-cookie"];
        if (!cookies) return [];
        return Array.isArray(cookies) ? cookies : [cookies];
    },
    get: (name) => {
        const value = headers[name.toLowerCase()];
        return Array.isArray(value) ? value.join(", ") : value || null;
    },
});

const httpsRequest = (url, { method = "GET", headers = {}, body, timeoutMs = 45000 } = {}) =>
    new Promise((resolve, reject) => {
        const target = new URL(url);
        const req = https.request(
            target,
            {
                method,
                headers,
                family: 4,
                timeout: timeoutMs,
            },
            (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    const text = Buffer.concat(chunks).toString("utf8");
                    const status = res.statusCode || 0;
                    resolve({
                        status,
                        ok: status >= 200 && status < 300,
                        headers: headerBag(res.headers),
                        text: async () => text,
                    });
                });
            }
        );

        req.on("timeout", () => req.destroy(new Error(`BSNL request timed out after ${timeoutMs}ms`)));
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });

const pick = (row, keys) => {
    for (const key of keys) {
        const value = row?.[key];
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

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

export const extractSession = (headers) => {
    const list = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
    const fromList = list.map((entry) => entry.split(";")[0]).find((entry) => entry.startsWith("bsnl_session="));
    if (fromList) return fromList;

    const combined = headers.get("set-cookie") || "";
    const match = combined.match(/bsnl_session=[^;,\s]+/);
    return match ? match[0] : null;
};

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
        sourceUrl: RECHARGE_PAGE,
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

export const fetchBsnlPlans = async ({ circles, cookie, timeoutMs = 30000 } = {}) => {
    const wantedCircles = circles || circlesToTry();

    if (wantedCircles.length === 0) {
        throw new SourceNotConfiguredError(
            "BSNL source has no circles configured. Either leave BSNL_CIRCLES unset " +
                "(defaults to Madhya Pradesh) or set it to a comma-separated list of " +
                'Indian telecom circles (for example "Madhya Pradesh,Maharashtra").'
        );
    }
    const configuredCookie = process.env.BSNL_PROXY_COOKIE;

    const meta = {
        circles: {},
        session: null,
        passphrase: process.env.BSNL_PASSPHRASE ? "env" : "bundle",
    };

    const request = async (url, options) => httpsRequest(url, { ...options, timeoutMs });

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
        if (process.env.BSNL_RELAY_URL) return;
        if (sessionCookie) return;

        try {
            sessionCookie = await mintSession();
            sessionMinted = true;
            meta.session = "minted";
        } catch (err) {
            if (configuredCookie && err instanceof SourceNotConfiguredError) {
                sessionCookie = configuredCookie;
                meta.session = "supplied-after-mint-failure";
                return;
            }
            throw err;
        }
    };

    const postForCircle = async (circle) => {
        const enc = encryptCryptoJs(
            JSON.stringify({ operatorCode: "BSNL", circleCode: circle }),
            BUNDLE_PASSPHRASE
        );

        const relayUrl = process.env.BSNL_RELAY_URL;
        if (relayUrl) {
            const response = await fetch(`${relayUrl.replace(/\/$/, "")}/api/bsnl-proxy`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ enc }),
            });
            const text = await response.text();
            return {
                status: response.status,
                ok: response.ok,
                headers: headerBag({}),
                text: async () => text,
            };
        }

        return request(PLANS_URL, {
            method: "POST",
            headers: { ...BROWSER_HEADERS, cookie: sessionCookie },
            body: JSON.stringify({ enc }),
        });
    };

    const attempt = async () => {
        const plans = [];
        const seen = new Set();

        for (const circle of wantedCircles) {
            await ensureSession();

            let response = await postForCircle(circle);

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
                    "(Delhi, Tamil Nadu) answer 'No recharge plans found' - set BSNL_CIRCLES to a working circle."
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
