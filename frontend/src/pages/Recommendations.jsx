import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Framer helpers ── */
const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, type: 'spring', stiffness: 280, damping: 28 } }),
};

/* ── Guest Gate Component ── */
function GuestGate() {
    const MOCK_CARDS = [
        { label: 'Style DNA', desc: 'Hourglass Body Type · 94% confidence', icon: 'sensors' },
        { label: 'Color Palette', desc: 'Midnight, Camel, Deep Wine', icon: 'palette' },
        { label: 'Top Pick', desc: 'Wrap Midi Dress · 98% match', icon: 'checkroom' },
    ];
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: '"DM Sans", sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 80px', position: 'relative', overflow: 'hidden' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(200,169,126,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={{ maxWidth: 520, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,169,126,0.08)', border: '0.5px solid rgba(200,169,126,0.3)', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
                    <span className="material-icons" style={{ fontSize: 13, color: 'var(--color-accent)' }}>auto_awesome</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>AI Style DNA</span>
                </div>

                <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 400, color: 'var(--color-text)', margin: '0 0 16px', lineHeight: 1.15 }}>
                    Your personal style<br /><em>report awaits.</em>
                </h1>
                <p style={{ fontSize: 15, color: 'var(--color-muted)', margin: '0 0 40px', lineHeight: 1.75, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                    Complete a free body scan and get your AI-generated Style DNA — personalized outfit picks, color palettes, and silhouette guidance based on your exact proportions.
                </p>

                {/* Blurred mock cards */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 40, justifyContent: 'center', position: 'relative' }}>
                    {MOCK_CARDS.map((c, i) => (
                        <motion.div
                            key={c.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                            style={{
                                flex: 1, maxWidth: 150, background: 'rgba(200,169,126,0.06)', border: '0.5px solid rgba(200,169,126,0.2)',
                                borderRadius: 10, padding: '16px 12px', textAlign: 'left',
                                filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none',
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-accent)', marginBottom: 8, display: 'block' }}>{c.icon}</span>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{c.label}</p>
                            <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                        </motion.div>
                    ))}
                    {/* Unlock overlay */}
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(22,19,15,0.5)', backdropFilter: 'blur(2px)', gap: 8 }}>
                        <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-accent)' }}>lock</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.05em' }}>Sign in to unlock</span>
                    </div>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                        <Link to="/signup" className="btn btn-primary" style={{ fontSize: 13 }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>person_add</span>
                            Create free account
                        </Link>
                    </motion.div>
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                        <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Sign in</Link>
                    </motion.div>
                </div>

                {/* Feature list */}
                <div style={{ marginTop: 48, display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                        { icon: 'sensors', text: '33-point body scan' },
                        { icon: 'auto_awesome', text: 'Gemini-powered DNA' },
                        { icon: 'palette', text: 'Skin tone color match' },
                        { icon: 'checkroom', text: 'AI virtual try-on' },
                    ].map(f => (
                        <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-icons" style={{ fontSize: 13, color: 'var(--color-accent)' }}>{f.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.04em' }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default function Recommendations() {
    const location = useLocation();
    const navigate = useNavigate();

    // Read from router state (direct navigation from body scan)
    // OR from localStorage (Stylist nav link — no router state)
    const routeState = location.state || (() => {
        try { return JSON.parse(localStorage.getItem('ss_scan_state') || 'null'); } catch { return null; }
    })();

    const {
        bodyType = 'rectangle',
        skinTone = 'medium',
        occasion = 'casual',
        gender = 'female',
        heightCm = null,
        measurements = {},
        confidence = 0.80,
        userWaist = null,
        userHip = null,
        userChest = null,
    } = routeState || {};

    const [styleDNA, setStyleDNA] = useState(null);
    const [styleDNALoading, setStyleDNALoading] = useState(true);
    const [styleDNAFromGemini, setStyleDNAFromGemini] = useState(false);
    const [collectionMatches, setCollectionMatches] = useState([]);
    const [collectionLoading, setCollectionLoading] = useState(false);
    const [hasCollectionMatch, setHasCollectionMatch] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [customOutfit, setCustomOutfit] = useState({ image: null, preview: null, name: '', category: 'top' });

    const { isAuthenticated } = useSelector((state) => state.auth);

    // ── Cache helpers ──────────────────────────────────────────────────────────
    const CACHE_KEY = 'ss_recommendations';
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    const getCachedDNA = () => {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const { data, ts, bodyType: cachedBT, gender: cachedG } = JSON.parse(raw);
            const fresh = Date.now() - ts < CACHE_TTL;
            const sameProfile = cachedBT === bodyType && cachedG === gender;
            return (fresh && sameProfile) ? data : null;
        } catch { return null; }
    };

    const saveCachedDNA = (dna) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: dna, ts: Date.now(), bodyType, gender }));
        } catch {}
    };

    // ── Guest Gate: show signup prompt if not authenticated and no scan data ──
    const hasScanData = routeState?.bodyType;
    if (!isAuthenticated && !hasScanData) {
        return <GuestGate />;
    }

    useEffect(() => {
        generateStyleDNA();
    }, []);

    const generateStyleDNA = async (forceRefresh = false) => {
        setStyleDNALoading(true);
        try {
            // Check cache first (skip if force-refreshing)
            if (!forceRefresh) {
                const cached = getCachedDNA();
                if (cached) {
                    console.log('🗂️ Recommendations: using 24h cache');
                    setStyleDNA(cached);
                    setStyleDNALoading(false);
                    checkCollection(cached.search_terms || [], cached.colors?.best || []);
                    return;
                }
            }
            const response = await api.post('/ai/style-dna', {
                gender, bodyType, heightCm,
                shoulderCm: measurements?.shoulder_cm,
                waistCm: userWaist || measurements?.waist_cm,
                hipCm: userHip || measurements?.hip_cm,
                occasion, confidence, skinTone,
            });
            if (response.data.success) {
                const dna = response.data.styleDNA;
                setStyleDNA(dna);
                saveCachedDNA(dna);
                setStyleDNAFromGemini(response.data.fromGemini);
                // Pass colors directly to avoid stale closure
                checkCollection(dna.search_terms || [], dna.colors?.best || []);
            }
        } catch {
            setStyleDNA(getLocalFallbackDNA(bodyType, occasion, gender));
            checkCollection([]);
        } finally {
            setStyleDNALoading(false);
        }
    };

    const checkCollection = async (searchTerms = [], colors = []) => {
        setCollectionLoading(true);
        try {
            const response = await api.post('/ai/match-collection', { searchTerms, gender, occasion, bodyType });
            if (response.data.success) {
                setCollectionMatches(response.data.matches || []);
                setHasCollectionMatch(response.data.hasMatches);
            }
        } catch {
            setHasCollectionMatch(false);
        } finally {
            setCollectionLoading(false);
        }
        // Always run web search — use style terms or fallback terms based on body type
        const fallbackTerms = ['outfit', bodyType + ' clothing', occasion + ' outfit', gender + ' fashion'];
        runWebSearch(searchTerms.length > 0 ? searchTerms : fallbackTerms, colors);
    };

    const runWebSearch = async (searchTerms, colors = []) => {
        setSearchLoading(true);
        try {
            const response = await api.post('/ai/search-clothing', {
                gender, bodyType, occasion, searchTerms,
                suggestedColors: colors,
            });
            if (response.data.success) setSearchResults(response.data);
        } catch (err) {
            console.error('Web search error:', err);
        } finally {
            setSearchLoading(false);
        }
    };

    const loadSavedOutfits = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
            setSavedIds(new Set(saved.map(o => o._id || o.name)));
            return saved;
        } catch { return []; }
    };

    const [savedOutfitsList, setSavedOutfitsList] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        setSavedIds(new Set(saved.map(o => o._id || o.name)));
        setSavedOutfitsList(saved);
    }, []);

    const toggleSave = (product) => {
        if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
        const saved = JSON.parse(localStorage.getItem('savedOutfits') || '[]');
        const id = product._id || product.name;
        if (savedIds.has(id)) {
            localStorage.setItem('savedOutfits', JSON.stringify(saved.filter(o => (o._id || o.name) !== id)));
            setSavedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            toast.success('Removed from closet');
        } else {
            saved.push(product);
            localStorage.setItem('savedOutfits', JSON.stringify(saved));
            setSavedIds(prev => new Set(prev).add(id));
            toast.success('Saved to closet');
        }
    };

    const navigateToTryOn = (product, type = 'ar') => {
        if (!isAuthenticated) { navigate('/login', { state: { from: location } }); return; }
        navigate(type === 'cpvton' ? '/cpvton-tryon' : '/ar-tryon', { state: { product, bodyType, skinTone, occasion, gender } });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setCustomOutfit(prev => ({ ...prev, image: file, preview: reader.result }));
        reader.readAsDataURL(file);
    };

    const bodyTypeLabel = bodyType.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const heightLabel = !heightCm ? '' : heightCm < 163 ? 'Petite' : heightCm > 175 ? 'Tall' : 'Average';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif' }}>
            <main style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'calc(var(--navbar-height) + 48px) 32px 80px' }}>

                {/* ── Header ────────────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ marginBottom: 48 }}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {[bodyTypeLabel, occasion, heightLabel, gender !== 'unisex' ? gender : null]
                            .filter(Boolean)
                            .map(tag => <span key={tag} className="tag">{tag}</span>)}
                        {styleDNA && (
                            <span className="tag tag-accent">
                                ✦ {styleDNAFromGemini ? 'Gemini AI' : 'Style Engine'}
                            </span>
                        )}
                    </div>

                    <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-text)', margin: '0 0 12px' }}>
                        Your Style DNA
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--color-muted)', maxWidth: 540, lineHeight: 1.7, margin: 0 }}>
                        Personalized recommendations based on your {Math.round((confidence || 0.8) * 100)}% confidence body scan.
                    </p>
                </motion.header>

                {/* ── Layout: Sidebar + Main ────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

                    {/* ── Sidebar: Style DNA ───────────────────────────── */}
                    <motion.aside
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.45 }}
                        style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)' }}
                    >
                        {styleDNALoading ? (
                            <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                                <p className="label">Generating report…</p>
                            </div>
                        ) : styleDNA ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Summary */}
                                <div className="card-surface" style={{ padding: 20 }}>
                                    <span className="label-accent" style={{ display: 'block', marginBottom: 10 }}>Style DNA Report</span>
                                    <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.7, margin: 0, borderLeft: '2px solid var(--color-accent)', paddingLeft: 12 }}>
                                        {styleDNA.summary}
                                    </p>
                                </div>

                                {/* What works */}
                                <div className="card-surface" style={{ padding: 20 }}>
                                    <span className="label" style={{ color: 'var(--color-ok)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 13 }}>check</span>
                                        Works for you
                                    </span>
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {(styleDNA.what_works || []).slice(0, 3).map((item, i) => (
                                            <li key={i}>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>{item.item}</span>
                                                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{item.reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Avoid */}
                                <div className="card-surface" style={{ padding: 20 }}>
                                    <span className="label" style={{ color: 'var(--color-err)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span className="material-icons" style={{ fontSize: 13 }}>remove</span>
                                        Avoid
                                    </span>
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {(styleDNA.what_to_avoid || []).slice(0, 2).map((item, i) => (
                                            <li key={i} style={{ fontSize: 13, color: 'var(--color-muted)', textDecoration: 'line-through', textDecorationColor: 'var(--color-err)' }}>
                                                {item.item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Colors */}
                                {styleDNA.colors?.best?.length > 0 && (
                                    <div className="card-surface" style={{ padding: 20 }}>
                                        <span className="label" style={{ display: 'block', marginBottom: 10 }}>Best Colors</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {styleDNA.colors.best.map((color, i) => (
                                                <span key={i} className="tag">{color}</span>
                                            ))}
                                        </div>
                                        {styleDNA.colors.occasion_note && (
                                            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 10, lineHeight: 1.6 }}>{styleDNA.colors.occasion_note}</p>
                                        )}
                                    </div>
                                )}

                                {/* Fabrics */}
                                {styleDNA.fabrics_patterns && (
                                    <div className="card-surface" style={{ padding: 20 }}>
                                        <span className="label" style={{ display: 'block', marginBottom: 8 }}>Fabrics & Patterns</span>
                                        <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.65, margin: 0 }}>{styleDNA.fabrics_patterns}</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </motion.aside>

                    {/* ── Main: Products Grid ──────────────────────────── */}
                    <div>
                        {/* Upload button + AI Try-On shortcut */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 24 }}>
                            <motion.button
                                onClick={() => navigate('/ar-tryon', { state: { bodyType, skinTone, occasion, gender } })}
                                className="btn btn-primary"
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <span className="material-icons" style={{ fontSize: 14 }}>auto_awesome</span>
                                AI Try-On
                            </motion.button>
                            <motion.button
                                onClick={() => setShowUploadModal(true)}
                                className="btn btn-ghost"
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                <span className="material-icons" style={{ fontSize: 14 }}>add_a_photo</span>
                                Upload Your Own
                            </motion.button>
                        </div>

                        {/* ── 1. Found Online (web search) — FIRST ── */}
                        {(searchResults || searchLoading) && (
                            <div style={{ marginBottom: 48 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                    <span className="label-accent" style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                        <span className="material-icons" style={{ fontSize: 13 }}>travel_explore</span>
                                        Found Online
                                    </span>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                </div>
                                <WebSearchResults
                                    searchResults={searchResults}
                                    searchLoading={searchLoading}
                                    onUpload={() => setShowUploadModal(true)}
                                />
                            </div>
                        )}

                        {/* ── 2. Collection Picks — BELOW ── */}
                        {(collectionLoading || styleDNALoading) ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Scanning collection…</span>
                            </div>
                        ) : hasCollectionMatch && collectionMatches.length > 0 ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                    <span className="label-accent" style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                        <span className="material-icons" style={{ fontSize: 13 }}>checkroom</span>
                                        Collection Picks
                                    </span>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                                    {collectionMatches.map((product, idx) => (
                                        <ProductCard
                                            key={product._id || idx}
                                            product={product}
                                            index={idx}
                                            savedIds={savedIds}
                                            onSave={toggleSave}
                                            onTryAR={() => navigateToTryOn(product, 'ar')}
                                            onTryAI={() => navigateToTryOn(product, 'cpvton')}
                                            bodyTypeLabel={bodyTypeLabel}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* ── Saved Outfits ── */}
                        {savedOutfitsList.length > 0 && (
                            <div style={{ marginTop: 48 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                    <span className="label-accent" style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                                        <span className="material-icons" style={{ fontSize: 13 }}>favorite</span>
                                        Your Saved Outfits
                                    </span>
                                    <div style={{ flex: 1, height: '0.5px', background: 'var(--color-border)' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {savedOutfitsList.map((product, idx) => (
                                        <ProductCard
                                            key={product._id || idx}
                                            product={product}
                                            index={idx}
                                            savedIds={savedIds}
                                            onSave={toggleSave}
                                            onTryAR={() => navigateToTryOn(product, 'ar')}
                                            onTryAI={() => navigateToTryOn(product, 'cpvton')}
                                            bodyTypeLabel={bodyTypeLabel}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Upload Modal ─────────────────────────────────────── */}
                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 16 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)', borderRadius: 8, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
                            >
                                {/* Header */}
                                <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: 'var(--color-text)', margin: 0 }}>Upload Clothing</h3>
                                    <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 0 }}>
                                        <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                                    </button>
                                </div>
                                {/* Body */}
                                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <label style={{ display: 'block', cursor: 'pointer' }}>
                                        <div style={{ border: '1px dashed var(--color-border-light)', borderRadius: 6, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                        >
                                            {customOutfit.preview ? (
                                                <img src={customOutfit.preview} alt="Preview" style={{ height: 140, objectFit: 'contain', borderRadius: 4 }} />
                                            ) : (
                                                <>
                                                    <span className="material-icons" style={{ fontSize: 36, color: 'var(--color-dim)' }}>cloud_upload</span>
                                                    <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Click to upload clothing photo</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                    </label>
                                    <input
                                        type="text" placeholder="Item name (optional)"
                                        value={customOutfit.name}
                                        onChange={e => setCustomOutfit(p => ({ ...p, name: e.target.value }))}
                                        className="input"
                                        style={{ fontSize: 14 }}
                                    />
                                    <select
                                        value={customOutfit.category}
                                        onChange={e => setCustomOutfit(p => ({ ...p, category: e.target.value }))}
                                        className="input"
                                        style={{ fontSize: 14, cursor: 'pointer' }}
                                    >
                                        <option value="top">Top / Shirt</option>
                                        <option value="bottom">Bottom / Pants</option>
                                        <option value="dress">Dress</option>
                                        <option value="outerwear">Outerwear</option>
                                    </select>
                                </div>
                                {/* Footer */}
                                <div style={{ padding: '16px 24px', borderTop: '0.5px solid var(--color-border)', display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => navigateToTryOn({ _id: 'custom-' + Date.now(), name: customOutfit.name || 'Custom Piece', category: customOutfit.category, imageUrl: customOutfit.preview, price: { amount: 0 }, description: 'Custom uploaded item', isCustom: true }, 'ar')}
                                        disabled={!customOutfit.preview}
                                        className="btn btn-ghost"
                                        style={{ flex: 1, justifyContent: 'center', opacity: !customOutfit.preview ? 0.4 : 1 }}
                                    >
                                        Live AR
                                    </button>
                                    <button
                                        onClick={() => navigateToTryOn({ _id: 'custom-' + Date.now(), name: customOutfit.name || 'Custom Piece', category: customOutfit.category, imageUrl: customOutfit.preview, price: { amount: 0 }, description: 'Custom uploaded item', isCustom: true }, 'cpvton')}
                                        disabled={!customOutfit.preview}
                                        className="btn btn-primary"
                                        style={{ flex: 1, justifyContent: 'center', opacity: !customOutfit.preview ? 0.4 : 1 }}
                                    >
                                        AI Try-On
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

/* ── ProductCard ──────────────────────────────────────────────────────────── */
function ProductCard({ product, index, savedIds, onSave, onTryAR, onTryAI, bodyTypeLabel }) {
    const id = product._id || product.name;
    const isSaved = savedIds.has(id);
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            custom={index}
            variants={cardVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -3 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                background: 'var(--color-card)',
                border: `0.5px solid ${hovered ? 'var(--color-border-light)' : 'var(--color-border)'}`,
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
                    onError={e => e.target.src = 'https://via.placeholder.com/400x500?text=StyleSync'}
                />
                {/* Save button */}
                <button
                    onClick={() => onSave(product)}
                    style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 34, height: 34, borderRadius: '50%',
                        background: isSaved ? 'var(--color-accent)' : 'rgba(22,19,15,0.75)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        transition: 'background 0.2s',
                    }}
                >
                    <span className="material-icons" style={{ fontSize: 16, color: isSaved ? 'var(--color-bg)' : 'var(--color-text)' }}>
                        {isSaved ? 'favorite' : 'favorite_border'}
                    </span>
                </button>
                {/* Body type overlay */}
                {hovered && bodyTypeLabel && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(22,19,15,0.9), transparent)', padding: '20px 14px 10px' }}>
                        <p className="label" style={{ color: 'var(--color-accent)', margin: 0 }}>✦ {bodyTypeLabel} frame</p>
                    </div>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: '16px 16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span className="label" style={{ color: 'var(--color-muted)', marginBottom: 4 }}>StyleSync Pick</span>
                <h3 style={{ fontFamily: '"DM Sans"', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px', lineHeight: 1.3 }}>{product.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 600, margin: '0 0 8px' }}>
                    {product.price?.amount ? `$${product.price.amount}` : product.price || '—'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6, flex: 1, margin: '0 0 16px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.description}
                </p>
                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={onTryAI} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>auto_awesome</span>
                        AI Try-On
                    </button>
                    <button onClick={onTryAR} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>view_in_ar</span>
                        Live AR
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

/* ── WebSearchResults (renamed from BraveSearchResults) ───────────────────── */
function WebSearchResults({ searchResults, searchLoading, onUpload }) {
    if (searchLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--color-accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Searching the web…</span>
            </div>
        );
    }
    if (!searchResults) return null;

    const images = searchResults.images?.results || [];
    const links = searchResults.shopping?.results || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Info banner */}
            <div className="card-featured" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span className="material-icons" style={{ fontSize: 20, color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }}>info</span>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px' }}>
                        No exact collection match — curated web results below
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.65, margin: '0 0 14px' }}>
                        Browse the options, or upload a photo of clothing to try on using our AI.
                    </p>
                    <motion.button
                        onClick={onUpload}
                        className="btn btn-primary"
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                        style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <span className="material-icons" style={{ fontSize: 14 }}>add_a_photo</span>
                        Upload & Try On
                    </motion.button>
                </div>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
                <div>
                    <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Found Online</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {images.map((img, i) => img.isShopLink ? (
                            /* Fallback shop-link card — no image */
                            <motion.a
                                key={i}
                                href={img.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -2 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '28px 16px', minHeight: 140 }}
                            >
                                <span style={{ fontSize: 32 }}>{img.icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', textAlign: 'center' }}>{img.label}</span>
                                <span className="label" style={{ color: 'var(--color-accent)' }}>{img.searchTerm}</span>
                            </motion.a>
                        ) : (
                            /* Real image card */
                            <motion.a
                                key={i}
                                href={img.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -2 }}
                                style={{ display: 'block', textDecoration: 'none', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, overflow: 'hidden' }}
                            >
                                <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                                    <img src={img.imageUrl} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        onError={e => e.target.style.display = 'none'} />
                                </div>
                                <div style={{ padding: '10px 12px' }}>
                                    <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{img.title}</p>
                                    <p className="label" style={{ color: 'var(--color-accent)', marginTop: 4 }}>{img.searchTerm || img.sourcePage}</p>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            )}

            {/* Shopping links */}
            {links.length > 0 && (
                <div>
                    <span className="label-accent" style={{ display: 'block', marginBottom: 16 }}>Shopping Links</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                        {links.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: 16, textDecoration: 'none', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            >
                                <span className="material-icons" style={{ fontSize: 18, color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}>shopping_bag</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{link.title}</p>
                                    <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>{link.description}</p>
                                </div>
                                <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-dim)', flexShrink: 0 }}>open_in_new</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 && links.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <span className="material-icons" style={{ fontSize: 48, color: 'var(--color-dim)', display: 'block', marginBottom: 12 }}>search_off</span>
                    <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 20 }}>No results found. Try uploading your own clothing photo.</p>
                    <button onClick={onUpload} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className="material-icons" style={{ fontSize: 14 }}>add_a_photo</span>
                        Upload & Try On
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Local fallback Style DNA ─────────────────────────────────────────────── */
function getLocalFallbackDNA(bodyType, occasion, gender) {
    const rules = {
        hourglass: { summary: 'Your balanced proportions with a defined waist create the most versatile silhouette. You can wear both fitted and flowy styles effectively.', what_works: [{ item: 'Wrap dress', reason: 'Celebrates your natural waist definition' }, { item: 'Belted blazer', reason: 'Emphasises your hourglass shape in professional settings' }], what_to_avoid: [{ item: 'Shapeless shift dresses', reason: 'Hides your best feature' }], colors: { best: ['deep ruby', 'ivory', 'forest green'], occasion_note: `Classic tones work beautifully for ${occasion}.` }, fabrics_patterns: 'Structured fabrics like ponte and crepe maintain your shape. Wrap silhouettes in jersey work well for movement.', search_terms: ['wrap midi dress', 'belted blazer', 'high waist trousers'] },
        pear: { summary: 'Your wider hips create a grounded, feminine silhouette. The key is balanced proportions through structured tops.', what_works: [{ item: 'Structured blazer with shoulder detail', reason: 'Widens shoulders to balance hips' }, { item: 'Dark wide-leg trousers', reason: 'Streamlines lower body' }], what_to_avoid: [{ item: 'Low-rise jeans', reason: 'Emphasises hip width' }], colors: { best: ['navy', 'charcoal', 'burgundy'], occasion_note: `Deep tones for ${occasion} add sophisticated balance.` }, fabrics_patterns: 'Structured fabrics on top, fluid fabrics on the bottom.', search_terms: ['structured shoulder blazer', 'dark wide leg pants', 'a-line midi skirt'] },
        'inverted-triangle': { summary: 'Your broader shoulders and narrower hips create an athletic, powerful silhouette.', what_works: [{ item: 'V-neck tops', reason: 'Draw the eye inward to balance shoulders' }, { item: 'A-line skirts', reason: 'Add hip volume for balance' }], what_to_avoid: [{ item: 'Padded shoulder blazers', reason: 'Further broadens the shoulder line' }], colors: { best: ['cobalt', 'emerald', 'blush'], occasion_note: `Bold colors on the bottom shift focus downward for ${occasion}.` }, fabrics_patterns: 'Light fabrics on bottom to add visual volume.', search_terms: ['v neck blouse', 'a-line skirt', 'palazzo pants'] },
        rectangle: { summary: 'Your proportional frame is incredibly versatile and takes structure beautifully.', what_works: [{ item: 'Peplum tops', reason: 'Create hip flare and define the waistline' }, { item: 'Fit-and-flare dresses', reason: 'Add curves where there aren\'t naturally' }], what_to_avoid: [{ item: 'Straight-cut shift dresses', reason: 'Reinforces the rectangular silhouette' }], colors: { best: ['terracotta', 'sage', 'cream'], occasion_note: `Varied textures and colors create dimension for ${occasion}.` }, fabrics_patterns: 'Ruffles, pleats, and patterns add dimension.', search_terms: ['peplum top', 'fit and flare dress', 'belted wrap dress'] },
        apple: { summary: 'Your fuller midsection with narrower hips. Your legs are your strongest feature.', what_works: [{ item: 'Empire waist dress', reason: 'Falls below the bust, skims the midsection' }, { item: 'V-neck tops', reason: 'Create a vertical line that elongates the torso' }], what_to_avoid: [{ item: 'Clingy bodycon styles', reason: 'Emphasise the midsection' }], colors: { best: ['classic black', 'navy', 'deep plum'], occasion_note: `Monochrome looks are most elongating for ${occasion}.` }, fabrics_patterns: 'Vertical stripes and flowing fabrics elongate.', search_terms: ['empire waist dress', 'v-neck flowy blouse', 'straight leg trousers'] },
    };
    return rules[bodyType] || rules['rectangle'];
}
