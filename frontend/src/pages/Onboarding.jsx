import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['profile', 'measurements', 'photos'];

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const [gender, setGender] = useState('');
    const [height, setHeight] = useState(165);
    const [occasion, setOccasion] = useState('');

    const [waist, setWaist] = useState('');
    const [hip, setHip] = useState('');
    const [chest, setChest] = useState('');

    const [frontPhoto, setFrontPhoto] = useState(null);
    const [sidePhoto, setSidePhoto] = useState(null);

    const occasions = [
        { id: 'casual',      label: 'Casual',      icon: 'checkroom' },
        { id: 'formal',      label: 'Formal',      icon: 'business_center' },
        { id: 'party',       label: 'Party',       icon: 'celebration' },
        { id: 'office',      label: 'Office',      icon: 'work' },
        { id: 'date',        label: 'Date Night',  icon: 'favorite' },
        { id: 'wedding',     label: 'Wedding',     icon: 'church' },
        { id: 'traditional', label: 'Traditional', icon: 'auto_awesome' },
        { id: 'sporty',      label: 'Sporty',      icon: 'fitness_center' },
    ];

    const canProceedStep0 = gender && occasion;

    const handlePhotoUpload = (type, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'front') setFrontPhoto(reader.result);
            else setSidePhoto(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleContinue = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            const onboardingData = {
                gender, height, occasion,
                waist: waist ? parseInt(waist) : null,
                hip: hip ? parseInt(hip) : null,
                chest: chest ? parseInt(chest) : null,
                frontPhoto, sidePhoto,
            };
            localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
            navigate('/body-scan', { state: onboardingData });
        }
    };

    const accuracyBoost = () => {
        let base = 70 + 15;
        if (waist) base += 8;
        if (hip) base += 5;
        if (chest) base += 4;
        if (frontPhoto) base += 5;
        if (sidePhoto) base += 3;
        return Math.min(base, 96);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: 'center', marginBottom: 32 }}
            >
                <span className="label-accent" style={{ display: 'block', marginBottom: 8 }}>StyleSync AI</span>
                <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, fontStyle: 'italic', color: 'var(--color-text)', margin: '0 0 8px' }}>
                    Your Style DNA
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>A few details for precision recommendations</p>
            </motion.div>

            {/* Step indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700,
                            background: i <= step ? 'var(--color-accent)' : 'var(--color-surface)',
                            border: i <= step ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border-light)',
                            color: i <= step ? 'var(--color-bg)' : 'var(--color-dim)',
                            transition: 'all 0.3s',
                        }}>
                            {i < step ? <span className="material-icons" style={{ fontSize: 14 }}>check</span> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{ width: 40, height: '0.5px', background: i < step ? 'var(--color-accent)' : 'var(--color-border)' }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Accuracy badge */}
            <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)', borderRadius: 40, padding: '8px 18px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulseRing 2s ease-in-out infinite' }} />
                <span className="label">Predicted Scan Accuracy</span>
                <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--color-accent)' }}>{accuracyBoost()}%</span>
            </div>

            {/* ── Step pannels ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', maxWidth: 480 }}
                >

                {/* STEP 0 — Profile */}
                {step === 0 && (
                    <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border-light)', borderRadius: 8, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
                        {/* Gender */}
                        <div>
                            <span className="label" style={{ display: 'block', marginBottom: 12 }}>I'm shopping for</span>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {[
                                    { id: 'male',   label: 'Male',   icon: 'man' },
                                    { id: 'female', label: 'Female', icon: 'woman' },
                                    { id: 'unisex', label: 'Unisex', icon: 'people' },
                                ].map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGender(g.id)}
                                        style={{
                                            flex: 1, padding: '16px 8px', borderRadius: 6,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                            background: gender === g.id ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                                            border: gender === g.id ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border-light)',
                                            color: gender === g.id ? 'var(--color-accent)' : 'var(--color-muted)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 24 }}>{g.icon}</span>
                                        <span className="label" style={{ color: 'inherit' }}>{g.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Height slider */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span className="label">Height</span>
                                <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{height} cm</span>
                            </div>
                            <input
                                type="range" min={140} max={210} value={height}
                                onChange={e => setHeight(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <span className="label">140 cm</span>
                                <span className="label">210 cm</span>
                            </div>
                        </div>

                        {/* Occasion */}
                        <div>
                            <span className="label" style={{ display: 'block', marginBottom: 12 }}>Occasion</span>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                {occasions.map(occ => (
                                    <button
                                        key={occ.id}
                                        onClick={() => setOccasion(occ.id)}
                                        style={{
                                            padding: '12px 6px', borderRadius: 6,
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                            background: occasion === occ.id ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                                            border: occasion === occ.id ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border)',
                                            color: occasion === occ.id ? 'var(--color-accent)' : 'var(--color-muted)',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 18 }}>{occ.icon}</span>
                                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.2, color: 'inherit' }}>{occ.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            onClick={handleContinue}
                            disabled={!canProceedStep0}
                            className="btn btn-primary"
                            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                            style={{ width: '100%', justifyContent: 'center', opacity: !canProceedStep0 ? 0.4 : 1, cursor: !canProceedStep0 ? 'not-allowed' : 'pointer', fontSize: 12 }}
                        >
                            Continue →
                        </motion.button>
                    </div>
                )}

                {/* STEP 1 — Optional Measurements */}
                {step === 1 && (
                    <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border-light)', borderRadius: 8, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ textAlign: 'center' }}>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 6 }}>Optional — but recommended</span>
                            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 8px' }}>Add Your Measurements</h2>
                            <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>Each measurement improves classification accuracy</p>
                        </div>

                        {[
                            { label: 'Waist',       key: 'waist', value: waist, setter: setWaist, boost: '+8%' },
                            { label: 'Hips',        key: 'hip',   value: hip,   setter: setHip,   boost: '+5%' },
                            { label: 'Chest / Bust',key: 'chest', value: chest, setter: setChest, boost: '+4%' },
                        ].map(field => (
                            <div key={field.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <label className="label" htmlFor={field.key}>{field.label}</label>
                                    <span className="label" style={{ color: 'var(--color-accent)' }}>{field.boost} accuracy</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface)', border: '0.5px solid var(--color-border-light)', borderRadius: 6, overflow: 'hidden', transition: 'border-color 0.2s' }}
                                    onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                    onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--color-border-light)'}
                                >
                                    <input
                                        id={field.key}
                                        type="number"
                                        placeholder="e.g. 72"
                                        value={field.value}
                                        onChange={e => field.setter(e.target.value)}
                                        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '12px 16px', fontSize: 15, color: 'var(--color-text)' }}
                                    />
                                    <span style={{ padding: '0 14px', fontSize: 13, color: 'var(--color-muted)', flexShrink: 0 }}>cm</span>
                                </div>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                            <motion.button onClick={() => setStep(s => s - 1)} className="btn btn-ghost" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>← Back</motion.button>
                            <motion.button onClick={handleContinue} className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
                                {waist || hip || chest ? 'Continue →' : 'Skip →'}
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* STEP 2 — Optional Photos */}
                {step === 2 && (
                    <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border-light)', borderRadius: 8, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ textAlign: 'center' }}>
                            <span className="label-accent" style={{ display: 'block', marginBottom: 6 }}>Optional — highest accuracy</span>
                            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 8px' }}>Reference Photos</h2>
                            <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>Upload front and side photos for up to 95% accuracy</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {[
                                { label: 'Front View', key: 'front', photo: frontPhoto, boost: '+5%' },
                                { label: 'Side View',  key: 'side',  photo: sidePhoto,  boost: '+3%' },
                            ].map(p => (
                                <label key={p.key} style={{ position: 'relative', cursor: 'pointer', aspectRatio: '3/4', borderRadius: 6, border: p.photo ? '1.5px solid var(--color-accent)' : '1px dashed var(--color-border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden', background: 'var(--color-surface)', transition: 'border-color 0.2s' }}
                                    onMouseEnter={e => { if (!p.photo) e.currentTarget.style.borderColor = 'var(--color-muted)'; }}
                                    onMouseLeave={e => { if (!p.photo) e.currentTarget.style.borderColor = 'var(--color-border-light)'; }}
                                >
                                    {p.photo ? (
                                        <img src={p.photo} alt={p.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
                                    ) : (
                                        <>
                                            <span className="material-icons" style={{ fontSize: 28, color: 'var(--color-dim)' }}>add_a_photo</span>
                                            <span className="label">{p.label}</span>
                                        </>
                                    )}
                                    <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: p.photo ? 'var(--color-accent)' : 'var(--color-tag)', color: p.photo ? 'var(--color-bg)' : 'var(--color-muted)' }}>
                                        {p.photo ? '✓ Added' : p.boost}
                                    </div>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handlePhotoUpload(p.key, e)} />
                                </label>
                            ))}
                        </div>

                        {/* Privacy notice */}
                        <div style={{ background: 'var(--color-surface)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-accent)', flexShrink: 0, marginTop: 1 }}>info</span>
                            <p style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                                Photos are processed locally and never stored. Stand straight in fitted clothing with full torso visible.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <motion.button onClick={() => setStep(s => s - 1)} className="btn btn-ghost" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>← Back</motion.button>
                            <motion.button onClick={handleContinue} className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
                                <span className="material-icons" style={{ fontSize: 14 }}>sensors</span>
                                Start Body Scan →
                            </motion.button>
                        </div>
                    </div>
                )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
