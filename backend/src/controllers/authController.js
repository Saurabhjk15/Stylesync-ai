import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// ── Token Generator ───────────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_12345', {
        expiresIn: '30d',
    });
};

// ── @desc    Register new user (email/password) ───────────────────────────────
// ── @route   POST /api/auth/signup ───────────────────────────────────────────
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: { message: 'Please provide all fields' } });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ success: false, error: { message: 'User already exists' } });
        }

        const user = await User.create({ name, email, password, provider: 'local' });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    user: {
                        _id:    user.id,
                        name:   user.name,
                        email:  user.email,
                        role:   user.role,
                        avatar: user.avatar || null,
                    },
                    token: generateToken(user._id),
                },
            });
        } else {
            res.status(400).json({ success: false, error: { message: 'Invalid user data' } });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// ── @desc    Authenticate a user (email/password) ─────────────────────────────
// ── @route   POST /api/auth/login ────────────────────────────────────────────
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: { message: 'Please provide email and password' } });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, error: { message: 'User does not exist' } });
        }

        // Google-only users can't login with password
        if (user.provider === 'google' && !user.password) {
            return res.status(400).json({
                success: false,
                error: { message: 'This account uses Google Sign-In. Please use the "Continue with Google" button.' },
            });
        }

        // Brute-force protection (skip for admin accounts — admin is always accessible)
        if (user.role !== 'admin') {
            if (user.lockUntil && user.lockUntil > Date.now()) {
                const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
                return res.status(429).json({
                    success: false,
                    error: { message: `Account locked. Please try again in ${remainingMinutes} minutes.` },
                });
            }
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Only lock non-admin accounts
            if (user.role !== 'admin') {
                user.loginAttempts += 1;
                if (user.loginAttempts >= 5) {
                    user.lockUntil = Date.now() + 5 * 60 * 1000;
                    await user.save();
                    return res.status(429).json({
                        success: false,
                        error: { message: 'Too many failed attempts. Account locked for 5 minutes.' },
                    });
                }
                await user.save();
            }
            return res.status(401).json({
                success: false,
                error: { message: 'Incorrect credentials. Please try again.' },
            });
        }

        // Successful login — reset attempts
        user.loginAttempts = 0;
        user.lockUntil     = undefined;
        await user.save();

        res.json({
            success: true,
            data: {
                user: {
                    _id:    user.id,
                    name:   user.name,
                    email:  user.email,
                    role:   user.role,
                    avatar: user.avatar || null,
                },
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// ── @desc    Google OAuth — Login or Register ─────────────────────────────────
// ── @route   POST /api/auth/google ───────────────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
    try {
        const { access_token, credential } = req.body;

        if (!access_token && !credential) {
            return res.status(400).json({ success: false, error: { message: 'Google token is required' } });
        }

        // Independently verify with Google (never trust client-sent profile data)
        let googleData;
        try {
            if (access_token) {
                // useGoogleLogin popup → access_token → verify via userinfo
                const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` },
                    timeout: 10_000,
                });
                googleData = userRes.data;
            } else {
                // GoogleLogin button → credential (id_token) → verify via tokeninfo
                const tokenRes = await axios.get(
                    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
                    { timeout: 10_000 }
                );
                googleData = tokenRes.data;
            }
        } catch {
            return res.status(401).json({ success: false, error: { message: 'Invalid Google token. Please try again.' } });
        }

        const { email, name, picture, sub: googleId } = googleData;

        // Find existing user by googleId OR email (link existing accounts)
        let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

        if (!user) {
            // New user — register them via Google
            user = await User.create({
                name:     name || email.split('@')[0],
                email:    email.toLowerCase(),
                googleId,
                avatar:   picture || null,
                provider: 'google',
            });
            console.log(`✅ New Google user registered: ${email}`);
        } else {
            // Existing user — link Google account if not already linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.provider = 'google';
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            // Reset any lockout (Google-verified users are trusted)
            user.loginAttempts = 0;
            user.lockUntil     = undefined;
            await user.save();
        }

        res.json({
            success: true,
            data: {
                user: {
                    _id:    user.id,
                    name:   user.name,
                    email:  user.email,
                    role:   user.role,
                    avatar: user.avatar || null,
                },
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        console.error('Google auth error:', error.message);
        res.status(500).json({ success: false, error: { message: 'Google authentication failed. Please try again.' } });
    }
};

// ── @desc    Get current logged in user ───────────────────────────────────────
// ── @route   GET /api/auth/me ─────────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};

// ── @desc    Request password reset email ─────────────────────────────────────
// ── @route   POST /api/auth/forgot-password ───────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: { message: 'Email is required' } });

        const user = await User.findOne({ email: email.toLowerCase() });

        // Always respond 200 — don't leak whether the email exists
        if (!user) {
            return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate a short-lived reset token (15 min)
        const resetToken = jwt.sign({ id: user._id, purpose: 'password-reset' }, process.env.JWT_SECRET || 'secret_key_12345', { expiresIn: '15m' });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // TODO: Send email via nodemailer/Resend/SendGrid
        // For now, log the reset URL — wire up your mail provider here
        console.log(`\n🔑 Password reset link for ${email}:\n${resetUrl}\n`);

        res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
};
