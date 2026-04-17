import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
import { signup, loginWithGoogle, clearError } from '../redux/slices/authSlice';
import { motion } from 'framer-motion';

const EDITORIAL_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSmWxI1bFdio7vzvPb7u-ImJx14GHsWSps9_T4_92p84H7dKgCaVP8M8_5hPuakVNYGbkZAQCOhqVeY0c1keZXRrNzeNW616Tq9rUWdSATWZgfHprnx6lZwy4iBi20TK1_yIFJEjkGzaph__eAPu_XibXf_Q7F908Wf-dDfp5ZaV_pqk1I0dUncPiD4LO__gXp7ruIO74bb314LcfBqDc6PM4loNlZaigulvVmZyvlSt27m1tr5k4veyw85zPvdLMCOR90iWsOFAqR';

export default function Signup() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [googleLoading, setGoogleLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate, dispatch]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const updated = { ...formData, [e.target.id]: value };
        setFormData(updated);
        if (e.target.id === 'confirmPassword' && value !== formData.password) setPasswordError('Passwords do not match');
        else if (e.target.id === 'password' && formData.confirmPassword && value !== formData.confirmPassword) setPasswordError('Passwords do not match');
        else setPasswordError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) { setPasswordError('Passwords must match'); return; }
        dispatch(signup(formData));
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try { dispatch(loginWithGoogle({ access_token: tokenResponse.access_token })).unwrap(); }
            catch { setGoogleLoading(false); }
        },
        onError: () => setGoogleLoading(false),
    });

    const FieldIcon = ({ icon }) => (
        <span className="material-icons" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--color-dim)', pointerEvents: 'none' }}>{icon}</span>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* Left editorial panel */}
            <div className="hidden lg:flex" style={{ width: '45%', position: 'relative', overflow: 'hidden', background: 'var(--color-surface)', borderRight: '0.5px solid var(--color-border)' }}>
                <img src={EDITORIAL_IMG} alt="Fashion Editorial" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,19,15,0.95) 0%, rgba(22,19,15,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40 }}>
                    <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: 'var(--color-text)', margin: '0 0 8px', lineHeight: 1.2 }}>
                        Your wardrobe awaits.
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>Create your account to start your personal style journey.</p>
                </div>
            </div>

            {/* Right form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 36 }}>
                        <span style={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                            Style<span style={{ color: 'var(--color-accent)' }}>Sync</span>
                        </span>
                    </Link>

                    <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 30, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 6px' }}>
                        Create account
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: '0 0 28px' }}>Get your Style DNA in minutes.</p>

                    {/* Error */}
                    {error && (
                        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-err)' }}>error_outline</span>
                            <p style={{ fontSize: 13, color: 'var(--color-err)', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Name */}
                        <div>
                            <label className="label" htmlFor="name" style={{ display: 'block', marginBottom: 8 }}>Full name</label>
                            <div style={{ position: 'relative' }}>
                                <FieldIcon icon="person" />
                                <input className="input" id="name" type="text" placeholder="Your name" value={formData.name} onChange={handleChange} required style={{ paddingLeft: 42 }} />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label" htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email address</label>
                            <div style={{ position: 'relative' }}>
                                <FieldIcon icon="mail" />
                                <input className="input" id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required style={{ paddingLeft: 42 }} />
                            </div>
                        </div>

                        {/* Password row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="label" htmlFor="password" style={{ display: 'block', marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FieldIcon icon="lock" />
                                    <input className="input" id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ paddingLeft: 42, paddingRight: 40 }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dim)' }}>
                                        <span className="material-icons" style={{ fontSize: 17 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="confirmPassword" style={{ display: 'block', marginBottom: 8 }}>Confirm</label>
                                <div style={{ position: 'relative' }}>
                                    <FieldIcon icon="shield" />
                                    <input
                                        className="input" id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: 42, paddingRight: 40, borderColor: passwordError ? 'rgba(248,113,113,0.5)' : undefined }}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-dim)' }}>
                                        <span className="material-icons" style={{ fontSize: 17 }}>{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {passwordError && <p style={{ fontSize: 12, color: 'var(--color-err)', margin: '-8px 0 0' }}>{passwordError}</p>}

                        {/* Terms */}
                        <label htmlFor="terms" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                            <input id="terms" type="checkbox" checked={formData.terms} onChange={handleChange} required style={{ marginTop: 3, accentColor: 'var(--color-accent)', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6 }}>
                                I agree to the{' '}
                                <Link to="/terms" target="_blank" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" target="_blank" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Privacy Policy</Link>
                            </span>
                        </label>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                        <span style={{ fontSize: 11, color: 'var(--color-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
                        <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                    </div>

                    {/* Google */}
                    <motion.button
                        type="button"
                        onClick={() => handleGoogleSignup()}
                        disabled={googleLoading || loading}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)',
                            borderRadius: 4, padding: '13px 20px', cursor: 'pointer',
                            fontFamily: '"DM Sans"', fontSize: 13, fontWeight: 500, color: 'var(--color-muted)',
                            opacity: (googleLoading || loading) ? 0.6 : 1,
                        }}
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
                        {googleLoading ? 'Connecting…' : 'Continue with Google'}
                    </motion.button>

                    <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-muted)', textAlign: 'center' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
