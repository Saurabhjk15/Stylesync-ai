import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBodyScanResults } from '../redux/slices/userSlice';
import { calculateMeasurements, detectSkinTone, getBodyTypeInfo, averageLandmarks as averageLandmarksUtil } from '../utils/bodyTypeUtils';
// Imports removed - using CDN globals
// import { POSE_CONNECTIONS } from '@mediapipe/pose';
// import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export default function BodyScan() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Read onboarding data — if missing, redirect user to /onboarding first
    const onboarding = location.state || JSON.parse(localStorage.getItem('onboardingData') || 'null');

    // Gate: if there's no onboarding data at all, send them to onboarding
    useEffect(() => {
        if (!onboarding) {
            navigate('/onboarding', { replace: true });
        }
    }, []); // eslint-disable-line

    const { gender = 'female', height: heightCm, occasion: onboardingOccasion,
            waist: userWaist, hip: userHip, chest: userChest } = onboarding || {};


    const [cameraActive, setCameraActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [selectedOccasion, setSelectedOccasion] = useState(onboardingOccasion || 'casual');
    const [detectedSkinTone, setDetectedSkinTone] = useState('medium');
    const [stream, setStream] = useState(null);

    // Landmark accumulator — averages over 30 frames for accuracy
    const landmarkFrames = useRef([]);
    const MAX_FRAMES = 30;

    const poseRef = useRef(null);
    const animFrameRef = useRef(null);
    const landmarksRef = useRef(null);
    const streamRef = useRef(null);
    const [debugStatus, setDebugStatus] = useState("Ready to initialize.");
    const [autoCaptureTimer, setAutoCaptureTimer] = useState(null);
    const [showMlResult, setShowMlResult] = useState(true);
    const [clockTime, setClockTime] = useState(new Date().toLocaleTimeString());

    const addLog = (msg) => {
        console.log(msg);
        setDebugStatus(prev => `> ${msg}\n${prev.split("\n").slice(0, 8).join("\n")}`);
    };

    const occasions = [
        { id: 'casual', label: 'Casual', icon: 'checkroom' },
        { id: 'formal', label: 'Formal', icon: 'business_center' },
        { id: 'party', label: 'Party', icon: 'celebration' },
        { id: 'office', label: 'Office', icon: 'work' },
        { id: 'date', label: 'Date', icon: 'favorite' },
        { id: 'wedding', label: 'Wedding', icon: 'church' },
        { id: 'sporty', label: 'Sporty', icon: 'fitness_center' },
        { id: 'beach', label: 'Beach', icon: 'beach_access' },
    ];

    // Initialize MediaPipe Pose
    const initPose = useCallback(() => {
        if (poseRef.current) return poseRef.current;

        addLog("Loading MediaPipe Pose...");
        const Pose = window.Pose; // Access from global scope (CDN)
        if (!Pose) {
            setError("MediaPipe Pose library not loaded. Check internet connection.");
            return;
        }
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        let firstResult = true;
        pose.onResults((results) => {
            if (firstResult) {
                addLog("✨ VISUAL SYSTEM ONLINE");
                firstResult = false;
            }

            if (!canvasRef.current || !videoRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (videoRef.current.videoWidth === 0) return;

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

            if (results.poseLandmarks) {
                landmarksRef.current = results.poseLandmarks;

                // Accumulate landmark frames for averaging
                if (landmarkFrames.current.length < MAX_FRAMES) {
                    landmarkFrames.current.push(results.poseLandmarks);
                }

                const drawConnectors = window.drawConnectors;
                const drawLandmarks = window.drawLandmarks;
                const POSE_CONNECTIONS = window.POSE_CONNECTIONS;

                if (drawConnectors && POSE_CONNECTIONS) {
                    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
                        color: 'rgba(198, 167, 94, 0.6)', // Primary Gold
                        lineWidth: 2,
                    });
                }
                if (drawLandmarks) {
                    drawLandmarks(ctx, results.poseLandmarks, {
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            }
            ctx.restore();
        });

        poseRef.current = pose;
        return pose;
    }, []);

    // Stop Camera
    const stopCamera = useCallback((reason = "UNKNOWN") => {
        addLog(`🛑 TERMINATING SENSORS (Reason: ${reason})...`);
        if (autoCaptureTimer) {
            clearTimeout(autoCaptureTimer.timer);
            clearInterval(autoCaptureTimer.interval);
            setAutoCaptureTimer(null);
        }
        if (poseRef.current) {
            try { poseRef.current.close(); } catch (e) { }
            poseRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
        setStream(null);
        setCameraActive(false);
        setScanning(false);
        setScanProgress(0);
    }, [autoCaptureTimer]);

    const [scanProgress, setScanProgress] = useState(0);

    // Average pose landmarks across multiple frames to reduce jitter
    const averageLandmarks = (frames) => {
        if (!frames || frames.length === 0) return null;
        const numLandmarks = frames[0].length;
        return Array.from({ length: numLandmarks }, (_, i) => {
            let x = 0, y = 0, z = 0, visibility = 0;
            frames.forEach(frame => {
                x          += frame[i]?.x          || 0;
                y          += frame[i]?.y          || 0;
                z          += frame[i]?.z          || 0;
                visibility += frame[i]?.visibility || 0;
            });
            const n = frames.length;
            return { x: x / n, y: y / n, z: z / n, visibility: visibility / n };
        });
    };

    // Capture Logic
    const handleCapture = useCallback(() => {
        if (scanning) return; // Prevent double trigger
        setError(null);
        if (!landmarksRef.current) {
            // Only stop if we really mean to fail? Or just wait?
            // For now, let's just log and not stop, or wait for next frame.
            setError('NO SUBJECT DETECTED. ENSURE FULL TORSO VISIBILITY.');
            // stopCamera("No subject"); // Don't stop, let them try again?
            return;
        }

        setScanning(true);
        setCountdown(3);

        let count = 3;
        const timer = setInterval(async () => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                setCountdown(null);

                // Average landmarks over accumulated frames for stability
                const avgLandmarks = landmarkFrames.current.length > 0
                    ? averageLandmarksUtil(landmarkFrames.current)
                    : landmarksRef.current;

                const measurements = calculateMeasurements(avgLandmarks);
                if (!measurements) {
                    setError('POSE DETECTION FAILED — Ensure your full torso (shoulders to hips) is visible.');
                    setScanning(false);
                    return; // don't stop camera — let them reposition and try again
                }

                // Initialize variables
                let probabilities = null;
                let bodyType = 'rectangle';
                let matchConfidence = 0.75;
                let isMlResult = false;
                let skinTone = 'medium';
                let imageSrc = null;

                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                    skinTone = detectSkinTone(imageData, avgLandmarks);
                    imageSrc = canvasRef.current.toDataURL('image/jpeg', 0.8);
                }
                setDetectedSkinTone(skinTone);

                // Call upgraded ML API with full landmark data + onboarding measurements
                try {
                    addLog("UPLOADING BIOMETRIC DATA...");
                    const landmarkPayload = avgLandmarks.map(lm => ({
                        x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility || 0
                    }));

                    const response = await fetch('/api/ml/predict', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            landmarks: landmarkPayload,
                            image_height_px: canvasRef.current?.height || 480,
                            height_cm: heightCm || null,
                            gender: gender || 'female',
                            user_waist_cm: userWaist || null,
                            user_hip_cm: userHip || null,
                            user_chest_cm: userChest || null,
                            image: imageSrc // CNN fallback
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        bodyType = data.body_type;
                        matchConfidence = data.confidence || 0.80;
                        probabilities = data.all_predictions || null;
                        isMlResult = true;
                        addLog(`LANDMARK INFERENCE: ${data.body_type.toUpperCase()} (${Math.round(matchConfidence * 100)}%) via ${data.method || 'landmark'}`);
                    }
                } catch (err) {
                    // Fallback to client-side rule-based classification
                    const { classifyBodyType } = await import('../utils/bodyTypeUtils');
                    bodyType = classifyBodyType(measurements);
                    matchConfidence = 0.72;
                    addLog(`LOCAL FALLBACK: ${bodyType.toUpperCase()} (72%)`);
                }

                const result = {
                    measurements,
                    bodyType,
                    ruleBasedType: bodyType,
                    bodyTypeInfo: getBodyTypeInfo(bodyType, selectedOccasion, measurements),
                    skinTone,
                    occasion: selectedOccasion,
                    confidence: matchConfidence,
                    isMlResult,
                    probabilities,
                    // Pass onboarding data to recommendations
                    gender,
                    heightCm,
                    userWaist,
                    userHip,
                    userChest,
                };

                setScanResult(result);
                dispatch(setBodyScanResults({ measurements, bodyType }));
                setScanning(false);
                stopCamera("SCAN SUCCESS");
            }
        }, 1000);
    }, [selectedOccasion, dispatch, stopCamera]);

    // Start Camera & Auto-Capture Timer
    const startCamera = useCallback(async () => {
        try {
            setError(null);
            setScanProgress(0);
            addLog("INITIALIZING OPTICAL SENSORS...");
            initPose();
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
            });
            addLog("VIDEO FEED SECURED");
            streamRef.current = mediaStream;
            setStream(mediaStream);
            setCameraActive(true);

            // Start 40s Analysis Timer
            addLog("INITIATING 40s BIOMETRIC SCAN SEQUENCE...");
            let progress = 0;
            const interval = setInterval(() => {
                progress += (100 / 400); // 40 seconds * 10 increments/sec
                setScanProgress(Math.min(progress, 100));
            }, 100);

            const timer = setTimeout(() => {
                clearInterval(interval);
                addLog("SCAN COMPLETE. PROCESSING DATA...");
                handleCapture();
            }, 40000);

            setAutoCaptureTimer({ timer, interval });

        } catch (err) {
            setError('Optical Sensor Failure: Permission Denied');
            addLog(`ERROR: ${err.message}`);
        }
    }, [initPose, handleCapture]); // Added handleCapture dependency

    // Live clock
    useEffect(() => {
        const tick = setInterval(() => setClockTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(tick);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (poseRef.current) poseRef.current.close();
        };
    }, []);

    // Loop
    useEffect(() => {
        let animationFrameId;
        if (cameraActive && stream && videoRef.current && poseRef.current) {
            const detectLoop = async () => {
                if (cameraActive && videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
                    try {
                        await poseRef.current.send({ image: videoRef.current });
                    } catch (e) {
                        addLog(`POSE SEND ERROR: ${e.message}`);
                    }
                }
                animationFrameId = requestAnimationFrame(detectLoop);
            };
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => detectLoop()).catch(() => { });
        }
        return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
    }, [cameraActive, stream]);



    const goToRecommendations = () => {
        const scanState = {
            bodyType:     scanResult.bodyType,
            skinTone:     detectedSkinTone,
            occasion:     selectedOccasion,
            gender,
            heightCm,
            measurements: scanResult.measurements,
            confidence:   scanResult.confidence,
            userWaist,
            userHip,
            userChest,
        };
        // Persist so Stylist tab always shows THIS scan's data (not defaults)
        try {
            localStorage.setItem('ss_scan_state', JSON.stringify(scanState));
            // Invalidate old recommendation cache so Groq re-runs for this scan
            localStorage.removeItem('ss_recommendations');
        } catch {}
        navigate('/recommendations', { state: scanState });
    };

    return (
        <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: '"DM Sans", sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 'var(--navbar-height)' }}>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar - Occasions */}
                <aside style={{ width: 88, borderRight: '0.5px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 20, background: 'var(--color-surface)', overflowY: 'auto', zIndex: 40 }} className="hidden md:flex">
                    {occasions.map((occ) => (
                        <button key={occ.id} onClick={() => !scanning && setSelectedOccasion(occ.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: '4px 8px' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: selectedOccasion === occ.id ? '1.5px solid var(--color-accent)' : '0.5px solid var(--color-border-light)', background: selectedOccasion === occ.id ? 'var(--color-accent-dim)' : 'transparent', transition: 'all 0.2s' }}>
                                <span className="material-icons" style={{ fontSize: 20, color: selectedOccasion === occ.id ? 'var(--color-accent)' : 'var(--color-muted)' }}>{occ.icon}</span>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: selectedOccasion === occ.id ? 'var(--color-accent)' : 'var(--color-dim)' }}>{occ.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Center Viewport */}
                <section style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', padding: '16px', background: 'var(--color-bg)', overflow: 'hidden' }}>
                    <div style={{ flex: 1, borderRadius: 8, border: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#000', overflow: 'hidden' }}>

                        {/* Start Screen */}
                        {!cameraActive && !scanResult && (
                            <div style={{ position: 'relative', zIndex: 20, textAlign: 'center', padding: 32, maxWidth: 400 }}>
                                <span className="material-icons" style={{ fontSize: 56, color: 'var(--color-dim)', display: 'block', marginBottom: 20 }}>sensors</span>
                                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', margin: '0 0 12px' }}>Body Scan</h2>
                                <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 28 }}>
                                    Use your camera to analyze your body type and get personalized clothing recommendations. Ensure good lighting for best results.
                                </p>
                                <button
                                    onClick={startCamera}
                                    className="btn btn-primary"
                                    style={{ fontSize: 12 }}
                                >
                                    Start Camera
                                </button>
                                {/* Demo Mode Link */}
                                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '0.5px solid var(--color-border)' }}>
                                    <p className="label" style={{ marginBottom: 10, textAlign: 'center' }}>Dev bypass</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
                                        {['hourglass', 'rectangle', 'inverted-triangle'].map(type => (
                                            <button key={type} onClick={() => {
                                                setScanResult({
                                                    measurements: { shoulderToHipRatio: 1.0 },
                                                    bodyType: type,
                                                    bodyTypeInfo: getBodyTypeInfo(type),
                                                    skinTone: 'medium',
                                                    occasion: selectedOccasion,
                                                    isMlResult: false,
                                                    confidence: 0
                                                });
                                            }} style={{ padding: '4px 10px', background: 'var(--color-surface)', fontSize: 9, borderRadius: 4, color: 'var(--color-muted)', textTransform: 'uppercase', border: '0.5px solid var(--color-border-light)', cursor: 'pointer', letterSpacing: '0.1em' }}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Camera Active */}
                        <div className={`absolute inset-0 ${cameraActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
                            <video ref={videoRef} className="hidden" playsInline muted />
                            <canvas ref={canvasRef} className="w-full h-full object-cover" />

                            {/* Overlays */}
                            {cameraActive && !scanResult && (
                                <>
                                    <div className="scan-line absolute w-full z-20 animate-scan"></div>
                                    <div className="absolute inset-0 pointer-events-none border-[20px] border-primary/5"></div>

                                    {/* Corners — clean white precision marks */}
                                    <div style={{ position: 'absolute', top: 24, left: 24, width: 48, height: 48, borderTop: '1px solid rgba(255,255,255,0.35)', borderLeft: '1px solid rgba(255,255,255,0.35)' }} />
                                    <div style={{ position: 'absolute', top: 24, right: 24, width: 48, height: 48, borderTop: '1px solid rgba(255,255,255,0.35)', borderRight: '1px solid rgba(255,255,255,0.35)' }} />
                                    <div style={{ position: 'absolute', bottom: 24, left: 24, width: 48, height: 48, borderBottom: '1px solid rgba(255,255,255,0.35)', borderLeft: '1px solid rgba(255,255,255,0.35)' }} />
                                    <div style={{ position: 'absolute', bottom: 24, right: 24, width: 48, height: 48, borderBottom: '1px solid rgba(255,255,255,0.35)', borderRight: '1px solid rgba(255,255,255,0.35)' }} />

                                    {/* Scan Progress Bar */}
                                    <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 200, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                                        <div
                                            style={{ width: `${scanProgress}%`, height: '100%', background: 'var(--color-accent)', transition: 'width 0.1s linear' }}
                                        />
                                    </div>
                                    <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                                        Analyzing {Math.round(scanProgress)}%
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Results View */}
                        {scanResult && (
                            <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(22,19,15,0.92)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                                <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', position: 'relative' }}>
                                    {/* Toggle switch */}
                                    {scanResult.isMlResult && (
                                        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span className="label" style={{ color: !showMlResult ? 'var(--color-text)' : 'var(--color-dim)' }}>Standard</span>
                                            <button
                                                onClick={() => setShowMlResult(!showMlResult)}
                                                style={{ width: 44, height: 24, borderRadius: 12, padding: 3, background: showMlResult ? 'var(--color-accent)' : 'var(--color-border-light)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                                            >
                                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', transform: showMlResult ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                                            </button>
                                            <span className="label" style={{ color: showMlResult ? 'var(--color-accent)' : 'var(--color-dim)' }}>AI Enhanced</span>
                                        </div>
                                    )}

                                    {/* Emoji badge */}
                                    <div style={{ display: 'inline-flex', marginBottom: 20, padding: 16, borderRadius: '50%', border: '0.5px solid var(--color-accent-border)', background: 'var(--color-accent-dim)', position: 'relative' }}>
                                        <span style={{ fontSize: 52 }}>{scanResult.bodyTypeInfo?.emoji}</span>
                                        {showMlResult && scanResult.isMlResult && (
                                            <span className="tag tag-accent" style={{ position: 'absolute', bottom: -8, right: -8, fontSize: 8 }}>AI</span>
                                        )}
                                    </div>

                                    <span className="label-accent" style={{ display: 'block', marginBottom: 10 }}>Analysis Complete</span>
                                    <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--color-text)', margin: '0 0 12px', textTransform: 'capitalize' }}>
                                        {showMlResult && scanResult.isMlResult ? scanResult.bodyType : scanResult.ruleBasedType || scanResult.bodyType}
                                        <span style={{ fontStyle: 'normal', color: 'var(--color-muted)', fontWeight: 300 }}> Archetype</span>
                                    </h2>
                                    <p style={{ fontSize: 15, color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: 24, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                                        {scanResult.bodyTypeInfo?.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 320, margin: '0 auto 24px' }}>
                                        <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
                                            <div className="label" style={{ marginBottom: 6 }}>Confidence</div>
                                            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 400, color: 'var(--color-accent)' }}>
                                                {`${Math.round(scanResult.confidence * 100)}%`}
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
                                            <div className="label" style={{ marginBottom: 6 }}>Ratio</div>
                                            <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28, fontWeight: 400, color: 'var(--color-text)' }}>{scanResult.measurements.shoulderToHipRatio}</div>
                                        </div>
                                    </div>

                                    {/* Probability bars */}
                                    {showMlResult && scanResult.probabilities && (
                                        <div style={{ maxWidth: 400, margin: '0 auto 24px', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '16px 20px' }}>
                                            <p className="label" style={{ marginBottom: 12, textAlign: 'left' }}>Confidence distribution</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {Object.entries(scanResult.probabilities).sort(([, a], [, b]) => b - a).map(([type, prob]) => (
                                                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', width: 80, textAlign: 'right' }}>{type}</span>
                                                        <div style={{ flex: 1, height: 2, background: 'var(--color-border)', borderRadius: 1, overflow: 'hidden' }}>
                                                            <div style={{ width: `${prob * 100}%`, height: '100%', background: 'var(--color-accent)' }} />
                                                        </div>
                                                        <span style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 700, width: 28, textAlign: 'right' }}>{Math.round(prob * 100)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                        <button onClick={goToRecommendations} className="btn btn-primary" style={{ fontSize: 11 }}>
                                            <span className="material-icons" style={{ fontSize: 15 }}>auto_awesome</span>
                                            View Recommendations
                                        </button>
                                        <button onClick={() => { setScanResult(null); startCamera(); }} className="btn btn-ghost" style={{ fontSize: 11 }}>
                                            Rescan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Countdown */}
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
                                <span className="text-9xl font-bold text-primary animate-ping font-luxury">{countdown}</span>
                            </div>
                        )}

                        {/* Error Modal */}
                        {error && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-sm text-center backdrop-blur-xl">
                                <div className="text-2xl mb-2">⚠️</div>
                                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 text-[10px] border border-white/20 px-4 py-2 hover:bg-white/10">DISMISS</button>
                            </div>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <div style={{ height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {!scanResult && cameraActive && (
                            <button
                                onClick={handleCapture}
                                disabled={scanning}
                                className="btn btn-primary"
                                style={{ fontSize: 12, opacity: scanning ? 0.6 : 1, cursor: scanning ? 'not-allowed' : 'pointer' }}
                            >
                                <span className="material-icons" style={{ fontSize: 17 }}>shutter_speed</span>
                                {scanning ? 'Processing…' : 'Capture & Analyze'}
                            </button>
                        )}
                    </div>
                </section>

                {/* Right Sidebar - Telemetry */}
                <aside style={{ width: 280, borderLeft: '0.5px solid var(--color-border)', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--color-surface)', overflowY: 'auto' }} className="hidden xl:flex">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="label-accent">AI Telemetry</span>
                        <span className="material-icons" style={{ fontSize: 16, color: 'var(--color-muted)' }}>analytics</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span className="label">Protocol</span>
                                <span className="label">{clockTime}</span>
                            </div>
                            <div style={{ padding: '12px 14px', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, fontSize: 10, lineHeight: 1.6, color: 'var(--color-muted)', height: 160, overflowY: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                                {debugStatus}
                            </div>
                        </div>

                        {scanResult && (
                            <>
                                {/* Measurements Card */}
                                <div style={{ background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 6, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-accent)' }}>straighten</span>
                                        <span className="label">Scan Measurements</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {[
                                            { label: 'Shoulder Width', value: scanResult.measurements?.shoulderCm ? `${scanResult.measurements.shoulderCm} cm` : '—' },
                                            { label: 'Hip Width',      value: scanResult.measurements?.hipCm      ? `${scanResult.measurements.hipCm} cm`      : scanResult.measurements?.hipsEstimated ? 'estimated' : '—' },
                                            { label: 'Sh:Hip Ratio',   value: scanResult.measurements?.shoulderToHipRatio || '—' },
                                            { label: 'Body Type',      value: scanResult.bodyType || '—' },
                                            { label: 'Confidence',     value: `${Math.round((scanResult.confidence || 0) * 100)}%` },
                                        ].map(({ label, value }) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                                                <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Groq CTA */}
                                <div style={{ background: 'rgba(200,169,126,0.07)', border: '0.5px solid var(--color-accent-border)', borderRadius: 6, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--color-accent)' }}>auto_awesome</span>
                                        <span className="label-accent" style={{ fontSize: 10 }}>AI Ready</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>
                                        Groq AI will use your scan data to generate a personalized Style DNA — outfit picks, color palette, and fit recommendations.
                                    </p>
                                    <button
                                        onClick={goToRecommendations}
                                        className="btn btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', fontSize: 10 }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 13 }}>auto_awesome</span>
                                        Get AI Recommendations
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="label">Status</span>
                            <span className="label" style={{ color: 'var(--color-ok)' }}>Optimal</span>
                        </div>
                        <div style={{ width: '100%', height: 2, background: 'var(--color-border)', borderRadius: 1, overflow: 'hidden' }}>
                            <div style={{ width: '99%', height: '100%', background: 'var(--color-ok)' }} />
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
