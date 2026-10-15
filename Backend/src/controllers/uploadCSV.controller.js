import { Readable } from "stream"
import csv from "csv-parser"
import { Plans } from "../models/plans.js";
import { logAudit } from "../services/audit.service.js";

const MAX_ROWS = 2000;

const OPERATORS = { jio: "Jio", airtel: "Airtel", vi: "VI", bsnl: "BSNL" };

const CATEGORIES = {
    daily: "Daily",
    "non-daily": "Non-Daily",
    "non daily": "Non-Daily",
    nondaily: "Non-Daily",
};

// Common CSV spellings mapped onto the values allowed by the Plans schema.
const OTT_ALIASES = {
    hotstar: "JioHotstar",
    jiohotstar: "JioHotstar",
    disneyhotstar: "JioHotstar",
    disney: "JioHotstar",
    prime: "Prime",
    amazonprime: "Prime",
    netflix: "Netflix",
    sonyliv: "SonyLiv",
    sony: "SonyLiv",
    zee5: "Zee5",
    zee: "Zee5",
    other: "Other",
};

const text = (value) => String(value ?? "").trim();

// Blank -> undefined, a positive number -> the number, anything else -> error.
const optionalNumber = (value) => {
    const raw = text(value);
    if (raw === "") return { value: undefined };
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return { error: true };
    return { value: n > 0 ? n : undefined };
};

// Blank -> fallback, "true"/"false" -> boolean, anything else -> error.
const optionalBoolean = (value, fallback) => {
    const raw = text(value).toLowerCase();
    if (raw === "") return { value: fallback };
    if (raw === "true") return { value: true };
    if (raw === "false") return { value: false };
    return { error: true };
};

const parseOtt = (value, errors) => {
    const raw = text(value);
    if (!raw) return [];
    const apps = [];
    for (const part of raw.split(",")) {
        const name = part.trim();
        if (!name) continue;
        const mapped = OTT_ALIASES[name.toLowerCase().replace(/[\s+_-]/g, "")];
        if (!mapped) {
            errors.push(`unknown OTT app "${name}"`);
            continue;
        }
        if (!apps.includes(mapped)) apps.push(mapped);
    }
    return apps;
};

// Returns { doc, errors }. `errors` is empty when the row is importable.
const buildPlanDoc = (row) => {
    const errors = [];

    const operator = OPERATORS[text(row.operator).toLowerCase()];
    if (!operator) errors.push(`operator "${text(row.operator)}" must be one of Jio, Airtel, VI, BSNL`);

    const category = CATEGORIES[text(row.category).toLowerCase()];
    if (!category) errors.push(`category "${text(row.category)}" must be Daily or Non-Daily`);

    const price = Number(text(row.price));
    if (!Number.isFinite(price) || price < 1) errors.push("price must be a number of at least 1");

    const validityDays = Number(text(row.validityDays));
    if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365)
        errors.push("validityDays must be a whole number from 1 to 365");

    const daily = optionalNumber(row.dailyData);
    if (daily.error) errors.push("dailyData must be a positive number");
    const total = optionalNumber(row.totalData);
    if (total.error) errors.push("totalData must be a positive number");
    const sms = optionalNumber(row.sms);
    if (sms.error) errors.push("sms must be a positive number");

    const unlimitedCalls = optionalBoolean(row.isUnlimitedCalls, true);
    if (unlimitedCalls.error) errors.push("isUnlimitedCalls must be true or false");
    const unlimitedSms = optionalBoolean(row.isUnlimitedSMS, false);
    if (unlimitedSms.error) errors.push("isUnlimitedSMS must be true or false");
    const active = optionalBoolean(row.isActive, true);
    if (active.error) errors.push("isActive must be true or false");

    const ottApps = parseOtt(row.ottApps, errors);

    let dailyData = daily.value;
    let totalData = total.value;
    if (dailyData === undefined && totalData === undefined) {
        errors.push("either dailyData or totalData is required");
    }
    if (dailyData !== undefined && totalData === undefined && Number.isInteger(validityDays) && validityDays > 0) {
        totalData = Math.round(dailyData * validityDays * 100) / 100;
    }

    if (errors.length > 0) return { doc: null, errors };

    return {
        doc: {
            operator,
            category,
            price,
            validityDays,
            dailyData,
            totalData,
            sms: sms.value,
            isUnlimitedCalls: unlimitedCalls.value,
            isUnlimitedSMS: unlimitedSms.value,
            ottApps,
            isActive: active.value,
        },
        errors,
    };
};

const uploadCSV = async (req, res) => {
    try {
        if(!req.file) throw new Error("No file Uploaded")

        const rows = []

        // The upload lives in memory (see upload.middleware.js), so stream the
        // buffer rather than reading a temp file.
        await new Promise((resolve, reject) => {
            Readable.from(req.file.buffer)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => {
                rows.push(row)
            })
            .on('end', resolve)
            .on('error', reject)
        })

        if (rows.length === 0) throw new Error("The CSV file has no data rows")
        if (rows.length > MAX_ROWS) throw new Error(`Too many rows. The maximum is ${MAX_ROWS} per file`)

        const docs = []
        const problems = []

        rows.forEach((row, index) => {
            // Row 1 is the header, so the first data row is row 2.
            const rowNumber = index + 2
            const { doc, errors } = buildPlanDoc(row)
            if (errors.length > 0) problems.push(`Row ${rowNumber}: ${errors.join("; ")}`)
            else docs.push(doc)
        })

        if (problems.length > 0) {
            const shown = problems.slice(0, 5).join(" | ")
            const extra = problems.length > 5 ? ` (+${problems.length - 5} more rows with errors)` : ""
            throw new Error(`No plans were imported. ${shown}${extra}`)
        }

        const created = await Plans.insertMany(docs)

        await logAudit({actor: req.user, action: "import_plans", entity: "Plan", details: `${created.length} plans imported via CSV`})

        res.status(201).json({
            success: true,
            message: `${created.length} plans imported successfully`
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export default uploadCSV;