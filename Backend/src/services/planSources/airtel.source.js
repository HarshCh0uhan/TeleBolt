import { buildPlan, parseDataText, parseSms, isUnlimitedVoice, parseValidityDays } from "./normalize.js";
import { SourcePayloadError } from "./errors.js";

export const AIRTEL_SOURCE = "airtel-sync";

const PLANS_URL = "https://www.bajajfinserv.in/airtel-prepaid-mobile-recharge";

const BROWSER_HEADERS = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-IN,en;q=0.9",
};

/** Extract plan tables from Bajaj Finserv HTML. */
const extractTables = (html) => {
    const tables = [];
    const tablePattern = /<table[\s\S]*?<\/table>/gi;
    let match;
    while ((match = tablePattern.exec(html)) !== null) {
        tables.push(match[0]);
    }
    return tables;
};

/** Parse a single HTML table into row objects. */
const parseTable = (tableHtml) => {
    const rows = [];
    const rowPattern = /<tr[\s\S]*?<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
        const rowHtml = rowMatch[0];
        const cellPattern = /<t[dh][\s\S]*?<\/t[dh]>/gi;
        const cells = [];
        let cellMatch;
        while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
            const cellHtml = cellMatch[0];
            // Strip HTML tags and decode entities
            const text = cellHtml
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&/g, "&")
                .replace(/&#43;/g, "+")
                .replace(/&[a-z]+;/gi, "")
                .replace(/\s+/g, " ")
                .trim();
            cells.push(text);
        }
        if (cells.length > 0) rows.push(cells);
    }
    return rows;
};

/** Check if a table has plan-like headers (Price, Data, and optionally Validity). */
const isPlanTable = (headers) => {
    const headerText = headers.join(" ").toLowerCase();
    const hasPrice = headerText.includes("price") || headerText.includes("plan") || headerText.includes("rs");
    const hasData = headerText.includes("data") || headerText.includes("gb") || headerText.includes("benefit");
    const hasValidity = headerText.includes("validity") || headerText.includes("days") || headerText.includes("day");
    const hasCalls = headerText.includes("call") || headerText.includes("voice") || headerText.includes("sms");
    
    // Skip navigation/menu tables
    if (headerText.includes("data plans") || headerText.includes("sms plans") || headerText.includes("postpaid plans")) {
        return false;
    }
    // Skip talktime/top-up tables
    if (headerText.includes("talktime") || headerText.includes("credited")) {
        return false;
    }
    
    // Accept tables with Price + Data + (Validity OR Calls)
    return hasPrice && hasData && (hasValidity || hasCalls);
};

/** Find column indices for price, validity, data, and extras. */
const findColumns = (headers) => {
    const indices = { price: -1, validity: -1, data: -1, calls: -1, extra: -1 };
    headers.forEach((header, i) => {
        const h = header.toLowerCase();
        if (h.includes("price") || h.includes("plan") || h.includes("rs")) indices.price = i;
        else if (h.includes("validity") || (h.includes("day") && !h.includes("data"))) indices.validity = i;
        else if (h.includes("extra") || h.includes("ott") || h.includes("note") || h.includes("detail")) indices.extra = i;
        else if (h.includes("data") || h.includes("gb")) indices.data = i;
        else if (h.includes("call") || h.includes("voice") || h.includes("sms")) indices.calls = i;
    });
    return indices;
};

/** Try to infer validity from extra text (e.g., "for 3 months", "28 days"). */
const inferValidityFromExtra = (extraText) => {
    if (!extraText) return null;
    const lower = extraText.toLowerCase();
    // "for 3 months" -> ~84 days
    const monthsMatch = lower.match(/for\s+(\d+)\s*month/);
    if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;
    // "28 days", "56 days", "84 days", "365 days"
    const daysMatch = lower.match(/(\d+)\s*day/);
    if (daysMatch) return parseInt(daysMatch[1], 10);
    // "1 month", "2 months", "3 months"
    const monthMatch = lower.match(/(\d+)\s*month/);
    if (monthMatch) return parseInt(monthMatch[1], 10) * 30;
    return null;
};

/** Check if a row describes an international roaming pack (should be excluded). */
const isRoamingPack = (description) => {
    const lower = description.toLowerCase();
    return (
        lower.includes("abroad") ||
        lower.includes("usa") ||
        lower.includes("europe") ||
        lower.includes("gulf") ||
        lower.includes("asia") ||
        lower.includes("africa") ||
        lower.includes("ic+og") ||
        lower.includes("ic og") ||
        lower.includes("incoming") ||
        lower.includes("outgoing") ||
        lower.includes("roaming activation") ||
        lower.includes("isd") ||
        lower.includes("international")
    );
};

