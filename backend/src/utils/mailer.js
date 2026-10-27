const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
            return;
        }

        await transporter.sendMail({
            from: '"CashApp MVP" <no-reply@cashappmvp.com>',
            to,
            subject,
            html: htmlContent
        });
        console.log(`?? Email successfully sent to ${to}`);
    } catch (error) {
        console.error(`? Failed to send email to ${to}:`, error);
    }
};

module.exports = { sendEmail };
