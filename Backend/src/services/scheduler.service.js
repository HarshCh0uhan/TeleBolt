import cron from 'node-cron'
import { sendWeeklyReminder } from './email.service.js'

cron.schedule("0 9 * * 1", async () => {
    console.log("Sending weekly plan verification reminder...")
    await sendWeeklyReminder()
})