/** Maps one Airtel table row onto the TeleBolt plan shape. */
const normalizeAirtelRow = (row, indices) => {
    if (indices.price === -1 || row.length <= indices.price) return null;

    const priceText = row[indices.price];
    const priceMatch = priceText.match(/[\d,]+/);
    if (!priceMatch) return null;
    const price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
    if (!price || price < 10) return null; // Skip invalid prices

    const validityText = indices.validity !== -1 && row.length > indices.validity ? row[indices.validity] : "";
    const dataText = indices.data !== -1 && row.length > indices.data ? row[indices.data] : "";
    const callsText = indices.calls !== -1 && row.length > indices.calls ? row[indices.calls] : "";
    const extraText = indices.extra !== -1 && row.length > indices.extra ? row[indices.extra] : "";

    // Build description for parsing
    const description = [dataText, callsText, extraText].filter(Boolean).join(" | ");

    // Skip international roaming packs
    if (isRoamingPack(description)) return null;

    const data = parseDataText(description);
    const sms = parseSms(description);
    
    // Try explicit validity first, then infer from extra text
    let validity = parseValidityDays(validityText);
    if (!validity || validity < 1 || validity > 365) {
        validity = inferValidityFromExtra(extraText);
    }
    // If still no validity, try to infer from data pattern for daily plans
    // Daily plans with price > 500 are likely 56/84 days
    if (!validity || validity < 1 || validity > 365) {
        if (data.dailyGb) {
            if (price >= 1000) validity = 84;
            else if (price >= 500) validity = 56;
            else validity = 28;
        } else {
            return null; // Can't determine validity for total-data plans without explicit validity
        }
    }
    if (!data.dailyGb && !data.totalGb) return null;

    // Generate a stable sourceRef from price + validity + data summary
    const dataSummary = data.dailyGb ? `${data.dailyGb}GBd` : `${data.totalGb}GB`;
    const sourceRef = `airtel_${price}_${validity}d_${dataSummary}`;

    return buildPlan({
        operator: "Airtel",
        source: AIRTEL_SOURCE,
        sourceRef,
        price,
        validityDays: validity,
        dailyData: data.dailyGb,
        totalData: data.totalGb,
        sms: sms.sms,
        isUnlimitedCalls: isUnlimitedVoice(callsText) || isUnlimitedVoice(description),
        isUnlimitedSMS: sms.unlimitedSms,
        ottApps: extractOttApps(description),
    });
};

/** Extract known OTT apps from description text. */
const extractOttApps = (text) => {
    const apps = [];
    const lower = text.toLowerCase();
    const OTT_PATTERNS = [
        [/jiohotstar|hotstar|disney\+?\s*hotstar/i, "JioHotstar"],
        [/amazon\s*prime|prime\s*video|prime\s*lite/i, "Prime"],
        [/netflix/i, "Netflix"],
        [/sony\s*liv|sonyliv/i, "SonyLiv"],
        [/zee\s*5|zee5/i, "Zee5"],
    ];
    for (const [pattern, label] of OTT_PATTERNS) {
        if (pattern.test(lower)) apps.push(label);
    }
    return [...new Set(apps)];
};

/** Parses all plan tables from Airtel page HTML. */
export const parseAirtelPlans = (html) => {
    const tables = extractTables(html);
    const plans = [];
    const seen = new Set();
    let malformed = 0;

    for (const tableHtml of tables) {
        const rows = parseTable(tableHtml);
        if (rows.length < 2) continue;

        const headers = rows[0];
        if (!isPlanTable(headers)) continue;

        const indices = findColumns(headers);

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            try {
                const plan = normalizeAirtelRow(row, indices);
                if (plan && !seen.has(plan.sourceRef)) {
                    seen.add(plan.sourceRef);
                    plans.push(plan);
                }
            } catch {
                malformed += 1;
            }
        }
    }

    return { plans, malformed };
};

export const fetchAirtelPlans = async ({ timeoutMs = 25000 } = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(PLANS_URL, {
            headers: BROWSER_HEADERS,
            redirect: "follow",
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Airtel (Bajaj Finserv) returned HTTP ${response.status}`);

        const html = await response.text();
        const { plans, malformed } = parseAirtelPlans(html);

        if (plans.length === 0) {
            throw new SourcePayloadError(
                "Airtel page contained no plan records – the page structure may have changed"
            );
        }

        return { plans, meta: { url: PLANS_URL, bytes: html.length, malformed } };
    } finally {
        clearTimeout(timer);
    }
};