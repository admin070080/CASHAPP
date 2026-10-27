const nodemailer = require('nodemailer');

// email-notifier.js

/**
 * Sends an email notification.
 * @param {string} recipient - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The body of the email.
 * @returns {Promise<void>}
 */
async function sendEmailNotification(recipient, subject, message) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service provider
            auth: {
                user: process.env.EMAIL_USER, // Set this in your environment variables
                pass: process.env.EMAIL_PASS, // Set this in your environment variables
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    sendEmailNotification,
};