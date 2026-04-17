import { useState, useRef, useEffect, useCallback } from 'react';
// import { Pose } from '@mediapipe/pose'; // Using CDN
import { useLocation, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ARTryOn() {
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state || {};

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const poseRef = useRef(null);
    const clothingImgRef = useRef(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stream, setStream] = useState(null);
    const [adjustments, setAdjustments] = useState({
        scale: 1.0,
        offsetX: 0,
        offsetY: 0,
        opacity: 1.0,
    });

    // Load and process clothing image with Fallback Strategy
    useEffect(() => {
        if (!product) return;

        const PLACEHOLDER_ASSET = 'https://i.ibb.co/hf048X0/white-shirt-transparent.png'; // Fallback

        const removeBackground = (sourceImg) => {
            return new Promise((resolve, reject) => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = sourceImg.width;
                    canvas.height = sourceImg.height;
                    ctx.drawImage(sourceImg, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    const tolerance = 20;

                    let isAllWhite = true;
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        if (r < 240 || g < 240 || b < 240) isAllWhite = false;

                        if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
                            data[i + 3] = 0;
                        }
                    }
                    if (isAllWhite) {
                        reject(new Error('Image appears empty after processing'));
                        return;
                    }

                    ctx.putImageData(imageData, 0, 0);
                    const processedImg = new Image();
                    processedImg.onload = () => resolve(processedImg);
                    processedImg.onerror = reject;
                    processedImg.src = canvas.toDataURL();
                } catch (err) {
                    reject(err);
                }
            });
        };

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        };

        const executeAssetPipeline = async () => {
            setLoading(true);

            // PRIORITY 1: AR Asset (Transparent PNG)
            if (product.arAssetImage) {
                try {
                    const img = await loadImage(product.arAssetImage);
                    clothingImgRef.current = img;
                    setLoading(false);
                    return;
                } catch (err) {
                    console.warn('Priority 1 Failed: AR Asset not loadable. Trying Priority 2.', err);
                }
            }

            // PRIORITY 2: Background Removal on Model Image
            if (product.imageUrl) {
                try {
                    const rawImg = await loadImage(product.imageUrl);
                    const processedImg = await removeBackground(rawImg);
                    clothingImgRef.current = processedImg;
                    setLoading(false);
                    return;
                } catch (err) {
                    console.warn('Priority 2 Failed: Background removal failed. Trying Priority 3.', err);
                }
            }

            // PRIORITY 3: Fallback Placeholder
            try {
                const placeholder = await loadImage(PLACEHOLDER_ASSET);
                clothingImgRef.current = placeholder;
                setLoading(false);
                toast('Using fallback visualization', { icon: '🧥' });
            } catch (err) {
                console.error('Critical Failure: Placeholder failed.', err);
                setLoading(false);
                toast.error('Visualization Unavailable');
            }
        };

        executeAssetPipeline();
    }, [product]);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
            });
            setStream(mediaStream);
            setCameraActive(true);
        } catch (err) {
            console.error("Camera failed", err);
        }
    }, []);

    const adjustmentsRef = useRef(adjustments);
    useEffect(() => { adjustmentsRef.current = adjustments; }, [adjustments]);

    // Initialize MediaPipe Pose
    const initializePose = useCallback(async () => {
        try {
            const Pose = window.Pose;
            if (!Pose) {
                console.error("MediaPipe Pose not found in window");
                toast.error("AR Engine Failed: Check Internet Connection");
                setLoading(false);
                return;
            }

            const pose = new Pose({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            pose.onResults((results) => {
                if (!canvasRef.current || !videoRef.current) return;

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');

                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;

                // Draw camera feed (mirror effect)
                ctx.save();
                ctx.scale(-1, 1);
                ctx.translate(-canvas.width, 0);
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
                ctx.restore();

                if (results.poseLandmarks && clothingImgRef.current) {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.translate(-canvas.width, 0);
                    drawClothingOverlay(ctx, results.poseLandmarks, canvas);
                    ctx.restore();
                }
            });

            poseRef.current = pose;
            setLoading(false);

            const detectLoop = async () => {
                if (videoRef.current && videoRef.current.readyState >= 2 && poseRef.current) {
                    await poseRef.current.send({ image: videoRef.current });
                }
                animRef.current = requestAnimationFrame(detectLoop);
            };
            detectLoop();

        } catch (err) {
            console.error('MediaPipe initialization error:', err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(() => {
                initializePose();
            }).catch(e => console.error("Video play error", e));
        }
    }, [cameraActive, stream, initializePose]);

    const drawClothingOverlay = (ctx, landmarks, canvas) => {
        const img = clothingImgRef.current;
        if (!img) return;

        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        if (leftShoulder.visibility < 0.5 || rightShoulder.visibility < 0.5) return;

        const shoulderL = { x: leftShoulder.x * canvas.width, y: leftShoulder.y * canvas.height };
        const shoulderR = { x: rightShoulder.x * canvas.width, y: rightShoulder.y * canvas.height };
        const hipL = { x: leftHip.x * canvas.width, y: leftHip.y * canvas.height };
        const hipR = { x: rightHip.x * canvas.width, y: rightHip.y * canvas.height };

        const bodyWidth = Math.sqrt((shoulderR.x - shoulderL.x) ** 2 + (shoulderR.y - shoulderL.y) ** 2);

        let drawX, drawY, drawW, drawH;

        // Metadata-driven Logic
        const arMeta = product?.arMeta || {};
        const category = arMeta.category || product?.category || 'top';
        const anchor = arMeta.anchor || (category === 'bottom' ? 'hips' : 'shoulders');
        const baseScale = arMeta.scaleMultiplier || 1.0;
        const metaOffsetX = arMeta.offsetX || 0;
        const metaOffsetY = arMeta.offsetY || 0;

        const currentAdjustments = adjustmentsRef.current;
        const userScale = currentAdjustments.scale;

        // Calculate Anchor Point
        let anchorX, anchorY;
        if (anchor === 'hips') {
            anchorX = (hipL.x + hipR.x) / 2;
            anchorY = (hipL.y + hipR.y) / 2;
        } else if (anchor === 'waist') {
            // Approximation of waist between shoulders and hips
            anchorX = (shoulderL.x + shoulderR.x + hipL.x + hipR.x) / 4;
            anchorY = (shoulderL.y + shoulderR.y + hipL.y + hipR.y) / 4;
        } else {
            // Shoulders (Default)
            anchorX = (shoulderL.x + shoulderR.x) / 2;
            anchorY = (shoulderL.y + shoulderR.y) / 2;
        }

        // Calculate Dimensions based on Category & Metadata
        if (category === 'top' || category === 'outerwear') {
            drawW = bodyWidth * 3.4 * baseScale * userScale;
            drawH = drawW * (img.height / img.width);
            drawX = anchorX - drawW / 2;
            // Default offset for tops usually needs to be slightly above shoulders to cover neck
            drawY = anchorY - (drawH * 0.18) + (metaOffsetY * canvas.height);
        } else if (category === 'dress') {
            drawW = bodyWidth * 3.0 * baseScale * userScale;
            drawH = drawW * (img.height / img.width);
            drawX = anchorX - drawW / 2;
            drawY = anchorY - (drawH * 0.12) + (metaOffsetY * canvas.height);
        } else if (category === 'bottom') {
            drawW = bodyWidth * 2.4 * baseScale * userScale;
            drawH = drawW * (img.height / img.width);
            drawX = anchorX - drawW / 2;
            // Bottoms usually start at hips/waist
            drawY = anchorY - (drawH * 0.1) + (metaOffsetY * canvas.height);
        } else {
            drawW = bodyWidth * 2.5 * baseScale * userScale;
            drawH = drawW * (img.height / img.width);
            drawX = anchorX - drawW / 2;
            drawY = anchorY + (metaOffsetY * canvas.height);
        }

        // Apply User Adjustments (Pixel based shift from UI controls)
        drawX += currentAdjustments.offsetX * 2 + (metaOffsetX * canvas.width);
        // Note: We already applied metaOffsetY in the drawY calculation relative to body parts, 
        // but user offset is absolute pixels.
        drawY += currentAdjustments.offsetY * 2;

        ctx.save();
        ctx.globalAlpha = currentAdjustments.opacity;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        // Debug Anchors (Optional - can remove for prod)
        // ctx.fillStyle = 'red';
        // ctx.beginPath(); ctx.arc(anchorX, anchorY, 5, 0, 2*Math.PI); ctx.fill();

        ctx.restore();
    };

    const takeScreenshot = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `stylesync-ar-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    // Video cleanup
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            if (poseRef.current) poseRef.current.close();
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Strict Stream Cleanup
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                console.log('Camera stream stopped via cleanup');
            }
        };
    }, [stream]);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-serif">
                <div className="text-center p-12 border border-[#C6A75E]/20 rounded-2xl bg-[#0A0A0A]/60 backdrop-blur-xl max-w-md">
                    <span className="material-icons text-6xl mb-6 text-[#C6A75E]/20">branding_watermark</span>
                    <h2 className="text-3xl font-display text-[#C6A75E] mb-4">No Garment Selected</h2>
                    <p className="text-white/40 mb-10 text-sm tracking-wide">Please select a piece from your curated recommendations to enable virtual fitting.</p>
                    <Link to="/recommendations" className="px-10 py-4 bg-[#C6A75E] text-black font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white transition-all shadow-lg shadow-[#C6A75E]/20">
                        Access Collection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-[#050505] text-white font-sans selection:bg-[#C6A75E]/30">
            {/* Styles for custom inputs */}
            <style>{`
                input[type=range] {
                    -webkit-appearance: none;
                    background: rgba(198, 167, 94, 0.15);
                    height: 2px;
                    border-radius: 1px;
                }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 14px;
                    width: 14px;
                    border-radius: 50%;
                    background: #C6A75E;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(198, 167, 94, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .tracking-corner {
                    filter: drop-shadow(0 0 5px #C6A75E);
                }
                .glass-panel {
                    background: rgba(10, 10, 10, 0.65);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(198, 167, 94, 0.2);
                }
                .gold-glow {
                    box-shadow: 0 0 25px rgba(198, 167, 94, 0.4);
                }
                /* Font imports handled in index.html typically, using fallback sans/serif here */
            `}</style>

            {/* Background Feed */}
            <div className="absolute inset-0 z-0">
                {!cameraActive ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-10">
                        <div className="text-center relative z-20">
                            <button
                                onClick={startCamera}
                                className="group relative w-24 h-24 rounded-full bg-[#C6A75E]/10 border border-[#C6A75E]/50 flex items-center justify-center hover:bg-[#C6A75E]/20 transition-all duration-500 mx-auto"
                            >
                                <span className="material-icons text-4xl text-[#C6A75E] group-hover:scale-110 transition-transform">videocam</span>
                                <div className="absolute inset-0 rounded-full border border-[#C6A75E]/30 animate-ping opacity-20"></div>
                            </button>
                            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#C6A75E] gold-glow-text">Initialize Optical Engine</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} className="hidden" playsInline muted />
                        <canvas ref={canvasRef} className="w-full h-full object-cover" />

                        {/* AR Tracking Frame Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none fade-in duration-1000">
                            <div className="w-[85%] h-[85%] border border-[#C6A75E]/20 rounded-[2rem] relative">
                                <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#C6A75E] tracking-corner rounded-tl-2xl"></div>
                                <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#C6A75E] tracking-corner rounded-tr-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-[#C6A75E] tracking-corner rounded-bl-2xl"></div>
                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#C6A75E] tracking-corner rounded-br-2xl"></div>
                                {/* Scanning line effect */}
                                <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C6A75E]/40 to-transparent animate-pulse"></div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Controls Overlay - Visible when camera active */}
            {cameraActive && (
                <>
                    {/* Top Left: Product Info */}
                    <div className="absolute top-10 left-10 z-20 space-y-6 animate-fade-in-down">
                        <div className="flex items-center gap-4">
                            <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C6A75E] animate-pulse"></div>
                                <span className="text-[10px] tracking-[0.3em] uppercase font-medium text-[#C6A75E]/80">Optical Sync Active</span>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl max-w-xs border-l-[3px] border-[#C6A75E]">
                            <h2 className="text-[#C6A75E] font-serif italic text-sm mb-1">StyleSync Collection</h2>
                            <h1 className="text-2xl font-serif tracking-wide text-white">{product.name}</h1>
                            <p className="text-[10px] text-white/40 mt-2 uppercase tracking-[0.2em]">Item Code: LX-{product._id?.substring(0, 6) || '2026'}</p>
                            <p className="text-lg font-light text-[#C6A75E] mt-3">${product.price?.amount || product.price || '—'}</p>
                        </div>
                    </div>

                    {/* Right Panel: Precision Controls */}
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20 w-80 animate-fade-in-left">
                        <div className="glass-panel p-8 rounded-[2rem] flex flex-col gap-8 shadow-2xl border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#C6A75E]">Precision Controls</span>
                                <span className="material-icons text-[#C6A75E] text-xl">tune</span>
                            </div>

                            <div className="space-y-8">
                                {/* Scale Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        <span>Fit Scale</span>
                                        <span className="text-[#C6A75E] font-medium">{Math.round(adjustments.scale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5" max="2.0" step="0.05"
                                        value={adjustments.scale}
                                        onChange={(e) => setAdjustments(a => ({ ...a, scale: parseFloat(e.target.value) }))}
                                        className="w-full cursor-pointer"
                                    />
                                </div>

                                {/* Position D-Pad (Replacing 'Vertical Offset') */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        <span>Position Shift</span>
                                        <span className="text-[#C6A75E] font-medium">X:{adjustments.offsetX} Y:{adjustments.offsetY}</span>
                                    </div>
                                    {/* D-Pad Styling adapted to Glassmorphism */}
                                    <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                                        <div />
                                        <button
                                            onClick={() => setAdjustments(a => ({ ...a, offsetY: a.offsetY - 5 }))}
                                            className="w-8 h-8 rounded bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all active:scale-95"
                                        >
                                            <span className="material-icons text-xs">keyboard_arrow_up</span>
                                        </button>
                                        <div />
                                        <button
                                            onClick={() => setAdjustments(a => ({ ...a, offsetX: a.offsetX - 5 }))}
                                            className="w-8 h-8 rounded bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all active:scale-95"
                                        >
                                            <span className="material-icons text-xs">keyboard_arrow_left</span>
                                        </button>
                                        <button
                                            onClick={() => setAdjustments(a => ({ ...a, offsetX: 0, offsetY: 0 }))}
                                            className="w-8 h-8 rounded bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all active:scale-95 text-[9px] font-bold"
                                            title="Reset"
                                        >
                                            CLR
                                        </button>
                                        <button
                                            onClick={() => setAdjustments(a => ({ ...a, offsetX: a.offsetX + 5 }))}
                                            className="w-8 h-8 rounded bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all active:scale-95"
                                        >
                                            <span className="material-icons text-xs">keyboard_arrow_right</span>
                                        </button>
                                        <div />
                                        <button
                                            onClick={() => setAdjustments(a => ({ ...a, offsetY: a.offsetY + 5 }))}
                                            className="w-8 h-8 rounded bg-white/5 border border-[#C6A75E]/30 flex items-center justify-center hover:bg-[#C6A75E] hover:text-black transition-all active:scale-95"
                                        >
                                            <span className="material-icons text-xs">keyboard_arrow_down</span>
                                        </button>
                                        <div />
                                    </div>
                                </div>

                                {/* Opacity Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-white/50">
                                        <span>Lustre density</span>
                                        <span className="text-[#C6A75E] font-medium">{Math.round(adjustments.opacity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.3" max="1.0" step="0.05"
                                        value={adjustments.opacity}
                                        onChange={(e) => setAdjustments(a => ({ ...a, opacity: parseFloat(e.target.value) }))}
                                        className="w-full cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Decorative Visual Toggles (Static/No-op for now) */}
                            <div className="pt-6 border-t border-[#C6A75E]/10 space-y-4 opacity-60 pointer-events-none">
                                <button className="w-full flex items-center justify-between group">
                                    <span className="text-[10px] uppercase tracking-widest text-white/60">Ambient Occlusion</span>
                                    <div className="w-8 h-[14px] bg-white/5 rounded-full relative p-0.5 border border-white/10">
                                        <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-[#C6A75E] rounded-full"></div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setAdjustments({ scale: 1.0, offsetX: 0, offsetY: 0, opacity: 0.85 })}
                                className="w-full py-4 bg-white/5 border border-[#C6A75E]/20 rounded-xl text-[10px] uppercase tracking-[0.2em] text-[#C6A75E] hover:bg-[#C6A75E] hover:text-black transition-all font-bold"
                            >
                                Calibrate Sensor
                            </button>
                        </div>
                    </div>

                    {/* Bottom Center: Capture Actions */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-10 animate-fade-in-up">
                        {/* Favorite Button (Placeholder) */}
                        <button className="glass-panel w-16 h-16 rounded-full flex items-center justify-center group hover:border-[#C6A75E] transition-all">
                            <span className="material-icons text-white/70 group-hover:text-[#C6A75E] transition-colors">favorite_border</span>
                        </button>

                        {/* Capture Button */}
                        <div className="relative group">
                            <div className="absolute -inset-6 bg-[#C6A75E]/30 rounded-full blur-2xl group-hover:bg-[#C6A75E]/50 transition-all"></div>
                            <button
                                onClick={takeScreenshot}
                                className="relative w-28 h-28 rounded-full bg-[#C6A75E] flex items-center justify-center gold-glow transform hover:scale-105 active:scale-95 transition-all shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]"
                            >
                                <span className="material-icons text-black text-5xl">photo_camera</span>
                            </button>
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                <span className="text-[11px] uppercase tracking-[0.4em] font-semibold text-[#C6A75E] gold-glow-text">Capture Moment</span>
                            </div>
                        </div>

                        {/* Share Button (Placeholder) */}
                        <button className="glass-panel w-16 h-16 rounded-full flex items-center justify-center group hover:border-[#C6A75E] transition-all">
                            <span className="material-icons text-white/70 group-hover:text-[#C6A75E] transition-colors">ios_share</span>
                        </button>
                    </div>

                    {/* Top Right: Actions */}
                    <div className="absolute top-10 right-10 z-20 flex gap-6 items-center">
                        <Link to="/saved-outfits" className="text-white/70 text-xs font-medium uppercase tracking-[0.2em] hover:text-[#C6A75E] transition-all px-4">
                            Private Gallery
                        </Link>
                        <button
                            onClick={() => toast('Feature coming soon!', { icon: '🚧', style: { borderRadius: '10px', background: '#333', color: '#fff' } })}
                            className="bg-[#C6A75E] text-black px-10 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white transition-all transform hover:-translate-y-1">
                            Acquire Piece
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
