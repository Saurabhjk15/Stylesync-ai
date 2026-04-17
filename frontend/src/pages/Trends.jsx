import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TREND_ARTICLES = [
    {
        category: 'Technology',
        title: 'The Evolution of Smart Fabrics',
        to: '/trends/evolution-smart-fabrics',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAxm72_13ctr3flTpgerlUULsUNIKqll1UCL5xFuGiopq2mVf3cPtGT8P7zAP51HvM9XIpIe-xv7lhNhJ4EjaxZm7Fq-y6vjcyDhYa1GxWGkHsO7LiCybFUB_gOfEPvn2TBHXC2AmAhDFyPoa3nalHL3Xl3k8wZx6A32zFk8rJCg-ZZtgGv2L4SAfxSOWKjm976wgMX8aCtevGISAGy6An6uC0YjQlo-ptU5_rPWCI8C4jy_tyDix84Wu8czn0Cmfqg9_EQLHjJ0M3',
    },
    {
        category: 'Editorial',
        title: 'Quiet Luxury in 2026',
        to: '/trends/quiet-luxury-2026',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5LGq8eHXpKkgI_AwOCV3G1Y5Yz90yPEjId75rzpAxD8dwEyY2ONO1veIpiSmUT1fuKl96QEKcuhHdvDZoCWnV-hV_N-S2maVxn8feNiWdw5oFCkXK3C4n-yKxG4oB9TdXyH0fa9J-S8s3JNKve6p9fnWr7v9LzqF3vv6I7J_1zFvl2KrvbNGlgjrvNUe1oSikOGebfDGBhtkou1yO1MunDtZdqseWR-dEhhzG_V3eKp4g_c0OwXtjJLNEKXozaU1UyGrIVcUNtoC1',
    },
    {
        category: 'Environment',
        title: 'Bio-Digital Weaving Techniques',
        to: '/trends/bio-digital-weaving',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjb5ZfZc1DpRVRc74LCMdZsNTUJxBQVFbV1vomro4n0qDnnhB1utPZVvYP1m5afMTmLJwRva8KAeLC-XKZSuJb2QuVScTbpoDtLcEaWOStoo2DUdww5tW2wtjMciSkh00vl08WwKfqbS7l5QBAVHwomDKva3l6sg8d_ndHK0dtT9Nsx9OHwkHbRWoTE6P_5V03B-RHTAbeDymPewyPAhdzQnmjcJcwxsIYkz5oxgs8258g2MaqrP_b_JfpYPtpdxUcceiKoHJB759M',
    },
    {
        category: 'Street Culture',
        title: 'Algorithm-Derived Urbanism',
        to: '/trends/algorithm-derived-urbanism',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8JQDRiYp7MMMOXeZ-zLQYJw-OEzgTulGRb-g2Oe2SepUvZIT5SHhlZDQmbt6MTvG4Js2pmd_WeIzPZ5TbdIiV2nNzXQVFfvgSaF3UXlSir1hlO4lHAMJPPQ6veiCrnz31Cetpg37_D4It8rLgJTXGWjKtvNLv1kxdysBU_itzcc-YrGXLvOrGCkFa6Dh2Tl88yo3fhsO0KkbtLK8Gyy5tggA-7pXX-jlCIFqTadYY_DF6Gl2fFGb0KgrB1P6QTYo3kPMG6HbtIfY2',
    },
];

const STATS = [
    { value: '68%',   sub: 'Hourglass profiles prefer tailored waists' },
    { value: '+42%',  sub: 'Sustainability score increase YoY' },
    { value: '2.4s',  sub: 'Average style recognition time' },
    { value: '9.8',   sub: 'Match accuracy precision rating' },
];

