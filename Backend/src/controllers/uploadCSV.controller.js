import fs from "fs"
import csv from "csv-parser"
import { Plans } from "../models/plans.js";

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

const normalizeOtt = (ottApps) => {
    if (!ottApps) return [];
    return ottApps
        .split(',')
        .map((app) => app.trim())
        .filter(Boolean)
        .map((app) => OTT_ALIASES[app.toLowerCase()] || app);
};

const uploadCSV = async (req, res) => {
    try {
        if(!req.file) throw new Error("No file Uploaded")

        const result = []

        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                result.push(row)
            })
            .on('end', resolve)
            .on('error', reject)
        })

        let created = 0
        for (const row of result){
            await Plans.create({
                operator: row.operator,
                category: row.category,
                price: Number(row.price),
                validityDays: Number(row.validityDays),
                dailyData: row.dailyData ? Number(row.dailyData) : undefined,
                totalData: row.totalData ? Number(row.totalData) : row.dailyData * row.validityDays,
                sms: row.sms ? Number(row.sms) : undefined,
                isUnlimitedCalls: row.isUnlimitedCalls === "true",
                isUnlimitedSMS: row.isUnlimitedSMS === 'true',
                ottApps: normalizeOtt(row.ottApps),
                isActive: row.isActive === 'true'
            })
            created++;
        }

        res.status(201).json({
            success: true,
            message: `${created} plans imported successfully`
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    } finally {
        // Remove the uploaded temp file on success and on failure.
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path) } catch (cleanupErr) {
                console.error("Cleanup error: ", cleanupErr.message);
            }
        }
    }
}

export default uploadCSV;
