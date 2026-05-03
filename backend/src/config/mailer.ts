import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    requireTLS: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});


export const sendMail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: `"LETSCODE" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    });
};
