import cron from 'node-cron'
import { sendWeeklyReminder } from './email.service.js'
import { runPlanSync } from './planSync.service.js'
import { DEFAULT_SOURCES } from './planSources/index.js'

// The catalogue is India-only, so schedules are pinned to IST regardless of
// where the server runs.
const TIMEZONE = process.env.SYNC_TIMEZONE || 'Asia/Kolkata'

// Weekly nudge for anything that still has to be checked by hand.
cron.schedule("0 9 * * 1", async () => {
    console.log("Sending weekly plan verification reminder...")
    try {
        await sendWeeklyReminder()
    } catch (err) {
        console.error("Weekly reminder failed: ", err.message)
    }
}, { timezone: TIMEZONE })

// Daily automated pull of Vi and BSNL plans into the detected-changes queue.
// Nothing here writes to the catalogue: every difference becomes a proposal an
// admin approves or rejects.
cron.schedule(process.env.SYNC_CRON || "0 3 * * *", async () => {
    console.log("Running daily plan sync...")
    try {
        const { status, totals } = await runPlanSync({ sources: DEFAULT_SOURCES, trigger: "cron" })
        console.log(
            `Plan sync finished (${status}): fetched=${totals.fetched} new=${totals.newPlans} ` +
            `changes=${totals.changes} unchanged=${totals.unchanged} skipped=${totals.skipped}`
        )
    } catch (err) {
        console.error("Plan sync failed: ", err.message)
    }
}, { timezone: TIMEZONE })
