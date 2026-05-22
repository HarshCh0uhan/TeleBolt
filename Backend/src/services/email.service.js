import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const sendEmailAlert = async(changes) => {
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
            <a href="${process.env.FRONTEND_URL}/admin/detected">
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