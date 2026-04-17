import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const profileRef = useRef(null);

    // Pages with full-bleed hero images — navbar should be completely transparent until scrolled
    // Also includes /trends/:slug article detail pages
    const heroRoutes = ['/', '/trends', '/about', '/contact'];
    const isHeroPage = heroRoutes.includes(location.pathname) || location.pathname.startsWith('/trends/');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target))
                setShowProfileMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close mobile on route change
    useEffect(() => { setMobileOpen(false); setShowProfileMenu(false); }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // Always-visible public links
    const publicLinks = [
        { path: '/trends', label: 'Trends' },
        { path: '/about',  label: 'About' },
    ];

    // Only shown when authenticated
    const authLinks = [
        { path: '/onboarding',      label: 'Body Scan' },
        { path: '/recommendations', label: 'Stylist' },
        { path: '/saved-outfits',   label: 'Closet' },
    ];

    const navLinks = isAuthenticated ? [...authLinks, ...publicLinks] : publicLinks;

    const isActive = (path) => location.pathname === path;

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <>
            <nav
                style={{
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    zIndex: 50,
                    height: 'var(--navbar-height)',
                    background: scrolled
                        ? 'rgba(22,19,15,0.96)'
                        : isHeroPage
                            ? 'transparent'
                            : 'rgba(22,19,15,0.92)',
                    backdropFilter: scrolled ? 'blur(20px)' : isHeroPage ? 'none' : 'blur(12px)',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : isHeroPage ? 'none' : 'blur(12px)',
                    borderBottom: scrolled ? '0.5px solid var(--color-border)' : '0.5px solid transparent',
                    transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
                }}
            >
                <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 32px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontWeight: 700,
                            fontSize: 18,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text)',
                        }}>
                            Style<span style={{ color: 'var(--color-accent)' }}>Sync</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center" style={{ gap: 32 }}>
                        {isAuthenticated ? (
                            <>
                                {navLinks.map((link) => (
                                    <NavLink key={link.path} to={link.path} active={isActive(link.path)}>
                                        {link.label}
                                    </NavLink>
                                ))}

                                <div style={{ width: '0.5px', height: 16, background: 'var(--color-border)', margin: '0 4px' }} />

                                {/* Profile dropdown */}
                                <div ref={profileRef} style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    >
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: 'var(--color-accent-dim)',
                                            border: '0.5px solid var(--color-accent-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                        }}>
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: 11, color: 'var(--color-accent)' }}>
                                                    {initials}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontFamily: '"DM Sans"', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                                            {user?.name?.split(' ')[0] || 'Account'}
                                        </span>
                                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-dim)' }}>
                                            {showProfileMenu ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {showProfileMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 'calc(100% + 12px)',
                                                    width: 220,
                                                    background: 'var(--color-surface)',
                                                    border: '0.5px solid var(--color-border-light)',
                                                    borderRadius: 8,
                                                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--color-border)' }}>
                                                    <p style={{ fontFamily: '"DM Sans"', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{user?.name}</p>
                                                    <p style={{ fontFamily: '"DM Sans"', fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0' }}>{user?.email}</p>
                                                </div>
                                                <div style={{ padding: '6px 0' }}>
                                                    {[
                                                        { to: '/profile', icon: 'person', label: 'Profile' },
                                                        { to: '/saved-outfits', icon: 'checkroom', label: 'My Closet' },
                                                        { to: '/body-scan', icon: 'sensors', label: 'Body Scan' },
                                                    ].map(item => (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontFamily: '"DM Sans"', fontSize: 13, color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.15s, background 0.15s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-card)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: 16 }}>{item.icon}</span>
                                                            {item.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div style={{ borderTop: '0.5px solid var(--color-border)', padding: '6px 0' }}>
                                                    <button
                                                        onClick={handleLogout}
                                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontFamily: '"DM Sans"', fontSize: 13, color: 'var(--color-err)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.06)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <span className="material-icons" style={{ fontSize: 16 }}>logout</span>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                {/* Public nav links always visible */}
                                {publicLinks.map((link) => (
                                    <NavLink key={link.path} to={link.path} active={isActive(link.path)}>
                                        {link.label}
                                    </NavLink>
                                ))}
                                <div style={{ width: '0.5px', height: 16, background: 'var(--color-border)', margin: '0 4px' }} />
                                <Link to="/login" style={{ fontFamily: '"DM Sans"', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
                                >
                                    Login
                                </Link>
                                <Link to="/signup" className="btn btn-primary">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4 }}
                    >
                        <span className="material-icons" style={{ fontSize: 22 }}>
                            {mobileOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: 'var(--navbar-height)',
                            left: 0, right: 0,
                            zIndex: 49,
                            background: 'var(--color-surface)',
                            borderBottom: '0.5px solid var(--color-border)',
                            padding: '16px 24px 24px',
                        }}
                    >
                        {isAuthenticated ? (
                            <>
                                {navLinks.map(link => (
                                    <Link key={link.path} to={link.path} style={{
                                        display: 'block', padding: '12px 0',
                                        fontFamily: '"DM Sans"', fontSize: 14, fontWeight: 600,
                                        color: isActive(link.path) ? 'var(--color-accent)' : 'var(--color-muted)',
                                        textDecoration: 'none',
                                        borderBottom: '0.5px solid var(--color-border)',
                                    }}>
                                        {link.label}
                                    </Link>
                                ))}
                                <button onClick={handleLogout} style={{ marginTop: 16, width: '100%', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans"', fontSize: 14, fontWeight: 600, color: 'var(--color-err)', textAlign: 'left' }}>
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingTop: 4 }}>
                                {publicLinks.map(link => (
                                    <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} style={{
                                        display: 'block', padding: '12px 0',
                                        fontFamily: '"DM Sans"', fontSize: 14, fontWeight: 600,
                                        color: isActive(link.path) ? 'var(--color-accent)' : 'var(--color-muted)',
                                        textDecoration: 'none',
                                        borderBottom: '0.5px solid var(--color-border)',
                                    }}>
                                        {link.label}
                                    </Link>
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                                    <Link to="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Login</Link>
                                    <Link to="/signup" className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/** Animated nav link with underline active state */
function NavLink({ to, active, children }) {
    return (
        <Link
            to={to}
            style={{
                position: 'relative',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: active ? 'var(--color-text)' : 'var(--color-muted)',
                textDecoration: 'none',
                paddingBottom: 4,
                transition: 'color 0.2s',
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => !active && (e.currentTarget.style.color = 'var(--color-muted)')}
        >
            {children}
            {active && (
                <motion.div
                    layoutId="navUnderline"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1.5px',
                        background: 'var(--color-accent)',
                        borderRadius: 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}
        </Link>
    );
}
