import express from 'express';
import { registerUser, loginUser, googleAuth, getMe, forgotPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup',           registerUser);
router.post('/login',            loginUser);
router.post('/google',           googleAuth);
router.post('/forgot-password',  forgotPassword);
router.get('/me',                protect, getMe);

export default router;
