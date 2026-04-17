import { useEffect, useState } from 'react';

/**
 * SplashScreen
 * Phase 1 (0 – 1800ms): Full-screen overlay, centered logo + bouncing dots
 * Phase 2 (1800 – 2600ms): Logo scales down & rises, overlay fades out → reveals the site behind
 * Phase 3 (2600ms+): Removed from DOM
 */
export default function SplashScreen({ onComplete }) {
    const [phase, setPhase] = useState('show'); // 'show' | 'fly' | 'done'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('fly'),  1800);
        const t2 = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 2600);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onComplete]);

    if (phase === 'done') return null;

    const flying = phase === 'fly';

    return (
        /* ── Dark overlay ── */
        <div className="splash-overlay" style={{ opacity: flying ? 0 : 1 }}>

            {/* ── Animated logo block ── */}
            <div className="splash-logo-wrap" style={{
                transform: flying
                    ? 'translate(-50%, -60%) scale(0.55)'
                    : 'translate(-50%, -50%) scale(1)',
                opacity: flying ? 0 : 1,
            }}>
                {/* Icon circle */}
                <div className="splash-icon-circle">
                    <span className="material-icons splash-icon">diamond</span>
                </div>

                {/* Text */}
                <div className="splash-text-wrap">
                    <div className="splash-brand">
                        Style<span className="splash-brand-accent">Sync</span>
                    </div>
                    <div className="splash-tagline">Luxury AI</div>
                </div>
            </div>

            {/* ── Bouncing dots ── */}
            <div className="splash-dots" style={{ opacity: flying ? 0 : 1 }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="splash-dot"
                        style={{ animationDelay: `${i * 0.18}s` }}
                    />
                ))}
            </div>
        </div>
    );
}
