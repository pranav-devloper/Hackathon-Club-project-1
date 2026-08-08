import nodemailer from 'nodemailer';
import config from '../config/config.js';

function createTransporter() {
    const smtpUser = config.SMTP_USER || config.GOOGLE_USER;
    const smtpPass = config.SMTP_PASS;
    const inferredGmailHost = smtpUser && /@gmail\.com$/i.test(smtpUser) ? 'smtp.gmail.com' : '';
    const smtpHost = config.SMTP_HOST || inferredGmailHost;

    if (smtpHost && smtpUser && smtpPass) {
        return {
            type: 'smtp',
            transporter: nodemailer.createTransport({
                host: smtpHost,
                port: Number(config.SMTP_PORT || 587),
                secure: Number(config.SMTP_PORT || 587) === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            }),
        };
    }

    if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_REFRESH_TOKEN && config.GOOGLE_USER) {
        return {
            type: 'gmail-oauth2',
            transporter: nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: config.GOOGLE_USER,
                    clientId: config.GOOGLE_CLIENT_ID,
                    clientSecret: config.GOOGLE_CLIENT_SECRET,
                    refreshToken: config.GOOGLE_REFRESH_TOKEN,
                },
            }),
        };
    }

    return null;
}

export const sendEmail = async (to, subject, text, html) => {
    try {
        const mailer = createTransporter();
console.log(mailer);

        if (!mailer) {
            throw new Error('Set SMTP_USER and SMTP_PASS for Gmail SMTP, or configure Google OAuth2 settings.');
        }

        const fromAddress = config.SMTP_FROM || config.GOOGLE_USER || config.SMTP_USER;

        const info = await mailer.transporter.sendMail({
            from: fromAddress ? `"Manufactory ERP" <${fromAddress}>` : 'Manufactory ERP <noreply@manufactory.com>',
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        if (nodemailer.getTestMessageUrl(info)) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return {
            sent: true,
            transport: mailer.type,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            sent: false,
            error: error.message,
        };
    }
};
