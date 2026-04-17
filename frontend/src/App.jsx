import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import BodyScan from './pages/BodyScan';
import Onboarding from './pages/Onboarding';
import ScanResults from './pages/ScanResults';
import Recommendations from './pages/Recommendations';
import ARTryOn from './pages/ARTryOn';
import CPVTONTryOn from './pages/CPVTONTryOn';
import SavedOutfits from './pages/SavedOutfits';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import About from './pages/About';
import Trends from './pages/Trends';
import ArticleDetail from './pages/ArticleDetail';
import Security from './pages/Security';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

/** Pages where Navbar/Footer should NOT appear */
const NO_CHROME = ['/ar-tryon', '/cpvton-tryon', '/onboarding', '/login', '/signup'];

/** Framer Motion page wrapper */
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

function Layout() {
    const location = useLocation();
    const hideChrome = NO_CHROME.includes(location.pathname);

    return (
        <>
            {!hideChrome && <Navbar />}
            <main className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        {/* ── Public ── */}
                        <Route path="/"              element={<PageTransition><Home /></PageTransition>} />
                        <Route path="/login"         element={<PageTransition><Login /></PageTransition>} />
                        <Route path="/signup"        element={<PageTransition><Signup /></PageTransition>} />
                        <Route path="/recommendations" element={<PageTransition><Recommendations /></PageTransition>} />
                        <Route path="/saved-outfits" element={<PageTransition><SavedOutfits /></PageTransition>} />
                        <Route path="/contact"       element={<PageTransition><Contact /></PageTransition>} />
                        <Route path="/about"         element={<PageTransition><About /></PageTransition>} />
                        <Route path="/trends"        element={<PageTransition><Trends /></PageTransition>} />
                        <Route path="/trends/:slug"  element={<PageTransition><ArticleDetail /></PageTransition>} />
                        <Route path="/security"      element={<PageTransition><Security /></PageTransition>} />
                        <Route path="/terms"         element={<PageTransition><Terms /></PageTransition>} />
                        <Route path="/privacy"       element={<PageTransition><Privacy /></PageTransition>} />

                        {/* ── Protected ── */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/profile-setup" element={<PageTransition><ProfileSetup /></PageTransition>} />
                            <Route path="/profile"       element={<PageTransition><Profile /></PageTransition>} />
                            <Route path="/onboarding"    element={<Onboarding />} />
                            <Route path="/body-scan"     element={<PageTransition><BodyScan /></PageTransition>} />
                            <Route path="/body scan"     element={<Navigate to="/onboarding" replace />} />
                            <Route path="/scan-results"  element={<ScanResults />} />
                            <Route path="/ar-tryon"      element={<ARTryOn />} />
                            <Route path="/ar tryon"      element={<Navigate to="/ar-tryon" replace />} />
                            <Route path="/cpvton-tryon"  element={<CPVTONTryOn />} />
                        </Route>

                        {/* ── 404 ── */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AnimatePresence>
            </main>
            {!hideChrome && <Footer />}
        </>
    );
}

function App() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '0.5px solid var(--color-border-light)',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '14px',
                        borderRadius: '6px',
                    }
                }}
            />
            <Layout />
        </div>
    );
}

export default App;
