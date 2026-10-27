// src/controllers/notificationController.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Notification Controller
 * Handles all email and in-app notifications
 */
class NotificationController {

    /**
     * Send Transaction Notification (Email + In-App)
     */
    static sendTransactionAlert(transaction) {
        try {
            const users = this.getAllUsers();
            
            const receiver = users.find(user => user.cashtag === transaction.to);
            const sender = users.find(user => user.cashtag === transaction.from);

            if (!receiver) return;

            const emailSubject = transaction.type === "received" || transaction.amount > 0 
                ? "You Received Money" 
                : "Payment Sent";

            const emailBody = `
                Hello ${receiver.fullName},

                ${transaction.from === "ADMIN" 
                    ? `An admin has sent you $${transaction.amount}` 
                    : `You have received $${transaction.amount} from ${sender ? sender.fullName : transaction.from}`}

                Transaction Details:
                • Amount     : $${parseFloat(transaction.amount).toFixed(2)}
                • From       : ${transaction.from}
                • Date       : ${new Date(transaction.date || Date.now()).toLocaleString()}
                • Cashtag    : ${receiver.cashtag}

                Your new balance: $${(receiver.balance || 0).toFixed(2)}

                Thank you for using CashApp!
                Best regards,
                CashApp Team
            `;

            // Simulate Email Sending
            console.log("=".repeat(60));
            console.log(`📧 EMAIL NOTIFICATION SENT`);
            console.log(`To: ${receiver.email}`);
            console.log(`Subject: ${emailSubject}`);
            console.log("-".repeat(40));
            console.log(emailBody);
            console.log("=".repeat(60));

            // In real app, you would integrate with SendGrid, Nodemailer, etc.
            this.logNotification({
                userId: receiver.id,
                email: receiver.email,
                type: "transaction",
                subject: emailSubject,
                amount: transaction.amount,
                timestamp: new Date().toISOString()
            });

            return true;

        } catch (error) {
            console.error("Failed to send notification:", error);
            return false;
        }
    }

    /**
     * Send Welcome Email (on signup)
     */
    static sendWelcomeEmail(user) {
        console.log("=".repeat(60));
        console.log(`📧 WELCOME EMAIL SENT to ${user.email}`);
        console.log(`Subject: Welcome to CashApp, ${user.fullName}!`);
        console.log(`Message: Your account has been created. You've received a $50 welcome bonus.`);
        console.log(`Your Cashtag: ${user.cashtag}`);
        console.log("=".repeat(60));

        this.logNotification({
            userId: user.id,
            email: user.email,
            type: "welcome",
            subject: "Welcome to CashApp",
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log notification (for audit trail)
     */
    static logNotification(notification) {
        const LOG_DIR = path.join(DATA_DIR, 'logs');
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        const logFile = path.join(LOG_DIR, 'notifications.log');
        const logEntry = `[${notification.timestamp}] ${notification.type.toUpperCase()} → ${notification.email} | ${notification.subject}\n`;

        fs.appendFileSync(logFile, logEntry);
    }

    /**
     * Get all users (helper)
     */
    static getAllUsers() {
        if (!fs.existsSync(USERS_FILE)) return [];
        try {
            return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        } catch (e) {
            return [];
        }
    }

    /**
     * Simulate email service status
     */
    static getServiceStatus() {
        return {
            emailService: "active",
            lastSent: new Date().toISOString(),
            totalNotificationsToday: 124
        };
    }
}

module.exports = NotificationController;