import { Link } from 'react-router-dom';
import { useState } from 'react';

const YEAR = new Date().getFullYear();

const footerLinks = {
    Platform: [
        { label: 'Body Scan',      to: '/body-scan' },
        { label: 'AI Stylist',     to: '/recommendations' },
        { label: 'Virtual Try-On', to: '/ar-tryon' },
        { label: 'My Closet',      to: '/saved-outfits' },
    ],
    Company: [
        { label: 'About',     to: '/about' },
        { label: 'Trends',    to: '/trends' },
        { label: 'Contact',   to: '/contact' },
        { label: 'Security',  to: '/security' },
    ],
    Legal: [
        { label: 'Privacy Policy',   to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Data Protection',  to: '/security' },
    ],
};

export default function Footer() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) { setSubscribed(true); setEmail(''); }
    };

    return (
        <footer style={{ background: 'var(--color-surface)', borderTop: '0.5px solid var(--color-border)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* ── Main grid ── */}
            <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '64px 32px 40px' }}>
                <div className="footer-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40 }}>

                    {/* Brand column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            <span style={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: 16, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text)' }}>
                                Style<span style={{ color: 'var(--color-accent)' }}>Sync</span>
                            </span>
                        </Link>

                        <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.75, maxWidth: 260, margin: 0 }}>
                            Precision body scanning meets generative AI — the most intelligent wardrobe advisor available.
                        </p>

                        {/* Newsletter */}
                        <div>
                            <p className="label" style={{ marginBottom: 10, color: 'var(--color-muted)' }}>
                                Stay informed
                            </p>
                            {subscribed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ok)', fontSize: 13 }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>check_circle</span>
                                    You're on the list.
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} style={{ display: 'flex' }}>
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="footer-input"
                                        required
                                    />
                                    <button type="submit" className="footer-btn">Subscribe</button>
                                </form>
                            )}
                        </div>

                        {/* Social */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[
                                { href: 'https://instagram.com/saurabh_jk15',     label: 'Instagram', path: 'M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M18,5A1.5,1.5 0 0,1 19.5,6.5A1.5,1.5 0 0,1 18,8A1.5,1.5 0 0,1 16.5,6.5A1.5,1.5 0 0,1 18,5Z' },
                                { href: 'https://x.com/Bose13Jk',                  label: 'X',         path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                                { href: 'https://github.com/Saurabhjk15',          label: 'GitHub',    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' },
                            ].map(social => (
                                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}
                                    style={{
                                        width: 34, height: 34, borderRadius: '50%',
                                        border: '0.5px solid var(--color-border-light)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--color-muted)',
                                        transition: 'color 0.2s, border-color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent-border)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="label" style={{ marginBottom: 18 }}>{heading}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map(({ label, to }) => (
                                    <li key={label}>
                                        <Link
                                            to={to}
                                            style={{ fontSize: 13, color: 'var(--color-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div style={{ borderTop: '0.5px solid var(--color-border)' }}>
                <div className="footer-bottom" style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p className="label" style={{ marginBottom: 0 }}>
                        © {YEAR} StyleSync · Your data is private and encrypted
                    </p>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {[{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }, { label: 'Contact', to: '/contact' }].map(({ label, to }) => (
                            <Link key={label} to={to}
                                style={{ fontSize: 11, color: 'var(--color-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-muted)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-dim)'}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
