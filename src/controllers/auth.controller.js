import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";

function validateStrongPassword(password) {
    if (!password || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter (A-Z).";
    }
    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter (a-z).";
    }
    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number (0-9).";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character (!@#$%^&*...).";
    }
    return null;
}

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const pwdError = validateStrongPassword(password);
        if (pwdError) {
            return res.status(400).json({ message: pwdError });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await userModel.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            verified: false
        });

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash
        });

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const mailResult = await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html);

        if (!mailResult.sent) {
            return res.status(500).json({
                message: "OTP email could not be sent. Please configure SMTP or Gmail app-password settings.",
            });
        }

        res.status(201).json({
            message: "User registered successfully. Please verify your email with the OTP sent.",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            },
            accessToken,
        });
    } catch (err) {
        console.error("[Register Error]", err);
        res.status(500).json({ message: "Internal server error during registration" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const refreshToken = jwt.sign({
            id: user._id
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = jwt.sign({
            id: user._id,
            sessionId: session._id
        }, config.JWT_SECRET, {
            expiresIn: "15m"
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            },
            accessToken
        });
    } catch (err) {
        console.error("[Login Error]", err);
        res.status(500).json({ message: "Internal server error during login" });
    }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token not found"
            });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        await sessionModel.updateMany({
            user: decoded.id,
            revoked: false
        }, {
            revoked: true
        });

        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logged out from all devices successfully"
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error during logout" });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({ message: "OTP and email are required" });
        }

        const otpHash = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");

        const otpDoc = await otpModel.findOne({
            email,
            otpHash
        });

        if (!otpDoc) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const user = await userModel.findByIdAndUpdate(otpDoc.user, {
            verified: true
        });

        await otpModel.deleteMany({
            user: otpDoc.user
        });

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: true
            }
        });
    } catch (err) {
        console.error("[Verify Email Error]", err);
        res.status(500).json({ message: "Internal server error during email verification" });
    }
}

export async function forgotPassword(req, res) {
    try {
        console.log('in oathcontroller');
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        const otp = generateOtp();
        const otpHash = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");

        await otpModel.deleteMany({ user: user._id });
        await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash
        });

        const html = getOtpHtml(otp);
        const mailResult = await sendEmail(email, "Password Reset OTP", `Your password reset OTP code is ${otp}`, html);

        if (!mailResult.sent) {
            return res.status(500).json({
                message: "Password reset OTP could not be sent. Please configure SMTP or Gmail app-password settings.",
            });
        }

        return res.status(200).json({ message: "Password reset OTP sent to your email" });
    } catch (err) {
        console.error("[Forgot Password Error]", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const otpHash = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
        const otpDoc = await otpModel.findOne({ email, otpHash });

        if (!otpDoc) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const resetToken = jwt.sign(
            { email: email.toLowerCase().trim(), scope: 'password_reset' },
            config.JWT_SECRET,
            { expiresIn: '5m' }
        );

        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken,
            valid: true
        });
    } catch (err) {
        console.error("[Verify OTP Error]", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, resetToken, otp, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required" });
        }

        const pwdError = validateStrongPassword(newPassword);
        if (pwdError) {
            return res.status(400).json({ message: pwdError });
        }

        let user = null;
        if (resetToken) {
            try {
                const decoded = jwt.verify(resetToken, config.JWT_SECRET);
                if (decoded.scope !== 'password_reset' || decoded.email !== email.toLowerCase().trim()) {
                    return res.status(400).json({ message: "Invalid password reset token" });
                }
                user = await userModel.findOne({ email });
            } catch (err) {
                return res.status(400).json({ message: "Reset session expired or token invalid" });
            }
        } else if (otp) {
            const otpHash = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
            const otpDoc = await otpModel.findOne({ email, otpHash });
            if (!otpDoc) {
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            user = await userModel.findById(otpDoc.user);
            await otpModel.deleteMany({ user: user._id });
        } else {
            return res.status(400).json({ message: "Missing reset token or OTP" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error("[Reset Password Error]", err);
        res.status(500).json({ message: "Internal server error during password reset" });
    }
}

export async function getMe(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No authorization token provided." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User account no longer exists." });
        }

        return res.json({
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

export async function getInbox(_req, res) {
    res.json([]);
}
