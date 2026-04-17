import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TECH = [
    { icon: 'accessibility_new', title: 'Body Analysis', desc: 'MediaPipe Pose maps 33 skeletal landmarks with millimeter precision — shoulder width, waist-to-hip ratio, and fall-line analysis.', to: '/body-scan' },
    { icon: 'psychology', title: 'AI Personalization', desc: 'Gemini AI cross-references your body type, skin tone, and occasion to generate a bespoke Style DNA report.', to: '/recommendations' },
    { icon: 'visibility', title: 'AR Try-On', desc: 'IDM-VTON diffusion model renders photorealistic garments on your exact silhouette in seconds.', to: '/ar-tryon' },
];

const VALUES = [
    { icon: 'verified',     title: 'Precision',    desc: 'Unrivaled accuracy in every measurement.' },
    { icon: 'fingerprint',  title: 'Privacy',      desc: 'Your data is yours, encrypted and secure.' },
    { icon: 'groups',       title: 'Inclusivity',  desc: 'Designed for every body, every identity.' },
    { icon: 'auto_awesome', title: 'Innovation',   desc: 'Leading the future of digital fashion.' },
];

export default function About() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* ── HERO ── */}
            <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop"
                    alt="Fashion Editorial"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.5 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(22,19,15,0.3) 0%, rgba(22,19,15,0.85) 100%)' }} />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'relative', textAlign: 'center', maxWidth: 820, padding: '0 40px' }}
                >
                    <span className="label-accent" style={{ display: 'block', marginBottom: 20 }}>The Digital Renaissance</span>
                    <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(56px, 9vw, 100px)', fontWeight: 300, lineHeight: 0.95, margin: '0 0 24px', color: 'var(--color-text)' }}>
                        Where Fashion Meets<br />
                        <em style={{ color: 'var(--color-accent)' }}>Intelligence</em>
                    </h1>
                    <p style={{ fontSize: 18, color: 'var(--color-muted)', lineHeight: 1.75, margin: '0 0 40px' }}>
                        Redefining personal style through millimeter-accurate AI analysis and the artistry of high-fashion curation.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                            <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 12 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>sensors</span>
                                Start Style Scan
                            </Link>
                        </motion.div>
                        <Link to="/recommendations" className="btn btn-ghost" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            Explore the Tech
                            <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── MISSION ── */}
            <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,5vw,64px)' }}>
                <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{ borderRadius: 6, overflow: 'hidden', border: '0.5px solid var(--color-border)' }}>
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwQVwvznHT_ngb_rOPVdfZzqdHalx5PXMVfL8wdBj1m5J-VHmsg2aJdPIkkxZkxqnGvt51lLEc4QmEh-mWiG_RewtG9jJvMJ0ZfgPbI9IdorsD91LCUZ7qJuCebLHZ2x-luLXLkzIcu96-f2yVsVu1OgQfH4zZoeXjh59caue2HKosPVYTgyjpj-BTE9EwK8UBbR9nlBeXXyTdAufRywxup10kpeKqMKoXo_-I-w-W0-VDJo4a4zRiWVcntaSXM24J8G3FuT3jmUkT"
                                alt="Digital fabric patterns"
                                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', filter: 'grayscale(20%) brightness(75%)', transition: 'filter 0.7s' }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%) brightness(90%)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(20%) brightness(75%)'}
                            />
                        </div>
                        <div style={{ position: 'absolute', bottom: -12, left: -12, width: 48, height: 48, borderLeft: '1.5px solid var(--color-accent)', borderBottom: '1.5px solid var(--color-accent)', opacity: 0.4 }} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                        <div style={{ width: 32, height: '1.5px', background: 'var(--color-accent)' }} />
                        <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
                            Bridging the gap between<br />
                            <em style={{ color: 'var(--color-accent)' }}>humanity and precision</em>
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.8, margin: 0 }}>
                            At StyleSync, we believe that style is a language, and AI is the ultimate translator. Our mission is to democratize the luxury atelier experience, making bespoke precision available to every individual.
                        </p>
                        <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.8, margin: 0 }}>
                            We don't just measure bodies; we understand movement, preference, and the subtle nuances that make your aesthetic unique.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 16, borderTop: '0.5px solid var(--color-border)' }}>
                            {[{ value: '99.8%', label: 'Accuracy Rate' }, { value: '2.4M', label: 'Style Profiles' }].map(stat => (
                                <div key={stat.label}>
                                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1 }}>{stat.value}</div>
                                    <div className="label" style={{ marginTop: 8 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── TECHNOLOGY ── */}
            <section style={{ background: 'var(--color-surface)', padding: 'clamp(48px,6vw,80px) clamp(16px,5vw,64px)' }}>
                <div>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <span className="label-accent" style={{ display: 'block', marginBottom: 12 }}>Our Technology</span>
                        <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 400, margin: 0 }}>Powered by precision</h2>
                    </div>
                    <div className="about-tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        {TECH.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -3 }}
                                style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderTop: '2px solid var(--color-border-light)', borderRadius: 6, padding: 32, display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-top-color 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderTopColor = 'var(--color-accent)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderTopColor = 'var(--color-border-light)'; }}
                            >
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent-dim)', border: '0.5px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 22, color: 'var(--color-accent)' }}>{item.icon}</span>
                                </div>
                                <h4 style={{ fontFamily: '"DM Sans"', fontSize: 17, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{item.title}</h4>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, margin: 0, flex: 1 }}>{item.desc}</p>
                                <Link to={item.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', textDecoration: 'none' }}>
                                    Learn more <span className="material-icons" style={{ fontSize: 13 }}>arrow_forward</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MANIFESTO ── */}
            <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,5vw,64px)' }}>
                <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--color-text)', margin: '0 0 32px' }}
                    >
                        "Style is a silent reflection of the soul. StyleSync is the mirror that captures its{' '}
                        <em style={{ color: 'var(--color-accent)', fontStyle: 'normal' }}>perfect clarity</em>."
                    </motion.blockquote>
                    <div style={{ width: 40, height: '0.5px', background: 'var(--color-accent)', margin: '0 auto 20px' }} />
                    <p className="label" style={{ marginBottom: 40 }}>The StyleSync Manifesto</p>
                    <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.8, marginBottom: 20 }}>
                        Founded in the heart of the digital fashion revolution, StyleSync emerged from a simple question: why does shopping for the world's most beautiful garments still feel like a guessing game?
                    </p>
                    <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.8 }}>
                        Our team of data scientists, fashion historians, and master tailors collaborated to build an engine that doesn't just recognize patterns — it understands beauty.
                    </p>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section style={{ padding: 'clamp(48px,6vw,80px) clamp(16px,5vw,64px)', borderTop: '0.5px solid var(--color-border)' }}>
                <div>
                    <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {VALUES.map((v, i) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6 }}
                            >
                                <span className="material-icons" style={{ fontSize: 28, color: 'var(--color-accent)', display: 'block', marginBottom: 12 }}>{v.icon}</span>
                                <h5 style={{ fontFamily: '"DM Sans"', fontSize: 15, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 8px' }}>{v.title}</h5>
                                <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────── */}
            <section style={{ padding: '80px 32px', textAlign: 'center', borderTop: '0.5px solid var(--color-border)' }}>
                <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Begin</span>
                <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic', margin: '0 0 20px' }}>
                    Ready to find your{' '}<span style={{ fontStyle: 'normal', color: 'var(--color-accent)' }}>perfect self?</span>
                </h2>
                <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 32 }}>No charge for your first scan. No obligation.</p>
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                    <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 12 }}>
                        <span className="material-icons" style={{ fontSize: 16 }}>sensors</span>
                        Start Body Scan
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
