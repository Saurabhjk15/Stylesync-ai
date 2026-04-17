import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProfileSetup — redirects authenticated users to full Profile page.
 * Unauthenticated users are redirected to login.
 * Kept as a named route so any deep-link to /profile-setup works gracefully.
 */
export default function ProfileSetup() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated) {
            // Go to full profile page
            navigate('/profile', { replace: true });
        } else {
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Minimal loading state while redirect is happening
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#C6A75E] border-t-transparent rounded-full animate-spin" />
                <p className="text-white/30 text-xs uppercase tracking-widest">Redirecting...</p>
            </div>
        </div>
    );
}
