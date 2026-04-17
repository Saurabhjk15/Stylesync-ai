import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

/* ── Framer Motion helpers ── */
const fadeUp = {
    hidden:  { opacity: 0, y: 24 },
    show:    { opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 280, damping: 28 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.10 } } };

/* ── Editorial imagery ── */
const GALLERY = [
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSmWxI1bFdio7vzvPb7u-ImJx14GHsWSps9_T4_92p84H7dKgCaVP8M8_5hPuakVNYGbkZAQCOhqVeY0c1keZXRrNzeNW616Tq9rUWdSATWZgfHprnx6lZwy4iBi20TK1_yIFJEjkGzaph__eAPu_XibXf_Q7F908Wf-dDfp5ZaV_pqk1I0dUncPiD4LO__gXp7ruIO74bb314LcfBqDc6PM4loNlZaigulvVmZyvlSt27m1tr5k4veyw85zPvdLMCOR90iWsOFAqR',
        alt: 'Luxury Streetwear',
    },
    {
        src: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop',
        alt: 'Modern Minimal Fashion',
    },
    {
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1HYk25Uaczk5y75qCqAXfforEGDdf-9wsHnx1uzHYvkzslUAJ-lqWGCk2RT7F9XM8vyunMWx5lLvYXx-rNhb0BAzuk6L9lCkCQOjJa_eUGVmo8yiAKKdvY0JlOacr7NgUKHJwY_Q0Ff3sVGjCYIpDoYgRyKSVgaC9maXhjECftmPuWtTJgAaLXurHCYfWchKEFoKe7pdbocTitaDFA1e8qqbiu712bphs4ilQAIhr6UIgPzpTwEvjP6TGViIsLzfBY5enQ26uoCz9',
        alt: 'Digital Fashion',
    },
    {
        src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        alt: 'Luxury Minimal Blouse',
    },
];

const FEATURES = [
    {
        icon: 'sensors',
        title: 'Precision Body Scan',
        body: 'MediaPipe Pose maps 33 skeletal landmarks to derive your exact proportions — shoulder width, waist-to-hip ratio, and more — in under 60 seconds.',
        cta: { label: 'Try it now', to: '/body-scan' },
    },
    {
        icon: 'psychology',
        title: 'Style DNA Report',
        body: 'Gemini AI cross-references your body type, skin tone, and occasion to generate a bespoke styling guide: what works, what to avoid, best colors and fabrics.',
        cta: { label: 'See example', to: '/recommendations' },
    },
    {
        icon: 'auto_awesome',
        title: 'Virtual Try-On',
        body: 'IDM-VTON diffusion model renders a photorealistic result of any garment on your silhouette — upload a clothing photo and see yourself wearing it.',
        cta: { label: 'Explore', to: '/recommendations' },
    },
];

const STATS = [
    { value: '33', label: 'Pose landmarks tracked' },
    { value: '5',  label: 'Body archetypes classified' },
    { value: '99%', label: 'Fit accuracy rating' },
    { value: '24/7', label: 'AI concierge access' },
];

