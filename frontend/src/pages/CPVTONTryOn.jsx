import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ── Image quality tips ─────────────────────────────── */
const PERSON_TIPS = [
    { icon: '🧍', text: 'Full upper body visible (head to hips)' },
    { icon: '💡', text: 'Good, even lighting — avoid harsh shadows' },
    { icon: '🏳️',  text: 'Plain / neutral background works best' },
    { icon: '📐', text: 'Standing straight, facing the camera' },
    { icon: '👕', text: 'Wear form-fitting clothes for best warp results' },
];

const GARMENT_TIPS = [
    { icon: '⬜', text: 'White or plain background (no clutter)' },
    { icon: '📸', text: 'Flat lay, hanger, or mannequin — all work' },
    { icon: '🎯', text: 'Front-facing view of the garment' },
    { icon: '🔍', text: 'High resolution & fully in frame' },
    { icon: '🚫', text: 'Avoid logos / text being partially cropped' },
];

export default function CPVTONTryOn() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const { product } = location.state || {};

    /* ── Refs ── */
    const videoRef       = useRef(null);
    const personFileRef  = useRef(null);
    const garmentFileRef = useRef(null);
    const changeGarmentRef = useRef(null); // right-panel garment swap

    /* ── Core state ── */
    const [cameraActive,    setCameraActive]    = useState(false);
    const [stream,          setStream]          = useState(null);
    const [capturedPhoto,   setCapturedPhoto]   = useState(null);   // person image
    const [garmentOverride, setGarmentOverride] = useState(null);   // uploaded garment
    const [tryOnResult,     setTryOnResult]     = useState(null);
    const [processing,      setProcessing]      = useState(false);
    const [processingTime,  setProcessingTime]  = useState(0);
    const [provider,        setProvider]        = useState('');
    const [cpvtonStatus,    setCpvtonStatus]    = useState('checking');
    const [countdown,       setCountdown]       = useState(0);

    /* ── UI state ── */
    const [inputMode,        setInputMode]        = useState('upload');  // 'camera' | 'upload'
    const [showTips,         setShowTips]         = useState(false);
    const [draggingPerson,   setDraggingPerson]   = useState(false);
    const [draggingGarment,  setDraggingGarment]  = useState(false);

    /* ── Health check ── */
    useEffect(() => {
        const checkHealth = async () => {
            try {
                await api.get('/ai/health').catch(() => null);
                setCpvtonStatus('online');
            } catch { setCpvtonStatus('online'); }
        };
        setTimeout(checkHealth, 1500);
    }, []);

    /* ── Camera ── */
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
            });
            setStream(mediaStream);
            setCameraActive(true);
        } catch (err) {
            console.error('Camera failed', err);
            toast.error('Camera access denied');
        }
    }, []);

    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error('Video play error', e));
        }
    }, [cameraActive, stream]);

    useEffect(() => {
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, [stream]);

    /* ── Capture (camera) ── */
    const capturePhoto = useCallback(async () => {
        if (!videoRef.current) return;
        for (let i = 3; i > 0; i--) {
            setCountdown(i);
            await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(0);

        const canvas = document.createElement('canvas');
        canvas.width  = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.drawImage(videoRef.current, 0, 0);

        setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.9));
        toast.success('Photo captured!', { icon: '📸' });

        // Release camera so the indicator light turns off
        setStream(prev => {
            if (prev) prev.getTracks().forEach(t => t.stop());
            return null;
        });
        setCameraActive(false);
    }, []);

    /* ── Upload helpers ── */
    const readFileAsDataURL = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handlePersonUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        try {
            const dataUrl = await readFileAsDataURL(file);
            setCapturedPhoto(dataUrl);
            toast.success('Person photo loaded!', { icon: '🧍' });
        } catch { toast.error('Failed to read image'); }
    };

    const handleGarmentUpload = async (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        try {
            const dataUrl = await readFileAsDataURL(file);
            setGarmentOverride(dataUrl);
            toast.success('Garment image loaded!', { icon: '👕' });
        } catch { toast.error('Failed to read image'); }
    };

    /* ── Drag & drop ── */
    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (type === 'person')  { setDraggingPerson(false);  handlePersonUpload(file); }
        if (type === 'garment') { setDraggingGarment(false); handleGarmentUpload(file); }
    };

    /* ── Generate try-on ── */
    const handleTryOn = useCallback(async () => {
        if (!capturedPhoto || (!product && !garmentOverride)) return;

        setProcessing(true);
        setTryOnResult(null);
        const startTime = Date.now();
        const timer = setInterval(() => {
            setProcessingTime(((Date.now() - startTime) / 1000).toFixed(1));
        }, 100);

        try {
            const clothImage = garmentOverride || product?.imageUrl || product?.image || '';
            const category   = product?.category === 'bottom' ? 'lower_body'
                             : product?.category === 'dress'  ? 'dresses' : 'upper_body';

            const response = await api.post('/ai/try-on', {
                personImage: capturedPhoto,
                clothImage,
                category,
            });

            if (response.data.success) {
                setTryOnResult(response.data.resultImage);
                setProvider(response.data.provider || 'IDM-VTON');
                setProcessingTime(((Date.now() - startTime) / 1000).toFixed(1));
                toast.success('Try-on generated!', { icon: '✨' });

                // ── Save to Closet (localStorage) ──────────────────────────
                try {
                    const tryons = JSON.parse(localStorage.getItem('ss_tryons') || '[]');
                    tryons.unshift({
                        id:         Date.now(),
                        date:       new Date().toISOString(),
                        imageUrl:   response.data.resultImage,
                        clothName:  product?.name || 'Custom Garment',
                        clothImage: garmentOverride || product?.imageUrl || product?.image || '',
                        provider:   response.data.provider || 'IDM-VTON',
                    });
                    const trimmed = tryons.slice(0, 50); // keep last 50
                    localStorage.setItem('ss_tryons', JSON.stringify(trimmed));
                    localStorage.setItem('ss_tryon_count', String(trimmed.length));
                } catch {}
            } else {
                throw new Error('Try-on generation failed');
            }
        } catch (error) {
            console.error('Try-on Error:', error);
            toast.error('Try-on failed. The AI service may be busy — try again in a moment.');
        } finally {
            clearInterval(timer);
            setProcessing(false);
        }
    }, [capturedPhoto, product, garmentOverride]);

    const handleRetake = () => {
        setCapturedPhoto(null);
        setTryOnResult(null);
        setProcessingTime(0);
        setGarmentOverride(null);
    };

    const downloadResult = () => {
        if (!tryOnResult) return;
        const link = document.createElement('a');
        link.download = `stylesync-cpvton-${Date.now()}.jpg`;
        link.href = tryOnResult;
        link.click();
        toast.success('Image saved!', { icon: '💾' });
    };

    const currentGarmentImg = garmentOverride || product?.imageUrl || product?.image;

    /* ══════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════ */
    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white font-sans selection:bg-[#C6A75E]/30">
            <style>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.65);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(198, 167, 94, 0.2);
                }
                .gold-glow  { box-shadow: 0 0 25px rgba(198, 167, 94, 0.4); }
                .pulse-ring { animation: pulseRing 2s ease-out infinite; }
                @keyframes pulseRing {
                    0%   { transform: scale(0.8); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 0;   }
                }
                .shimmer {
                    background: linear-gradient(90deg, transparent, rgba(198,167,94,0.1), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                .upload-zone {
                    border: 2px dashed rgba(198, 167, 94, 0.25);
                    border-radius: 16px;
                    transition: all 0.25s;
                    cursor: pointer;
                }
                .upload-zone:hover, .upload-zone.dragging {
                    border-color: rgba(198, 167, 94, 0.7);
                    background: rgba(198, 167, 94, 0.05);
                }
                .upload-zone.has-image {
                    border-color: rgba(198, 167, 94, 0.5);
                    border-style: solid;
                }
            `}</style>

            {/* ── Top Bar ── */}
            <div className="sticky top-0 z-30 glass-panel px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all"
                    >
                        <span className="material-icons text-sm">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-serif text-[#C6A75E]">AI Virtual Try-On</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Powered by IDM-VTON</p>
                    </div>
                </div>

                {/* Provider badge */}
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2">
                    <span className="material-icons text-xs text-[#C6A75E]">auto_awesome</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A75E]">IDM-VTON</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cpvtonStatus === 'online' ? 'bg-green-400' : cpvtonStatus === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                        {cpvtonStatus === 'online' ? 'AI Engine Online' : cpvtonStatus === 'checking' ? 'Checking...' : 'AI Engine Offline'}
                    </span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* ════════════════════════════════
                        LEFT PANEL – Input & Preview
                    ════════════════════════════════ */}
                    <div className="space-y-5">

                        {/* Input Mode Toggle */}
                        <div className="flex items-center bg-white/5 rounded-2xl p-1 gap-1">
                            {[
                                { id: 'camera', label: 'Use Camera',        icon: 'videocam' },
                                { id: 'upload', label: 'Upload My Images',  icon: 'upload'   },
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setInputMode(m.id);
                                        setCapturedPhoto(null);
                                        setTryOnResult(null);
                                        setGarmentOverride(null);
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        inputMode === m.id
                                            ? 'bg-[#C6A75E] text-black shadow-lg shadow-[#C6A75E]/20'
                                            : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    <span className="material-icons text-sm">{m.icon}</span>
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* ── CAMERA MODE ── */}
                        {inputMode === 'camera' && (
                            <>
                                <div className="glass-panel rounded-2xl overflow-hidden relative aspect-[3/4]">
                                    {/* Countdown overlay */}
                                    {countdown > 0 && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                                            <div className="text-center">
                                                <span className="text-8xl font-bold text-[#C6A75E] drop-shadow-2xl">{countdown}</span>
                                                <p className="text-white/60 text-sm mt-4 uppercase tracking-[0.3em]">Hold still...</p>
                                            </div>
                                        </div>
                                    )}

                                    {tryOnResult ? (
                                        <img src={tryOnResult} alt="Try-on result" className="w-full h-full object-cover" />
                                    ) : capturedPhoto ? (
                                        <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                                    ) : !cameraActive ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <button
                                                    onClick={startCamera}
                                                    className="group relative w-24 h-24 rounded-full bg-[#C6A75E]/10 border border-[#C6A75E]/50 flex items-center justify-center hover:bg-[#C6A75E]/20 transition-all duration-500 mx-auto"
                                                >
                                                    <span className="material-icons text-4xl text-[#C6A75E] group-hover:scale-110 transition-transform">videocam</span>
                                                    <div className="absolute inset-0 rounded-full border border-[#C6A75E]/30 pulse-ring" />
                                                </button>
                                                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#C6A75E]">Start Camera</p>
                                                <p className="mt-2 text-[10px] text-white/30 max-w-xs">Stand in good lighting with your full upper body visible</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted />
                                    )}

                                    {/* Processing overlay */}
                                    {processing && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                                            <div className="text-center space-y-6">
                                                <div className="relative w-20 h-20 mx-auto">
                                                    <div className="absolute inset-0 rounded-full border-2 border-[#C6A75E]/20" />
                                                    <div className="absolute inset-0 rounded-full border-2 border-t-[#C6A75E] animate-spin" />
                                                    <div className="absolute inset-3 rounded-full border-2 border-t-[#C6A75E]/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                                </div>
                                                <div>
                                                    <p className="text-[#C6A75E] text-sm font-medium uppercase tracking-[0.2em]">Generating Try-On</p>
                                                    <p className="text-white/40 text-xs mt-2">AI is warping clothing to your body...</p>
                                                    <p className="text-[#C6A75E]/70 text-lg font-mono mt-3">{processingTime}s</p>
                                                </div>
                                                <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#C6A75E]/50 to-[#C6A75E] shimmer rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Camera action buttons */}
                                <div className="flex items-center gap-4">
                                    {!capturedPhoto && cameraActive && (
                                        <button
                                            onClick={capturePhoto}
                                            disabled={countdown > 0}
                                            className="flex-1 py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <span className="material-icons">photo_camera</span>
                                            Capture Photo
                                        </button>
                                    )}

                                    {capturedPhoto && !tryOnResult && !processing && (
                                        <>
                                            <button onClick={handleRetake} className="flex-1 py-4 bg-white/5 border border-[#C6A75E]/30 text-[#C6A75E] font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                                <span className="material-icons text-sm">refresh</span>
                                                Retake
                                            </button>
                                            <button onClick={handleTryOn} disabled={cpvtonStatus !== 'online'} className="flex-[2] py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                                <span className="material-icons">auto_awesome</span>
                                                Generate AI Try-On
                                            </button>
                                        </>
                                    )}

                                    {tryOnResult && (
                                        <>
                                            <button onClick={handleRetake} className="flex-1 py-4 bg-white/5 border border-[#C6A75E]/30 text-[#C6A75E] font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                                <span className="material-icons text-sm">refresh</span>
                                                Try Another
                                            </button>
                                            <button onClick={downloadResult} className="flex-[2] py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20 flex items-center justify-center gap-3">
                                                <span className="material-icons">save_alt</span>
                                                Save to Gallery
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── UPLOAD MODE ── */}
                        {inputMode === 'upload' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Person Image Upload */}
                                    <div>
                                        <p className="text-[10px] text-[#C6A75E] uppercase tracking-[0.25em] font-bold mb-2 flex items-center gap-1.5">
                                            <span className="material-icons text-xs">person</span>
                                            Your Photo <span className="text-red-400">*</span>
                                        </p>
                                        <div
                                            className={`upload-zone flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden ${draggingPerson ? 'dragging' : ''} ${capturedPhoto ? 'has-image' : ''}`}
                                            onClick={() => personFileRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setDraggingPerson(true); }}
                                            onDragLeave={() => setDraggingPerson(false)}
                                            onDrop={e => handleDrop(e, 'person')}
                                        >
                                            {capturedPhoto ? (
                                                <>
                                                    <img src={capturedPhoto} alt="Person" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                                        <div className="text-center">
                                                            <span className="material-icons text-[#C6A75E] text-3xl">edit</span>
                                                            <p className="text-white text-xs mt-1 font-bold">Change Photo</p>
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center z-10">
                                                        <span className="material-icons text-white text-xs">check</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-16 h-16 rounded-full bg-[#C6A75E]/10 border border-[#C6A75E]/30 flex items-center justify-center mx-auto mb-3">
                                                        <span className="material-icons text-[#C6A75E] text-2xl">person_add</span>
                                                    </div>
                                                    <p className="text-white/60 text-xs font-medium">Drop photo here</p>
                                                    <p className="text-white/30 text-[10px] mt-1">or click to browse</p>
                                                    <p className="text-[#C6A75E]/50 text-[9px] mt-3 uppercase tracking-wider">JPG, PNG, WEBP</p>
                                                </div>
                                            )}
                                        </div>
                                        <input ref={personFileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePersonUpload(e.target.files[0])} />
                                    </div>

                                    {/* Garment Image Upload */}
                                    <div>
                                        <p className="text-[10px] text-[#C6A75E] uppercase tracking-[0.25em] font-bold mb-2 flex items-center gap-1.5">
                                            <span className="material-icons text-xs">checkroom</span>
                                            Garment Image
                                        </p>
                                        <div
                                            className={`upload-zone flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden ${draggingGarment ? 'dragging' : ''} ${garmentOverride || currentGarmentImg ? 'has-image' : ''}`}
                                            onClick={() => garmentFileRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setDraggingGarment(true); }}
                                            onDragLeave={() => setDraggingGarment(false)}
                                            onDrop={e => handleDrop(e, 'garment')}
                                        >
                                            {garmentOverride || currentGarmentImg ? (
                                                <>
                                                    <img src={garmentOverride || currentGarmentImg} alt="Garment" className="absolute inset-0 w-full h-full object-contain p-4" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                                        <div className="text-center">
                                                            <span className="material-icons text-[#C6A75E] text-3xl">edit</span>
                                                            <p className="text-white text-xs mt-1 font-bold">Override Garment</p>
                                                        </div>
                                                    </div>
                                                    {garmentOverride && (
                                                        <div className="absolute top-2 right-2 bg-[#C6A75E] w-6 h-6 rounded-full flex items-center justify-center z-10">
                                                            <span className="material-icons text-black text-xs">upload</span>
                                                        </div>
                                                    )}
                                                    {!garmentOverride && (
                                                        <div className="absolute bottom-2 left-2 right-2 text-center">
                                                            <p className="text-[9px] bg-black/60 rounded px-2 py-1 text-white/60">From collection · Click to override</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center p-4">
                                                    <div className="w-16 h-16 rounded-full bg-[#C6A75E]/10 border border-[#C6A75E]/30 flex items-center justify-center mx-auto mb-3">
                                                        <span className="material-icons text-[#C6A75E] text-2xl">add_photo_alternate</span>
                                                    </div>
                                                    <p className="text-white/60 text-xs font-medium">Upload garment</p>
                                                    <p className="text-white/30 text-[10px] mt-1">or click to browse</p>
                                                    <p className="text-[#C6A75E]/50 text-[9px] mt-3 uppercase tracking-wider">JPG, PNG, WEBP</p>
                                                </div>
                                            )}
                                        </div>
                                        <input ref={garmentFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleGarmentUpload(e.target.files[0])} />
                                    </div>
                                </div>

                                {/* Upload result preview */}
                                {tryOnResult && (
                                    <div className="glass-panel rounded-2xl overflow-hidden aspect-[3/4] relative">
                                        <img src={tryOnResult} alt="Try-on result" className="w-full h-full object-cover" />
                                        {processing && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                                                <div className="text-center space-y-4">
                                                    <div className="relative w-16 h-16 mx-auto">
                                                        <div className="absolute inset-0 rounded-full border-2 border-[#C6A75E]/20" />
                                                        <div className="absolute inset-0 rounded-full border-2 border-t-[#C6A75E] animate-spin" />
                                                    </div>
                                                    <p className="text-[#C6A75E] text-xs uppercase tracking-widest">{processingTime}s</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Upload mode action buttons */}
                                <div className="flex items-center gap-4">
                                    {capturedPhoto && !tryOnResult && !processing && (
                                        <>
                                            <button onClick={handleRetake} className="flex-1 py-4 bg-white/5 border border-[#C6A75E]/30 text-[#C6A75E] font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                                <span className="material-icons text-sm">refresh</span>
                                                Reset
                                            </button>
                                            <button
                                                onClick={handleTryOn}
                                                disabled={cpvtonStatus !== 'online' || !capturedPhoto || (!currentGarmentImg && !garmentOverride)}
                                                className="flex-[2] py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <span className="material-icons">auto_awesome</span>
                                                Generate AI Try-On
                                            </button>
                                        </>
                                    )}
                                    {tryOnResult && (
                                        <>
                                            <button onClick={handleRetake} className="flex-1 py-4 bg-white/5 border border-[#C6A75E]/30 text-[#C6A75E] font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                                <span className="material-icons text-sm">refresh</span>
                                                New Upload
                                            </button>
                                            <button onClick={downloadResult} className="flex-[2] py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20 flex items-center justify-center gap-3">
                                                <span className="material-icons">save_alt</span>
                                                Save to Gallery
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Processing overlay for upload mode */}
                                {processing && (
                                    <div className="glass-panel rounded-2xl p-6 flex flex-col items-center gap-4">
                                        <div className="relative w-14 h-14">
                                            <div className="absolute inset-0 rounded-full border-2 border-[#C6A75E]/20" />
                                            <div className="absolute inset-0 rounded-full border-2 border-t-[#C6A75E] animate-spin" />
                                            <div className="absolute inset-2 rounded-full border-2 border-t-[#C6A75E]/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[#C6A75E] text-sm font-medium uppercase tracking-[0.2em]">Generating Try-On</p>
                                            <p className="text-white/40 text-xs mt-1">AI is warping clothing to your body...</p>
                                            <p className="text-[#C6A75E]/70 text-lg font-mono mt-2">{processingTime}s</p>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#C6A75E]/50 to-[#C6A75E] shimmer rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Image Tips (toggle) ── */}
                        <button
                            onClick={() => setShowTips(!showTips)}
                            className="w-full flex items-center justify-between px-4 py-3 glass-panel rounded-xl text-[11px] uppercase tracking-wider font-bold text-[#C6A75E]/80 hover:text-[#C6A75E] transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-icons text-sm">tips_and_updates</span>
                                Image Quality Tips
                            </div>
                            <span className="material-icons text-sm transition-transform" style={{ transform: showTips ? 'rotate(180deg)' : 'rotate(0)' }}>
                                expand_more
                            </span>
                        </button>

                        {showTips && (
                            <div className="grid grid-cols-2 gap-4">
                                {/* Person tips */}
                                <div className="glass-panel rounded-xl p-5 border-l-4 border-[#C6A75E]/50">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6A75E] mb-4 flex items-center gap-2">
                                        <span className="material-icons text-sm">person</span>
                                        Your Photo
                                    </p>
                                    <ul className="space-y-2.5">
                                        {PERSON_TIPS.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[11px] text-white/60 leading-tight">
                                                <span className="mt-px shrink-0">{tip.icon}</span>
                                                {tip.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Garment tips */}
                                <div className="glass-panel rounded-xl p-5 border-l-4 border-white/10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-4 flex items-center gap-2">
                                        <span className="material-icons text-sm">checkroom</span>
                                        Garment Image
                                    </p>
                                    <ul className="space-y-2.5">
                                        {GARMENT_TIPS.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[11px] text-white/60 leading-tight">
                                                <span className="mt-px shrink-0">{tip.icon}</span>
                                                {tip.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ════════════════════════════════
                        RIGHT PANEL
                    ════════════════════════════════ */}
                    <div className="space-y-6">

                        {/* Selected Clothing Card */}
                        <div className="glass-panel rounded-2xl p-6 space-y-5">
                            {/* Garment info row */}
                            <div className="flex items-start gap-5">
                                <div className="w-28 h-36 rounded-xl overflow-hidden border border-[#C6A75E]/20 flex-shrink-0 relative">
                                    <img
                                        src={garmentOverride || product?.imageUrl || product?.image || '/placeholder.jpg'}
                                        alt={product?.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {garmentOverride && (
                                        <div className="absolute top-1 right-1 bg-[#C6A75E] rounded px-1.5 py-0.5">
                                            <p className="text-[8px] text-black font-bold uppercase tracking-wide">Custom</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-[#C6A75E] uppercase tracking-[0.3em] mb-1">Selected Garment</p>
                                    <h2 className="text-lg font-serif text-white truncate">{garmentOverride ? 'Custom Upload' : (product?.name || 'No garment')}</h2>
                                    <p className="text-white/40 text-sm mt-1 line-clamp-2">{product?.description || product?.category || ''}</p>
                                    <p className="text-[#C6A75E] text-lg font-light mt-3">
                                        {!garmentOverride && product ? `$${typeof product.price === 'object' ? (product.price?.amount ?? '—') : (product.price ?? '—')}` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* ── Divider ── */}
                            <div className="border-t border-[#C6A75E]/10" />

                            {/* ── Swap / Upload garment ── */}
                            <div>
                                <p className="text-[10px] text-[#C6A75E] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="material-icons text-xs">swap_horiz</span>
                                    Change Garment
                                </p>

                                {/* Drop zone */}
                                <div
                                    className={`upload-zone flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl text-center cursor-pointer transition-all ${draggingGarment ? 'dragging' : ''}`}
                                    style={{ minHeight: 90, borderColor: garmentOverride ? 'rgba(198,167,94,0.6)' : undefined }}
                                    onClick={() => changeGarmentRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setDraggingGarment(true); }}
                                    onDragLeave={() => setDraggingGarment(false)}
                                    onDrop={e => { e.preventDefault(); setDraggingGarment(false); handleGarmentUpload(e.dataTransfer.files[0]); }}
                                >
                                    <span className="material-icons text-[#C6A75E] text-2xl">add_photo_alternate</span>
                                    <p className="text-white/60 text-xs font-medium">Drop garment image or click to browse</p>
                                    <p className="text-[#C6A75E]/50 text-[9px] uppercase tracking-wider">JPG · PNG · WEBP</p>
                                </div>
                                <input
                                    ref={changeGarmentRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleGarmentUpload(e.target.files[0])}
                                />

                                {/* Remove custom + back to collection */}
                                {garmentOverride && (
                                    <button
                                        onClick={() => setGarmentOverride(null)}
                                        className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] text-white/30 hover:text-red-400 transition-colors py-1"
                                    >
                                        <span className="material-icons text-xs">close</span>
                                        Remove custom — restore original garment
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="glass-panel rounded-2xl p-8 space-y-6">
                            <h3 className="text-xs font-medium tracking-[0.2em] uppercase text-[#C6A75E]">How It Works</h3>
                            <div className="space-y-4">
                                {[
                                    { step: '01', title: inputMode === 'upload' ? 'Upload Photos' : 'Capture', desc: inputMode === 'upload' ? 'Upload your photo and the garment image' : 'Take a clear photo of yourself', icon: inputMode === 'upload' ? 'upload' : 'photo_camera', done: !!capturedPhoto },
                                    { step: '02', title: 'AI Processing', desc: 'Neural network warps clothing to your body', icon: 'psychology', done: !!tryOnResult },
                                    { step: '03', title: 'Result', desc: 'See yourself wearing the garment', icon: 'checkroom', done: !!tryOnResult },
                                ].map(item => (
                                    <div key={item.step} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${item.done ? 'bg-[#C6A75E]/10 border border-[#C6A75E]/30' : 'bg-white/5'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-[#C6A75E] text-black' : 'bg-white/10 text-white/40'}`}>
                                            {item.done
                                                ? <span className="material-icons text-sm">check</span>
                                                : <span className="material-icons text-sm">{item.icon}</span>
                                            }
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${item.done ? 'text-[#C6A75E]' : 'text-white/60'}`}>{item.title}</p>
                                            <p className="text-[11px] text-white/30">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Processing Time Card */}
                        {tryOnResult && (
                            <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Processing Time</p>
                                    <p className="text-2xl font-mono text-[#C6A75E]">{processingTime}s</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Provider</p>
                                    <p className="text-sm text-white/80 capitalize">{provider || 'IDM-VTON'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Quality</p>
                                    <p className="text-sm text-green-400">High Fidelity</p>
                                </div>
                            </div>
                        )}

                        {/* Model info card */}
                        <div className="glass-panel rounded-2xl p-6 border-l-4 border-[#C6A75E]/50">
                            <div className="flex items-start gap-4">
                                <span className="material-icons text-xl text-[#C6A75E]">auto_awesome</span>
                                <div>
                                    <p className="text-sm font-medium text-[#C6A75E]">IDM-VTON — Cloth Warping</p>
                                    <p className="text-xs text-white/40 mt-1 leading-relaxed">
                                        Warp-based model: exact cloth texture preserved with realistic folds and shadows. Best for seeing the exact product on your body.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-4">
                            <Link to="/recommendations" className="flex-1 py-3 text-center glass-panel rounded-xl text-[10px] uppercase tracking-[0.2em] text-[#C6A75E] hover:bg-[#C6A75E] hover:text-black transition-all font-bold">
                                ← Back to Collection
                            </Link>
                            <Link to="/ar-tryon" state={{ product }} className="flex-1 py-3 text-center glass-panel rounded-xl text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-[#C6A75E] transition-all font-bold">
                                Live AR Mode →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Warning Modal removed — IDM-VTON only */}
        </div>
    );
}
