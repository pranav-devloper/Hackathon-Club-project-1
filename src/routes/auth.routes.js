import express from 'express';
import {
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getMe,
    getInbox
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/inbox', getInbox);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
