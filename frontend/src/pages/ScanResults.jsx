import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * ScanResults — redirects to Recommendations page passing through
 * whatever scan state came from BodyScan.jsx.
 * If accessed without state (e.g. direct URL), redirects to /body-scan.
 */
export default function ScanResults() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const state = location.state;

        if (state && state.bodyType) {
            // Forward all scan data straight to Recommendations
            navigate('/recommendations', { state, replace: true });
        } else {
            // No scan data — send user to start a new scan
            navigate('/body-scan', { replace: true });
        }
    }, [navigate, location]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#C6A75E] border-t-transparent rounded-full animate-spin" />
                <p className="text-white/30 text-xs uppercase tracking-widest">Processing Results...</p>
            </div>
        </div>
    );
}