const CATEGORIES = [
    {
        label: 'Curation 01', title: 'Seasonal Echoes', to: '/recommendations',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKp8JByZlBi5B5sDl-_KKnFRkEIWwK-D8N2Ru6Hiy43TMEhZOkjCQJvsSKVNeDpe2eiWeMUOJMswx0OH5onpJswnpWpBDUVv80mBk8YGYbudi5xuG_ikHRdByTnULAYw5pvabdHpN28D9loOn7CuxsC9uRG4qWcF7TmF2ZO9O1qP4igb9gO6LCXbBZldKBghea4tm-PPF9YXSz0z8SQyljz8NSyPNdWz0UO-hAC9c35K3zTiYNELk46d0ISIUtyIJ5yZU3hjtj2U4o',
    },
    {
        label: 'Curation 02', title: 'Anatomical Fit', to: '/ar-tryon',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8f0Kh3oGvX95NgrEyFimzQoZRZ8HuJH7DwVr7p8AFO5QSTYuqyDG-y023CZINxNVNQhveYxDLYQrvSM3NN1yFj8tkHnjkWbbQw6KwK0lIbKDVHni73a9B-pwUWKL9ZH3Bn2m1eYnmKx_1eUCOyLTOZeudMoR1UoY2YOeJfLW8X8YJwq1qtfydwnK74rBYSkiVbonc_9tYsQp8RQ77axNN_i0zbhPfgpj-1DVrD06jIQXIYeGZIt9sRbebD-0FOW22OPzUwW3OfTQJ',
    },
    {
        label: 'Curation 03', title: 'Chromatic Shift', to: '/trends/evolution-smart-fabrics',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcP7GOZB6GuDBruuMkM6064cKpEWyfpIboZ7556E9bBdP0SKooJBj7qZW2L2ETXV_fPu6PfpEM7b4gaas_Pf0a6Bc6rhQVVQKpowiUOb0QU0KD9s3d7nC5B5KPoo0VZHctHyse3kmt2fT8nMNfBHZiESBkDX0gVmkz19qppTqNXcerwZEEtt4Fjj0fYj3na0Kz89B58WoLthOMazxzXegl9lZYptkvJZVLIXoWBEAHldJphXnGHkHedM0cUvUK8-Iv4OTezq3YqxPb',
    },
];

