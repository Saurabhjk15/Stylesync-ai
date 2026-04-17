import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { login, loginWithGoogle, clearError } from '../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const EDITORIAL_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtM0Hc907opYy74TqOjtlY1G_DdJtYjc_aF2pT8SCCx2V0BEFrqCCmVQoswlMmK4w_ahxTgoS5hlbc8g_8PEao3Hb-6RJSVRzuivh7a1rJB-0murNhqFi79G9yu0vX6XGYiky9HP2vSsAzbxnrS9NnBVpFAwVA8LM4ug3BBZGQw4bZovVLPLEbD3zHgjjDxx76AvIHCSAIq6K9Oo5ZGhlJ4bmGCMWt04xq1a0ipbd7yndACWq3sX_tQAFsRaY1sQgXLLzaikua7slR';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Forgot password state
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotStatus, setForgotStatus] = useState(null); // 'sent' | 'error' | null
    const [forgotLoading, setForgotLoading] = useState(false);

    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const location   = useLocation();
    const { isAuthenticated, error, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
        if (isAuthenticated) {
            const from  = location.state?.from?.pathname || '/';
            const state = location.state?.from?.state || {};
            navigate(from, { state, replace: true });
        }
    }, [isAuthenticated, navigate, location, dispatch]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); dispatch(login(formData)).unwrap().catch(() => {}); };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        setForgotStatus(null);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            setForgotStatus(res.ok ? 'sent' : 'error');
        } catch {
            setForgotStatus('error');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                dispatch(loginWithGoogle({ access_token: tokenResponse.access_token })).unwrap();
            } catch { setGoogleLoading(false); }
        },
        onError: () => setGoogleLoading(false),
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* Left — Editorial image panel */}
            <div className="hidden lg:flex" style={{ width: '45%', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', borderRight: '0.5px solid var(--color-border)' }}>
                <img
                    src={EDITORIAL_IMG}
                    alt="Fashion Editorial"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,19,15,0.9) 0%, rgba(22,19,15,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
                    <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: 'var(--color-text)', margin: '0 0 8px', lineHeight: 1.2 }}>
                        Style, precisely yours.
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
                        AI-powered body scanning and wardrobe curation.
                    </p>
                </div>
            </div>

            {/* Right — Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', maxWidth: 400 }}
                >
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40 }}>
                        <span style={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                            Style<span style={{ color: 'var(--color-accent)' }}>Sync</span>
                        </span>
                    </Link>

                    <AnimatePresence mode="wait">
                        {forgotMode ? (
                            /* ── Forgot Password Panel ── */
                            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 30, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 6px' }}>
                                    Reset password
                                </h1>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
                                    Enter your email and we'll send you a link to reset your password.
                                </p>

                                {/* Success / Error banners */}
                                {forgotStatus === 'sent' && (
                                    <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(52,211,153,0.08)', border: '0.5px solid rgba(52,211,153,0.35)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 16, color: '#34D399' }}>check_circle</span>
                                        <p style={{ fontSize: 13, color: '#34D399', margin: 0 }}>Reset link sent — check your inbox.</p>
                                    </div>
                                )}
                                {forgotStatus === 'error' && (
                                    <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-err)' }}>error_outline</span>
                                        <p style={{ fontSize: 13, color: 'var(--color-err)', margin: 0 }}>Couldn't send reset link. Check the email and try again.</p>
                                    </div>
                                )}

                                <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    <div>
                                        <label className="label" htmlFor="forgot-email" style={{ display: 'block', marginBottom: 8 }}>Email address</label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--color-dim)' }}>mail</span>
                                            <input
                                                className="input"
                                                id="forgot-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={forgotEmail}
                                                onChange={e => setForgotEmail(e.target.value)}
                                                required
                                                style={{ paddingLeft: 42 }}
                                            />
                                        </div>
                                    </div>
                                    <motion.button
                                        type="submit"
                                        disabled={forgotLoading || forgotStatus === 'sent'}
                                        className="btn btn-primary"
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        style={{ width: '100%', justifyContent: 'center', opacity: (forgotLoading || forgotStatus === 'sent') ? 0.6 : 1 }}
                                    >
                                        {forgotLoading ? 'Sending…' : forgotStatus === 'sent' ? 'Link sent ✓' : 'Send reset link'}
                                    </motion.button>
                                </form>

                                <button
                                    onClick={() => { setForgotMode(false); setForgotStatus(null); setForgotEmail(''); }}
                                    style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-muted)', padding: 0, fontFamily: '"DM Sans"' }}
                                >
                                    <span className="material-icons" style={{ fontSize: 15 }}>arrow_back</span>
                                    Back to sign in
                                </button>
                            </motion.div>

                        ) : (
                            /* ── Sign In Panel ── */
                            <motion.div key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 6px' }}>
                                    Welcome back
                                </h1>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 32px' }}>
                                    Sign in to continue to your wardrobe.
                                </p>

                                {error && (
                                    <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-err)' }}>error_outline</span>
                                        <p style={{ fontSize: 13, color: 'var(--color-err)', margin: 0 }}>{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                        <label className="label" htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email address</label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--color-dim)' }}>mail</span>
                                            <input className="input" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required style={{ paddingLeft: 42 }} />
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <label className="label" htmlFor="password">Password</label>
                                            <button type="button" onClick={() => { setForgotMode(true); setForgotStatus(null); }}
                                                style={{ fontSize: 11, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: '"DM Sans"' }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
                                            >Forgot?</button>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--color-dim)' }}>lock</span>
                                            <input className="input" id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ paddingLeft: 42, paddingRight: 42 }} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 0 }}>
                                                <span className="material-icons" style={{ fontSize: 18 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <motion.button type="submit" disabled={loading} className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                        style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                        {loading ? 'Signing in…' : 'Sign In'}
                                    </motion.button>
                                </form>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                    <span style={{ fontSize: 11, color: 'var(--color-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                </div>

                                <motion.button type="button" onClick={() => handleGoogleLogin()} disabled={googleLoading || loading} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)', borderRadius: 4, padding: '13px 20px', cursor: 'pointer', fontFamily: '"DM Sans"', fontSize: 13, fontWeight: 500, color: 'var(--color-muted)', transition: 'border-color 0.2s, color 0.2s', opacity: (googleLoading || loading) ? 0.6 : 1 }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted)'; }}
                                >
                                    {googleLoading ? (
                                        <span className="material-icons animate-spin" style={{ fontSize: 18 }}>autorenew</span>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                    )}
                                    {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
                                </motion.button>

                                <p style={{ marginTop: 28, fontSize: 13, color: 'var(--color-muted)', textAlign: 'center' }}>
                                    Don't have an account?{' '}
                                    <Link to="/signup" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