export default function Home() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh', fontFamily: '"DM Sans", sans-serif' }}>

            {/* ── HERO ─────────────────────────────────────── */}
            <section style={{ minHeight: '100vh', paddingTop: 'calc(var(--navbar-height) + 48px)', paddingBottom: 80 }}>
                <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 32px' }}>
                    <div className="home-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>

                        {/* Left — Copy */}
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                        >
                            {/* Eyebrow label */}
                            <motion.div variants={fadeUp}>
                                <span className="label-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', animation: 'pulseRing 2s ease-in-out infinite' }} />
                                    AI-Powered Personal Stylist
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1 variants={fadeUp} style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(42px, 5.5vw, 76px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.05, color: 'var(--color-text)', margin: 0 }}>
                                Your wardrobe,<br />
                                <span style={{ fontStyle: 'normal', fontWeight: 400 }}>finally </span>
                                <em style={{ color: 'var(--color-accent)' }}>curated.</em>
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p variants={fadeUp} style={{ fontSize: 17, fontWeight: 400, color: 'var(--color-muted)', maxWidth: 440, lineHeight: 1.75, margin: 0 }}>
                                Precision body scanning meets generative AI. Get a complete Style DNA report and see yourself in any garment — before you buy.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div variants={fadeUp} className="home-hero-ctas" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                                    <Link to={isAuthenticated ? '/body-scan' : '/signup'} className="btn btn-primary" style={{ fontSize: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 16 }}>sensors</span>
                                        Start Body Scan
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/recommendations" className="btn btn-ghost" style={{ fontSize: 12 }}>
                                        Explore Looks
                                    </Link>
                                </motion.div>
                            </motion.div>

                            {/* Stats */}
                            <motion.div variants={fadeUp} className="home-hero-stats" style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: '0.5px solid var(--color-border)' }}>
                                {STATS.map(s => (
                                    <div key={s.label}>
                                        <div style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 26, fontWeight: 400, color: 'var(--color-text)', lineHeight: 1 }}>
                                            {s.value}
                                        </div>
                                        <div className="label" style={{ marginTop: 6 }}>{s.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right — Editorial image collage */}
                        <motion.div
                            className="home-hero-gallery"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
                        >
                            {/* Tall left */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 40 }}
                            >
                                {[GALLERY[0], GALLERY[1]].map((img, i) => (
                                    <div key={i} style={{
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        border: '0.5px solid var(--color-border)',
                                        height: i === 0 ? 200 : 280,
                                    }}>
                                        <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', display: 'block' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                            {/* Offset right */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.6 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                            >
                                {[GALLERY[2], GALLERY[3]].map((img, i) => (
                                    <div key={i} style={{
                                        borderRadius: 6,
                                        overflow: 'hidden',
                                        border: '0.5px solid var(--color-border)',
                                        height: i === 0 ? 280 : 220,
                                    }}>
                                        <img src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', display: 'block' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── DIVIDER ─────────────────────────────────── */}
            <div style={{ height: '0.5px', background: 'var(--color-border)', maxWidth: 'var(--max-w)', margin: '0 auto 0' }} />

            {/* ── HOW IT WORKS ─────────────────────────────── */}
            <section style={{ background: 'var(--color-surface)', padding: '80px 32px' }}>
                <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.5 }}
                        style={{ marginBottom: 56 }}
                    >
                        <span className="label-accent">The Process</span>
                        <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, margin: '12px 0 0', color: 'var(--color-text)' }}>
                            Intelligence meets intuition
                        </h2>
                    </motion.div>

                    <div className="home-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ delay: i * 0.1, duration: 0.45 }}
                                whileHover={{ y: -3 }}
                                style={{
                                    background: 'var(--color-card)',
                                    border: '0.5px solid var(--color-border)',
                                    borderRadius: 6,
                                    padding: 28,
                                    cursor: 'default',
                                    transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <div style={{ marginBottom: 20 }}>
                                    <span className="material-icons" style={{ fontSize: 24, color: 'var(--color-accent)' }}>{f.icon}</span>
                                </div>
                                <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 18, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px' }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, margin: '0 0 20px' }}>
                                    {f.body}
                                </p>
                                <Link to={f.cta.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"DM Sans"', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', textDecoration: 'none' }}>
                                    {f.cta.label}
                                    <span className="material-icons" style={{ fontSize: 14 }}>arrow_forward</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AR SPATIAL SECTION ───────────────────────── */}
            <style>{`
                @keyframes scanLine {
                    0%   { top: 0%; opacity: 0.9; }
                    48%  { opacity: 0.9; }
                    50%  { top: 100%; opacity: 0; }
                    51%  { top: 0%; opacity: 0; }
                    53%  { opacity: 0.9; }
                    100% { top: 100%; opacity: 0.9; }
                }
                @keyframes hotspotPing {
                    0%   { transform: scale(1);   opacity: 0.9; }
                    70%  { transform: scale(2.4); opacity: 0; }
                    100% { transform: scale(2.4); opacity: 0; }
                }
                @keyframes floatCard {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-6px); }
                }
            `}</style>

            <section style={{ padding: '100px 32px', background: 'var(--color-bg)', overflow: 'hidden' }}>
                <div className="home-ar-grid" style={{ maxWidth: 'var(--max-w)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

                    {/* ── LEFT: AR Spatial Canvas ── */}
                    <motion.div
                        className="home-ar-canvas"
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                        style={{ position: 'relative', height: 560 }}
                    >
                        {/* Main model image */}
                        <div style={{ position: 'absolute', left: 0, top: 0, width: '72%', height: '92%', borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(200,169,126,0.25)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop"
                                alt="Body scan in progress"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.80)' }}
                            />
                            {/* Scan overlay gradient */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(200,169,126,0.06) 0%, transparent 60%)' }} />

                            {/* Animated scan line */}
                            <div style={{
                                position: 'absolute', left: 0, right: 0, height: 1,
                                background: 'linear-gradient(90deg, transparent, rgba(200,169,126,0.9), transparent)',
                                animation: 'scanLine 3s linear infinite',
                                boxShadow: '0 0 12px rgba(200,169,126,0.6)',
                            }} />

                            {/* AR corner brackets */}
                            {[
                                { top: 12, left: 12, borderTop: '2px solid rgba(200,169,126,0.8)', borderLeft: '2px solid rgba(200,169,126,0.8)' },
                                { top: 12, right: 12, borderTop: '2px solid rgba(200,169,126,0.8)', borderRight: '2px solid rgba(200,169,126,0.8)' },
                                { bottom: 12, left: 12, borderBottom: '2px solid rgba(200,169,126,0.8)', borderLeft: '2px solid rgba(200,169,126,0.8)' },
                                { bottom: 12, right: 12, borderBottom: '2px solid rgba(200,169,126,0.8)', borderRight: '2px solid rgba(200,169,126,0.8)' },
                            ].map((s, i) => (
                                <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...s }} />
                            ))}

                            {/* Hotspot — shoulder */}
                            <div style={{ position: 'absolute', top: '18%', left: '42%' }}>
                                <div style={{ position: 'relative', width: 10, height: 10 }}>
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-accent)', animation: 'hotspotPing 2s ease-out infinite' }} />
                                    <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: 'var(--color-accent)' }} />
                                </div>
                            </div>
                            {/* Hotspot — waist */}
                            <div style={{ position: 'absolute', top: '48%', left: '38%' }}>
                                <div style={{ position: 'relative', width: 10, height: 10 }}>
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(200,169,126,0.7)', animation: 'hotspotPing 2.4s ease-out infinite 0.8s' }} />
                                    <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: 'var(--color-accent)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Floating: Body Type Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.88, y: 12 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.5, type: 'spring', stiffness: 280, damping: 24 }}
                            style={{
                                position: 'absolute', top: '12%', right: 0,
                                background: 'rgba(22,19,15,0.82)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '0.5px solid rgba(200,169,126,0.35)',
                                borderRadius: 12,
                                padding: '14px 18px',
                                boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
                                animation: 'floatCard 4s ease-in-out infinite',
                                minWidth: 170,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-accent)' }}>sensors</span>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Body Type Detected</span>
                            </div>
                            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 4px', lineHeight: 1 }}>Hourglass</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ flex: 1, height: 2, borderRadius: 1, background: 'var(--color-border)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', inset: 0, width: '94%', background: 'var(--color-accent)', borderRadius: 1 }} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>94%</span>
                            </div>
                        </motion.div>

                        {/* Floating: Color Palette Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            style={{
                                position: 'absolute', top: '42%', right: -8,
                                background: 'rgba(22,19,15,0.82)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '0.5px solid rgba(200,169,126,0.25)',
                                borderRadius: 12,
                                padding: '12px 16px',
                                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                                animation: 'floatCard 5s ease-in-out infinite 1.5s',
                            }}
                        >
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted)', display: 'block', marginBottom: 8 }}>Your Palette</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {[
                                    { bg: '#2C3E50', label: 'Midnight' },
                                    { bg: '#8B7355', label: 'Camel' },
                                    { bg: '#D4C5A9', label: 'Ivory' },
                                    { bg: '#722F37', label: 'Wine' },
                                ].map(c => (
                                    <div key={c.label} title={c.label} style={{ width: 22, height: 22, borderRadius: 4, background: c.bg, border: '0.5px solid rgba(255,255,255,0.1)' }} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Floating: Outfit Match Card (bottom-right) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.75, duration: 0.5 }}
                            style={{
                                position: 'absolute', bottom: 0, right: -16,
                                width: 180,
                                background: 'rgba(22,19,15,0.7)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                border: '0.5px solid rgba(200,169,126,0.3)',
                                borderRadius: 12,
                                overflow: 'hidden',
                                boxShadow: '0 24px 56px rgba(0,0,0,0.6)',
                                animation: 'floatCard 4.5s ease-in-out infinite 0.5s',
                            }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop"
                                alt="Outfit match"
                                style={{ width: '100%', height: 140, objectFit: 'cover', objectPosition: 'top center', filter: 'brightness(0.78)' }}
                            />
                            <div style={{ padding: '10px 14px' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>98% Match</span>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: '4px 0 0', lineHeight: 1.3 }}>Wrap Midi Dress</p>
                            </div>
                        </motion.div>

                        {/* Subtle AR grid overlay */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '72%', height: '92%', borderRadius: 12, pointerEvents: 'none',
                            backgroundImage: 'linear-gradient(rgba(200,169,126,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,126,0.04) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        }} />
                    </motion.div>

                    {/* ── RIGHT: Copy ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
                    >
                        <span className="label-accent">Why StyleSync</span>
                        <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 400, margin: 0, lineHeight: 1.15 }}>
                            Couture logic,<br />
                            <em>computational precision</em>
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.8, margin: 0 }}>
                            StyleSync isn't a generic size guide. It's a digital atelier — one that understands your specific proportions and tells you, with precision, why certain silhouettes work.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                'Real-time virtual try-on via diffusion models',
                                'Skin tone–aware color palette curation',
                                'Occasion-specific outfit recommendations',
                                'Wardrobe saving and trend tracking',
                            ].map((item) => (
                                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15, color: 'var(--color-muted)' }}>
                                    <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }}>check</span>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        {/* AR stat pills */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[
                                { icon: 'sensors', label: '33 landmarks tracked' },
                                { icon: 'auto_awesome', label: 'Diffusion try-on' },
                                { icon: 'palette', label: 'AI color match' },
                            ].map(p => (
                                <div key={p.label} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(200,169,126,0.08)',
                                    border: '0.5px solid rgba(200,169,126,0.25)',
                                    borderRadius: 20, padding: '6px 12px',
                                }}>
                                    <span className="material-icons" style={{ fontSize: 12, color: 'var(--color-accent)' }}>{p.icon}</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.04em' }}>{p.label}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                                <Link to={isAuthenticated ? '/body-scan' : '/signup'} className="btn btn-primary" style={{ fontSize: 12 }}>
                                    <span className="material-icons" style={{ fontSize: 15 }}>sensors</span>
                                    Start Body Scan
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                                <Link to="/recommendations" className="btn btn-ghost" style={{ fontSize: 12 }}>
                                    See demo
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER SPACE ─────────────────────────────── */}
        </div>
    );
}
