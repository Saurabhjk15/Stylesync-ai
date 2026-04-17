import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SECTIONS = [
    { title: 'Information We Collect', body: 'We collect information you provide directly (name, email, password) when creating an account. During body scan sessions, pose landmark data is processed entirely in your browser — raw video is never transmitted to our servers. We also collect usage data such as pages visited and features used to improve the Service.' },
    { title: 'How We Use Your Information', body: 'We use your information to: (1) provide and personalize the StyleSync experience; (2) generate your Style DNA report using your body scan measurements; (3) send you relevant outfit recommendations; (4) communicate service updates or support responses; and (5) improve our AI models and product quality.' },
    { title: 'AI & Body Scan Data', body: 'Body scan measurements (shoulder width, waist-hip ratio, etc.) derived during your scan session are stored securely to power your Style DNA report. These measurements are never sold to third parties. You may delete your scan data at any time from your profile settings.' },
    { title: 'Virtual Try-On Images', body: 'When you use the AI Try-On feature, the person image you provide and the resulting try-on image are processed by our AI pipeline (IDM-VTON / OOTDiffusion) and temporarily stored in Supabase Storage. Results are associated with your account and are deleted when you remove them or close your account.' },
    { title: 'Cookies & Tracking', body: 'We use essential cookies to maintain your login session and remember your preferences. We do not use third-party advertising trackers or sell your data to advertisers. You may disable cookies in your browser settings, though some features may not function correctly.' },
    { title: 'Data Sharing', body: 'We do not sell your personal data. We may share data with trusted service providers (e.g., Supabase for storage, Google for OAuth) strictly to operate the Service. These providers are contractually bound to protect your information.' },
    { title: 'Data Retention & Deletion', body: 'We retain your account data as long as your account is active. You may request deletion of your account and associated data at any time by visiting Profile → Settings → Delete Account, or by emailing privacy@stylesync.ai. We will process deletion requests within 30 days.' },
    { title: 'Security', body: 'We implement industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), and secure token-based authentication (JWT). However, no system is 100% secure — we encourage you to use a strong password and enable two-factor authentication when available.' },
    { title: 'Children\'s Privacy', body: 'StyleSync is not directed to children under 13. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it immediately.' },
    { title: 'Changes to this Policy', body: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notice. Your continued use of StyleSync after changes take effect constitutes acceptance of the updated policy.' },
    { title: 'Contact Us', body: 'For privacy inquiries, requests, or to exercise your data rights, contact us at privacy@stylesync.ai.' },
];

export default function Privacy() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>
            <main style={{ maxWidth: 760, margin: '0 auto', padding: 'calc(var(--navbar-height) + 60px) 32px 100px' }}>

                <Link to="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none', marginBottom: 48 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-muted)'}
                >
                    <span className="material-icons" style={{ fontSize: 14 }}>arrow_back</span>
                    Back
                </Link>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <span className="label-accent" style={{ display: 'block', marginBottom: 12 }}>Legal</span>
                    <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 400, fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.1 }}>
                        Privacy Policy
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 60px' }}>Last updated: April 2026</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                        {SECTIONS.map((s, i) => (
                            <motion.div
                                key={s.title}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                            >
                                <h2 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 10px' }}>
                                    {i + 1}. {s.title}
                                </h2>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
