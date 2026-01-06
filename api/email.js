// ================================================
// SALAMAT - Email API
// Sends from: sanmeetsinghkohli@gmail.com
// ================================================

const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

module.exports = async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        if (!to || !subject) {
            return res.status(400).json({ error: 'Missing "to" or "subject"' });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        });

        // Send email
        const result = await transporter.sendMail({
            from: `"Salamat Healthcare" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log('✅ Email sent:', result.messageId);

        return res.status(200).json({
            success: true,
            messageId: result.messageId
        });

    } catch (error) {
        console.error('❌ Email Error:', error.message);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
