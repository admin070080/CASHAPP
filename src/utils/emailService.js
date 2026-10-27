const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../data/email-log.json');

/**
 * Email Service (Simulation for MVP)
 * Logs emails instead of actually sending them
 */
class EmailService {

    /**
     * Send a generic email
     */
    static sendEmail(to, subject, message) {
        if (!to || !subject || !message) {
            throw new Error("Missing email fields");
        }

        const email = {
            to,
            subject,
            message,
            timestamp: new Date().toISOString()
        };

        this.logEmail(email);

        console.log(`
📧 EMAIL SENT (SIMULATED)
To: ${to}
Subject: ${subject}
Message: ${message}
        `);

        return {
            success: true,
            info: "Email logged (simulation)",
            email
        };
    }

    /**
     * Send transaction alert email
     */
    static sendTransactionEmail(to, type, amount, cashtag) {
        const subject = type === "credit"
            ? "💰 You received money!"
            : "💸 Payment sent";

        const message = type === "credit"
            ? `You have received $${amount} into your account (${cashtag}).`
            : `You sent $${amount} from your account (${cashtag}).`;

        return this.sendEmail(to, subject, message);
    }

    /**
     * Send welcome email
     */
    static sendWelcomeEmail(to, cashtag) {
        const subject = "🎉 Welcome to CashApp MVP!";
        const message = `
Hello!

Your account has been created successfully.

Your cashtag: ${cashtag}

Start sending and receiving money instantly 🚀

- CashApp MVP Team
        `;

        return this.sendEmail(to, subject, message);
    }

    /**
     * Send password reset email
     */
    static sendPasswordResetEmail(to, resetToken) {
        const subject = "🔐 Password Reset Request";
        const message = `
We received a request to reset your password.

Use this token to reset your password:
${resetToken}

If you did not request this, please ignore this email.
        `;

        return this.sendEmail(to, subject, message);
    }

    // ======================== PRIVATE ========================

    static logEmail(email) {
        let logs = [];

        if (fs.existsSync(LOG_FILE)) {
            try {
                logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
            } catch (err) {
                console.error("Error reading email log:", err);
            }
        }

        logs.push(email);

        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    }
}

module.exports = EmailService;