import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function SavedOutfits() {
    const navigate = useNavigate();
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [recentTryOns, setRecentTryOns] = useState([]);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) { loadSaved(); loadTryOns(); }
        else { setSavedOutfits([]); setRecentTryOns([]); }
    }, [isAuthenticated]);

    const loadSaved = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
            setSavedOutfits(saved);
        } catch { setSavedOutfits([]); }
    };

    const loadTryOns = () => {
        try {
            const tryons = JSON.parse(localStorage.getItem('ss_tryons') || '[]');
            setRecentTryOns(tryons);
        } catch { setRecentTryOns([]); }
    };

    const removeTryOn = (id) => {
        const filtered = recentTryOns.filter(t => t.id !== id);
        localStorage.setItem('ss_tryons', JSON.stringify(filtered));
        localStorage.setItem('ss_tryon_count', String(filtered.length));
        setRecentTryOns(filtered);
    };

    const removeOutfit = (id) => {
        const filtered = savedOutfits.filter(o => (o._id || o.name) !== id);
        localStorage.setItem('savedOutfits', JSON.stringify(filtered));
        setSavedOutfits(filtered);
    };

    const clearAll = () => {
        localStorage.setItem('savedOutfits', JSON.stringify([]));
        setSavedOutfits([]);
    };

    const totalWorth = savedOutfits.reduce((acc, item) => {
        const price = parseFloat(item.price?.amount || item.price || 0);
        return acc + (isNaN(price) ? 0 : price);
    }, 0).toFixed(2);

    const cardVariant = {
        hidden: { opacity: 0, y: 20 },
        show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 28 } }),
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>
            <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'calc(var(--navbar-height) + 48px) 32px 80px' }}>

                {/* ── Header ──────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 48 }}
                >
                    <div>
                        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span className="label">Account</span>
                            <span className="label">/</span>
                            <span className="label" style={{ color: 'var(--color-accent)' }}>Digital Closet</span>
                        </nav>
                        <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1 }}>
                            Your Closet
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-muted)', maxWidth: 420, lineHeight: 1.7, margin: 0 }}>
                            {isAuthenticated
                                ? 'Curated ensembles synchronized with your unique body geometry and aesthetic DNA.'
                                : 'Sign in to view your curated ensembles and synchronized wardrobe.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {savedOutfits.length > 0 && isAuthenticated && (
                            <motion.button
                                onClick={clearAll}
                                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                                className="btn btn-danger"
                                style={{ fontSize: 10 }}
                            >
                                <span className="material-icons" style={{ fontSize: 14 }}>delete_outline</span>
                                Clear All
                            </motion.button>
                        )}
                        <motion.button
                            onClick={() => isAuthenticated ? navigate('/recommendations') : navigate('/login', { state: { from: { pathname: '/saved-outfits' } } })}
                            className="btn btn-primary"
                            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                            style={{ fontSize: 10 }}
                        >
                            <span className="material-icons" style={{ fontSize: 14 }}>add</span>
                            New Outfit
                        </motion.button>
                    </div>
                </motion.header>

                {/* ── Stats Bar ───────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 48 }}
                >
                    {[
                    { label: 'Saved Looks',    value: savedOutfits.length,                    accent: false },
                        { label: 'Style Score',    value: '94%',                                  accent: true },
                        { label: 'Recent Try-Ons', value: recentTryOns.length,                    accent: false },
                        { label: 'Closet Worth',   value: `$${totalWorth}`,                       accent: true },
                    ].map((stat, i) => (
                        <div key={stat.label} style={{ padding: '22px 28px', borderRight: i < 3 ? '0.5px solid var(--color-border)' : 'none' }}>
                            <p className="label" style={{ marginBottom: 10 }}>{stat.label}</p>
                            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, fontWeight: 400, color: stat.accent ? 'var(--color-accent)' : 'var(--color-text)', margin: 0, lineHeight: 1 }}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </motion.div>

                {/* ── Recent Try-Ons ─────────────────────────────── */}
                {recentTryOns.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{ marginBottom: 56 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 4px' }}>Recent Try-Ons</h2>
                                <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0 }}>{recentTryOns.length} AI-generated look{recentTryOns.length !== 1 ? 's' : ''} saved</p>
                            </div>
                            <button
                                onClick={() => { localStorage.removeItem('ss_tryons'); localStorage.setItem('ss_tryon_count', '0'); setRecentTryOns([]); }}
                                className="btn btn-danger" style={{ fontSize: 10 }}
                            >
                                <span className="material-icons" style={{ fontSize: 14 }}>delete_outline</span>
                                Clear Try-Ons
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                            {recentTryOns.map((tryon, idx) => (
                                <motion.div
                                    key={tryon.id || idx}
                                    custom={idx}
                                    variants={cardVariant}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true, margin: '-40px' }}
                                    whileHover={{ y: -3 }}
                                    style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-accent-border)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}
                                >
                                    <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={tryon.imageUrl}
                                            alt={tryon.clothName}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            onError={e => { e.target.src = 'https://via.placeholder.com/400x533?text=Try-On'; }}
                                        />
                                        {/* Provider badge */}
                                        <span className="tag" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(200,169,126,0.15)', color: 'var(--color-accent)', borderColor: 'var(--color-accent-border)' }}>
                                            {tryon.provider || 'AI Try-On'}
                                        </span>
                                        {/* Delete button */}
                                        <button
                                            onClick={() => removeTryOn(tryon.id)}
                                            style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(22,19,15,0.8)', border: '0.5px solid rgba(248,113,113,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-err)' }}
                                        >
                                            <span className="material-icons" style={{ fontSize: 14 }}>close</span>
                                        </button>
                                    </div>
                                    <div style={{ padding: '14px 16px' }}>
                                        <p style={{ fontFamily: '"DM Sans"', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tryon.clothName}</p>
                                        <p className="label" style={{ margin: 0 }}>{new Date(tryon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ── Saved Outfits ─────────────────────────────── */}
                {savedOutfits.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ border: '1px dashed var(--color-border-light)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}
                    >
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-accent-dim)', border: '0.5px solid var(--color-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <span className="material-icons" style={{ fontSize: 36, color: 'var(--color-accent)' }}>checkroom</span>
                        </div>
                        <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 12px' }}>Closet Empty</h4>
                        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 24, maxWidth: 300, lineHeight: 1.7 }}>
                            Sync your digital silhouette to unlock AI-personalized fit recommendations.
                        </p>
                        <Link to="/body-scan" className="btn btn-primary" style={{ fontSize: 11 }}>
                            <span className="material-icons" style={{ fontSize: 14 }}>sensors</span>
                            Initialize Body Scan
                        </Link>
                    </motion.div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                        {savedOutfits.map((outfit, idx) => (
                            <motion.div
                                key={outfit._id || idx}
                                custom={idx}
                                variants={cardVariant}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: '-40px' }}
                                whileHover={{ y: -3 }}
                                style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                {/* Image */}
                                <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                                    <img
                                        src={outfit.imageUrl}
                                        alt={outfit.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%)', transition: 'filter 0.6s, transform 0.6s' }}
                                        onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0%)'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(20%)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                        onError={e => { e.target.src = 'https://via.placeholder.com/600x800?text=StyleSync'; }}
                                    />
                                    {/* Category pill */}
                                    <span className="tag" style={{ position: 'absolute', top: 12, left: 12, textTransform: 'capitalize' }}>{outfit.category}</span>

                                    {/* Hover overlay */}
                                    <div className="outfit-hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(22,19,15,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: 0, transition: 'opacity 0.3s', backdropFilter: 'blur(4px)' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >
                                        <button
                                            onClick={() => navigate('/ar-tryon', { state: { product: outfit } })}
                                            style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-bg)' }}
                                            title="Try On"
                                        >
                                            <span className="material-icons" style={{ fontSize: 20 }}>view_in_ar</span>
                                        </button>
                                        <button
                                            onClick={() => removeOutfit(outfit._id || outfit.name)}
                                            style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-err)' }}
                                            title="Remove"
                                        >
                                            <span className="material-icons" style={{ fontSize: 20 }}>delete_outline</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={{ padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ fontFamily: '"DM Sans"', fontSize: 15, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{outfit.name}</h3>
                                            <p className="label">Added Recently</p>
                                        </div>
                                        <span style={{ fontSize: 15, color: 'var(--color-accent)', fontWeight: 600, flexShrink: 0 }}>
                                            {outfit.price?.amount ? `$${outfit.price.amount}` : outfit.price || '—'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <button onClick={() => navigate('/ar-tryon', { state: { product: outfit } })} className="btn btn-ghost" style={{ fontSize: 9, padding: '10px 8px', justifyContent: 'center' }}>
                                            Try On
                                        </button>
                                        <button className="btn btn-primary" style={{ fontSize: 9, padding: '10px 8px', justifyContent: 'center' }}>
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
