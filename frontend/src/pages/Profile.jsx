import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [savedOutfits, setSavedOutfits] = useState([]);
    const [bodyScan, setBodyScan] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/profile' } } });
            return;
        }
        try {
            const saved = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
            setSavedOutfits(saved);
        } catch { setSavedOutfits([]); }
        try {
            const scan = JSON.parse(localStorage.getItem('lastBodyScan') || 'null');
            setBodyScan(scan);
        } catch { setBodyScan(null); }
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Signed out successfully');
        navigate('/');
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently';

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'SS';

    const tabs = [
        { id: 'overview', label: 'Overview',    icon: 'person' },
        { id: 'wardrobe', label: 'Wardrobe',    icon: 'checkroom' },
        { id: 'scans',    label: 'Body Scans',  icon: 'sensors' },
        { id: 'security', label: 'Security',    icon: 'shield' },
    ];

    const STATS = [
        { label: 'Saved Outfits', value: savedOutfits.length,                                    icon: 'favorite',      color: 'var(--color-accent)' },
        { label: 'Body Scans',   value: bodyScan ? 1 : 0,                                        icon: 'sensors',       color: 'var(--color-ok)' },
        { label: 'Try-Ons',      value: parseInt(localStorage.getItem('tryOnCount') || '0'),    icon: 'auto_awesome',  color: '#a78bfa' },
        { label: 'Auth Method',  value: user?.provider === 'google' ? 'Google' : 'Email',       icon: 'verified_user', color: '#38bdf8' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif', paddingTop: 'calc(var(--navbar-height) + 40px)', paddingBottom: 64 }}>
            <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px' }}>

                {/* ── Profile Header ───────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 8, padding: 28, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}
                >
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name}
                                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--color-accent-border)' }} />
                        ) : (
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--color-accent-dim)', border: '1.5px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 400, color: 'var(--color-accent)' }}>{initials}</span>
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: 'var(--color-ok)', border: '2px solid var(--color-bg)' }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 400, color: 'var(--color-text)', margin: 0 }}>
                                {user?.name || 'StyleSync Member'}
                            </h1>
                            <span className="tag tag-accent">
                                {user?.role === 'admin' ? '✦ Admin' : '✦ Member'}
                            </span>
                            {user?.provider === 'google' && (
                                <span className="tag" style={{ background: 'rgba(66,133,244,0.08)', borderColor: 'rgba(66,133,244,0.25)', color: '#4285f4' }}>Google</span>
                            )}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 4px' }}>{user?.email}</p>
                        <p className="label" style={{ marginBottom: 0 }}>Member since {memberSince}</p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                        <motion.button
                            onClick={() => navigate('/body-scan')}
                            className="btn btn-primary"
                            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                            style={{ fontSize: 10 }}
                        >
                            <span className="material-icons" style={{ fontSize: 14 }}>sensors</span>
                            New Scan
                        </motion.button>
                        <motion.button
                            onClick={handleLogout}
                            className="btn btn-ghost"
                            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                            style={{ fontSize: 10 }}
                        >
                            <span className="material-icons" style={{ fontSize: 14 }}>logout</span>
                            Sign Out
                        </motion.button>
                    </div>
                </motion.div>

                {/* ── Stats Row ──────────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i, duration: 0.35 }}
                            style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '18px 20px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <span className="material-icons" style={{ fontSize: 15, color: stat.color }}>{stat.icon}</span>
                                <span className="label">{stat.label}</span>
                            </div>
                            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 400, color: stat.color, lineHeight: 1 }}>
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Tabs ───────────────────────────────────────────── */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 20, overflowX: 'auto', borderBottom: '0.5px solid var(--color-border)', paddingBottom: 0 }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-dim)',
                                borderBottom: activeTab === tab.id ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
                                transition: 'color 0.2s, border-color 0.2s',
                                display: 'flex', alignItems: 'center', gap: 8,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 14 }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ─────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Account details */}
                            <div className="card-surface" style={{ padding: '24px 28px' }}>
                                <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Account Details</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {[
                                        { label: 'Full Name',     value: user?.name },
                                        { label: 'Email',         value: user?.email },
                                        { label: 'Account Type',  value: user?.role === 'admin' ? 'Administrator' : 'Standard User' },
                                        { label: 'Sign-in Method',value: user?.provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password' },
                                        { label: 'Member Since',  value: memberSince },
                                        { label: 'Status',        value: 'Active' },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '12px 16px' }}>
                                            <div className="label" style={{ marginBottom: 6 }}>{item.label}</div>
                                            <div style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 500 }}>{item.value || '—'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="card-surface" style={{ padding: '24px 28px' }}>
                                <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Quick Actions</span>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    {[
                                        { label: 'Body Scan',       icon: 'sensors',       path: '/body-scan' },
                                        { label: 'Recommendations', icon: 'auto_awesome',  path: '/recommendations' },
                                        { label: 'Saved Looks',     icon: 'favorite',      path: '/saved-outfits' },
                                        { label: 'Trends',          icon: 'trending_up',   path: '/trends' },
                                    ].map(action => (
                                        <motion.button
                                            key={action.label}
                                            onClick={() => navigate(action.path)}
                                            whileHover={{ y: -2 }}
                                            style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                                        >
                                            <span className="material-icons" style={{ fontSize: 22, color: 'var(--color-muted)' }}>{action.icon}</span>
                                            <span className="label" style={{ textAlign: 'center' }}>{action.label}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WARDROBE */}
                    {activeTab === 'wardrobe' && (
                        <div className="card-surface" style={{ padding: '24px 28px' }}>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 20 }}>
                                Saved Outfits ({savedOutfits.length})
                            </span>
                            {savedOutfits.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-dim)', display: 'block', marginBottom: 12 }}>checkroom</span>
                                    <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>Your wardrobe is empty</p>
                                    <button onClick={() => navigate('/body-scan')} className="btn btn-primary" style={{ fontSize: 11 }}>
                                        <span className="material-icons" style={{ fontSize: 14 }}>sensors</span>
                                        Start Body Scan
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                                    {savedOutfits.map((outfit, i) => (
                                        <motion.div key={i} whileHover={{ y: -2 }} style={{ border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}>
                                            <div style={{ aspectRatio: '1/1', background: 'var(--color-card)', overflow: 'hidden' }}>
                                                {outfit.imageUrl ? (
                                                    <img src={outfit.imageUrl} alt={outfit.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="material-icons" style={{ fontSize: 28, color: 'var(--color-dim)' }}>checkroom</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: '10px 12px' }}>
                                                <p style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', margin: '0 0 4px' }}>{outfit.name || 'Unnamed Piece'}</p>
                                                <p className="label" style={{ color: 'var(--color-accent)' }}>{outfit.category || 'Fashion'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BODY SCANS */}
                    {activeTab === 'scans' && (
                        <div className="card-surface" style={{ padding: '24px 28px' }}>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 20 }}>Body Scan History</span>
                            {!bodyScan ? (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-dim)', display: 'block', marginBottom: 12 }}>sensors</span>
                                    <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 8 }}>No scans yet</p>
                                    <p style={{ fontSize: 12, color: 'var(--color-dim)', marginBottom: 20 }}>Run a body scan to get personalized style recommendations</p>
                                    <button onClick={() => navigate('/body-scan')} className="btn btn-primary" style={{ fontSize: 11 }}>
                                        <span className="material-icons" style={{ fontSize: 14 }}>sensors</span>
                                        Start Scan
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {[
                                        { label: 'Body Type',      value: bodyScan.bodyType,                                           icon: 'accessibility' },
                                        { label: 'Confidence',     value: `${Math.round((bodyScan.confidence || 0) * 100)}%`,          icon: 'analytics' },
                                        { label: 'Skin Tone',      value: bodyScan.skinTone || '—',                                    icon: 'colorize' },
                                        { label: 'Occasion',       value: bodyScan.occasion || '—',                                    icon: 'event' },
                                        { label: 'Shoulder Ratio', value: bodyScan.measurements?.shoulderToHipRatio || '—',            icon: 'straighten' },
                                        { label: 'AI Method',      value: bodyScan.isMlResult ? 'Neural Network' : 'Rule-based',       icon: 'psychology' },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-accent)' }}>{item.icon}</span>
                                                <span className="label">{item.label}</span>
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECURITY */}
                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card-surface" style={{ padding: '24px 28px' }}>
                                <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Security Overview</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[
                                        { label: 'Authentication', status: 'Secured', detail: user?.provider === 'google' ? 'Google OAuth 2.0 — server-verified' : 'JWT — bcryptjs hashed', ok: true },
                                        { label: 'Session',        status: 'Active',  detail: '30-day token, stored in Redux + localStorage', ok: true },
                                        { label: 'Brute-force protection', status: user?.loginAttempts > 0 ? `${user.loginAttempts} failed` : 'Clean', detail: 'Account locks after 5 consecutive failures', ok: (user?.loginAttempts || 0) === 0 },
                                        { label: 'Account Lock',   status: (user?.lockUntil && user.lockUntil > Date.now()) ? 'Locked' : 'Unlocked', detail: 'Automatically clears after 5 minutes', ok: !(user?.lockUntil && user.lockUntil > Date.now()) },
                                    ].map(item => (
                                        <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
                                            <span className="material-icons" style={{ fontSize: 18, color: item.ok ? 'var(--color-ok)' : 'var(--color-err)', flexShrink: 0, marginTop: 1 }}>
                                                {item.ok ? 'check_circle' : 'warning'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</span>
                                                    <span className="label" style={{ color: item.ok ? 'var(--color-ok)' : 'var(--color-err)' }}>{item.status}</span>
                                                </div>
                                                <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>{item.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger zone */}
                            <div className="card-surface" style={{ padding: '24px 28px', borderLeft: '2px solid var(--color-err)' }}>
                                <span className="label" style={{ color: 'var(--color-err)', display: 'block', marginBottom: 16 }}>Danger Zone</span>
                                <button
                                    onClick={handleLogout}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-err)', background: 'none', border: '0.5px solid rgba(248,113,113,0.25)', borderRadius: 4, padding: '10px 16px', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                    <span className="material-icons" style={{ fontSize: 14 }}>logout</span>
                                    Sign Out of All Devices
                                </button>
                            </div>
                        </div>
                    )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
