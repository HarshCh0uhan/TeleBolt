import dotenv from "dotenv"
import nodemailer from "nodemailer"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const adminUrl = (path) => {
    const base = (process.env.FRONTEND_URL || "").replace(/\/$/, "")
    return `${base}${path}`
}

const sendEmailAlert = async () => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `TeleBolt - Time to verify plans: check Jio, Airtel, Vi for changes`,
        html: `
            <h2>Weekly Plan Verification Reminder</h2>
            <p>Time to manually check if any telecom plans have changed.</p>
            <ul>
                <li>Check Jio plans</li>
                <li>Check Airtel plans</li>
                <li>Check Vi plans</li>
            </ul>
            <a href="${adminUrl('/admin/detected-changes')}">
                Go to Admin Dashboard →
            </a>
        `
    })
}

export const sendWeeklyReminder = async () => {
    await sendEmailAlert({
        type: "reminder",
        message: "Weekly reminder to verify telecom plans manually"
    })
}

// Sent after every plan sync that found anything. Silent when nothing changed.
export const sendSyncSummaryEmail = async ({ status, totals, sources }) => {
    const hasNews = (totals?.newPlans || 0) > 0 || (totals?.changes || 0) > 0
    if (!hasNews) return

    const sourceRows = (sources || [])
        .map((row) => `
            <tr>
                <td style="padding:6px 10px;border-bottom:1px solid #eee;">${row.source}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #eee;">${row.status}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #eee;">${row.fetched}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #eee;">${row.newPlans}</td>
                <td style="padding:6px 10px;border-bottom:1px solid #eee;">${row.changes}</td>
            </tr>
        `)
        .join("")

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `TeleBolt sync: ${totals.newPlans} new plan(s), ${totals.changes} change(s) waiting`,
        html: `
            <h2>Plan sync finished (${status})</h2>
            <p>The daily sync found something that needs your review.</p>
            <ul>
                <li><strong>${totals.fetched}</strong> plans read</li>
                <li><strong>${totals.newPlans}</strong> new plan proposals</li>
                <li><strong>${totals.changes}</strong> field changes (price, validity, data, SMS)</li>
                <li><strong>${totals.unchanged}</strong> unchanged</li>
                <li><strong>${totals.skipped}</strong> skipped</li>
            </ul>

            <table style="border-collapse:collapse;margin-top:12px;">
                <thead>
                    <tr>
                        <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ccc;">Source</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ccc;">Status</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ccc;">Fetched</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ccc;">New</th>
                        <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #ccc;">Changes</th>
                    </tr>
                </thead>
                <tbody>${sourceRows}</tbody>
            </table>

            <p style="margin-top:20px;">
                <a href="${adminUrl('/admin/detected-changes')}"
                   style="display:inline-block;padding:10px 16px;background:#58c28d;color:#181818;text-decoration:none;border-radius:8px;font-weight:600;">
                    Review and approve changes →
                </a>
            </p>
        `
    })
}
