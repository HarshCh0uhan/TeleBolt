import { buildPlan, parseDataText, parseSms, isUnlimitedVoice, mbToGb } from "./normalize.js";

export const VI_SOURCE = "vi-sync";
const DEFAULT_URL = "https://www.myvi.in/prepaid/unlimited-calls-and-data-plans";

const BROWSER_HEADERS = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-IN,en;q=0.9",
};

/**
 * Vi renders its full prepaid catalogue into the Next.js flight payload, so the
 * plan list is already inside the page HTML as JSON. `self.__next_f.push([1,"..."])`
 * chunks hold it; joining and unescaping them yields that JSON.
 */
export const extractViPayload = (html) =>
    [...html.matchAll(/self\.__next_f\.push\(\[1,\s*"((?:[^"\\]|\\.)*)"\]\)/g)]
        .map((match) => match[1])
        .join("")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\u0026/g, "&")
        .replace(/\\\\/g, "\\");

/** Maps one Vi catalogue record onto the TeleBolt plan shape. */
export const normalizeViPlan = (raw) => {
    if (raw?.STATUS && String(raw.STATUS).toUpperCase() !== "SUCCESS") return null;

    const sourceRef = raw.ITEM_ID || raw.RECHARGEID_ATTR || raw.RECHARGENAME_ATTR;
    if (!sourceRef) return null;

    const data = parseDataText(raw.DATA_LINE_1);
    const totalGb = data.totalGb || mbToGb(raw.DATAUSAGE_ATTR);
    const sms = parseSms(raw.SMS_LINE_1);

    return buildPlan({
        operator: "VI",
        source: VI_SOURCE,
        sourceRef,
        price: raw.UNIT_COST || raw.CGRP_START_RANGE,
        validityDays: raw.VALIDITY_ATTR || raw["WEB-VALIDITY"],
        dailyData: data.dailyGb,
        totalData: totalGb,
        sms: sms.sms,
        isUnlimitedCalls: isUnlimitedVoice(raw.VOICE_LINE_1),
        isUnlimitedSMS: sms.unlimitedSms,
        ottApps: [],
    });
};

/** Parses every plan record out of a Vi flight payload. */
export const parseViPlans = (payload) => {
    const plans = [];
    const seen = new Set();
    let malformed = 0;

    const recordPattern = /\{"UNIT_COST"[\s\S]*?\}/g;
    let match;
    while ((match = recordPattern.exec(payload)) !== null) {
        try {
            const plan = normalizeViPlan(JSON.parse(match[0]));
            if (plan && !seen.has(plan.sourceRef)) {
                seen.add(plan.sourceRef);
                plans.push(plan);
            }
        } catch {
            malformed += 1;
        }
    }

    return { plans, malformed };
};

export const fetchViPlans = async ({ url, timeoutMs = 25000 } = {}) => {
    const target = url || process.env.VI_PLANS_URL || DEFAULT_URL;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(target, {
            headers: BROWSER_HEADERS,
            redirect: "follow",
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Vi returned HTTP ${response.status}`);

        const html = await response.text();
        const { plans, malformed } = parseViPlans(extractViPayload(html));
        if (plans.length === 0) {
            throw new Error("Vi page contained no plan records – the page structure may have changed");
        }

        return { plans, meta: { url: target, bytes: html.length, malformed } };
    } finally {
        clearTimeout(timer);
    }
};
