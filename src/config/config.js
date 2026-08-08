import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const config = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    OTP_SECRET: process.env.OTP_SECRET || process.env.JWT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: process.env.SMTP_PORT || "",
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || "",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || "",
    GOOGLE_USER: process.env.GOOGLE_USER || process.env.SMTP_USER || "",
};

export default config;