export default function Trends() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>

            {/* ── HERO — full-bleed, starts at top:0, navbar overlay ── */}
            <header style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <img
                    alt="Trends Hero"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6zP1WnvWEN8w8RP68R7ZJkir37mpAQHQvJSM06GM6-3DgA3tgZZPgeFKYtDU22aj10DPfiPMfTcX68hoON3FtGZMrYCu2O9x9N5cVzi7Nj4J6Whw_nZ6fB1117zgW4S5HIdfSbliulxespqPNpr-YY6J09EfSg1WtFaI2I-PHeLmhZ41efiFCsEYUobt3W6gYKHKkVGZPCO2Fox_xdo-k9u-by2XVp92zRoWDlOWKTwpfp0UvRxQw0z-DugEGMQQQSrB7hVfMY8jK"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(22,19,15,0.95) 0%, rgba(22,19,15,0.55) 60%, rgba(22,19,15,0.1) 100%)' }} />
                <div style={{ position: 'relative', width: '100%', padding: 'clamp(0px,4vw,64px) clamp(20px,5vw,64px) clamp(48px,6vw,80px)' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55 }}
                    >
                        <span className="label-accent" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ width: 24, height: '0.5px', background: 'var(--color-accent)', display: 'inline-block' }} />
                            AI Forecast 2026
                        </span>
                        <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(56px, 9vw, 100px)', fontWeight: 300, lineHeight: 0.95, margin: '0 0 20px', color: 'var(--color-text)' }}>
                            Fashion<br />
                            <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>Trends</em> 2026
                        </h1>
                        <p style={{ fontSize: 17, color: 'var(--color-muted)', maxWidth: 480, lineHeight: 1.7, margin: 0 }}>
                            The future of silhouettes, curated by StyleSync AI. Computational precision meets artisanal craft.
                        </p>
                    </motion.div>
                </div>
            </header>

            <main style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,5vw,64px)' }}>

                {/* ── AI Stats ─────────────────────────────── */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="trends-stats-grid"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 'clamp(40px,6vw,80px)', maxWidth: '100%' }}
                >
                    {STATS.map((s, i) => (
                        <div key={i} style={{ padding: '24px 28px', borderRight: i < STATS.length - 1 ? '0.5px solid var(--color-border)' : 'none' }}>
                            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 36, fontWeight: 400, color: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-text)', display: 'block', lineHeight: 1 }}>
                                {s.value}
                            </span>
                            <p className="label" style={{ marginTop: 10 }}>{s.sub}</p>
                        </div>
                    ))}
                </motion.section>

                {/* ── Featured ──────────────────────────────── */}
                <section style={{ marginBottom: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
                        <div>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 8 }}>Featured</span>
                            <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 32, fontWeight: 400, margin: 0 }}>Featured Highlight</h2>
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="trends-featured-grid"
                        style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    >
                        <div style={{ height: 360, overflow: 'hidden' }}>
                            <img
                                alt="Structured Blazers"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTstN1WPxrN9uq8CJoMfJiY-p-Lib-oKefd4MgUhpao5LqDnzlk6Dr8ZboMfWsSsWJiB5K0J4KS_0o8hkAhkTGVNLgaS4JcNBlTJCrOvJhDqj-ma4ld7GT95UufYZdNbhchHj0QSsBmjXtH8eMJEdgwcdRKYQNyx7AtKfaqRI1kGaLf4wVbXQOP4YSxY4qhaQY2qReMalHDpkERAGyN0cGkAlasI90jOecInTZ-HsruE9n_dqf3DKBxJK9x4SLIw8K9swNoiQQXT0F"
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </div>
                        <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                            <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginBottom: 16 }}>AI Analyzed</span>
                            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 12px' }}>
                                Structured Blazers
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.75, margin: '0 0 28px' }}>
                                A resurgence of sharp architectural lapels and metallic weave fibers. Our AI predicts a massive shift towards exaggerated shoulders as a symbol of digital empowerment.
                            </p>
                            <Link to="/saved-outfits" className="btn btn-ghost" style={{ alignSelf: 'flex-start', fontSize: 11 }}>
                                View Gallery
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* ── Category Cards ───────────────────────── */}
                <section style={{ marginBottom: 80 }}>
                    <div className="trends-cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 6, overflow: 'hidden', border: '0.5px solid var(--color-border)' }}
                            >
                                <img alt={cat.title} src={cat.img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(22,19,15,0.9) 0%, transparent 60%)' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '0 24px 28px' }}>
                                    <span className="label-accent" style={{ display: 'block', marginBottom: 6 }}>{cat.label}</span>
                                    <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 12px' }}>{cat.title}</h4>
                                    <Link to={cat.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"DM Sans"', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', textDecoration: 'none' }}>
                                        Explore <span className="material-icons" style={{ fontSize: 13 }}>arrow_forward</span>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── Deep Dives ───────────────────────────── */}
                <section style={{ marginBottom: 80 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
                        <div>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 8 }}>Editorial</span>
                            <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 32, fontWeight: 400, margin: 0 }}>Deep Dives</h2>
                        </div>
                    </div>
                    <div className="trends-articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {TREND_ARTICLES.map((article, i) => (
                            <motion.article
                                key={article.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ aspectRatio: '16/9', marginBottom: 16, borderRadius: 6, overflow: 'hidden', border: '0.5px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                    <img src={article.img} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(40%)', transition: 'filter 0.4s, transform 0.5s' }}
                                        onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(40%)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    />
                                </div>
                                <span className="label" style={{ color: 'var(--color-accent)', marginBottom: 8 }}>{article.category}</span>
                                <h5 style={{ fontFamily: '"DM Sans"', fontSize: 15, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px', lineHeight: 1.4 }}>{article.title}</h5>
                                <Link to={article.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-muted)', textDecoration: 'none', borderBottom: '0.5px solid var(--color-border)', paddingBottom: 4, transition: 'color 0.2s, border-color 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                                >
                                    Read More
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                </section>

                {/* ── CTA ──────────────────────────────────── */}
                <section style={{ padding: '64px 0', borderTop: '0.5px solid var(--color-border)', textAlign: 'center' }}>
                    <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Get Started</span>
                    <h2 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, fontStyle: 'italic', margin: '0 0 16px' }}>
                        Your perfect fit awaits
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--color-muted)', marginBottom: 32 }}>
                        Join 50,000+ users who define their signature look with biological precision.
                    </p>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
                        <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 12 }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>sensors</span>
                            Start Body Scan
                        </Link>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
