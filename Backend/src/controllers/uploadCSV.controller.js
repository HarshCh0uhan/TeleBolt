import fs from "fs"
import csv from "csv-parser"
import { Plans } from "../models/plans";

const uploadCSV = async (req, res) => {
    try {
        if(!req.file) throw new Error("No file Uploaded")
        
        const result = []

        await Promise((res, rej) => {
            fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (row) => {
                result.push(row)
            })
            .on('end', res)
            .on('error', rej)
        })

        let created = 0
        for (const row of result){
            await Plans.create({
                operator: row.operator,
                category: row.category,
                price: Number(row.price),
                validityDays: Number(row.validityDays),
                dailyData: row.dailyData ? Number(row.dailyData) : undefined,
                totaldata: row.totalData ? Number(row.totalData) : undefined,
                sms: row.sms ? Number(row.sms) : undefined,
                isUnlimitedCalls: row.isUnlimitedCalls,
                isUnlimitedSMS: row.isUnlimitedSMS,
                ottApps: row.ottApps,
                isActive: row.isActive
            })
            created++;
        }

        fs.unlinkSync(req.file.path)

        res.status(201).json({
            success: true,
            message: `${created} plans imported successfully`
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}