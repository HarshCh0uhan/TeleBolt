import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

export const sendEmailAlert = async(changes) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `TeleBolt — ${changes.length} Plan Change(s) Detected`,
        html: `
            <h2>Plan Changes Detected</h2>
            <p>${changes.length} plan(s) have changed:</p>
            <ul>
                ${changes.map(c => `
                    <li>
                        Plan ID: ${c.planId} — 
                        ${c.field} changed from 
                        ${c.oldValue} to ${c.newValue}
                    </li>
                `).join('')}
            </ul>
            <a href="${process.env.FRONTEND_URL}/admin/detected">
                Review Changes →
            </a>
        `
    })
}