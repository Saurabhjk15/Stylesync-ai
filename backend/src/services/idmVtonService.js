/**
 * IDM-VTON Service
 * =================
 * Try-on pipeline with fallback chain:
 *
 *  Priority order (when VTON_PROVIDER=huggingface, default):
 *   1. IDM-VTON  — HuggingFace Space (yisol/IDM-VTON)          free, ZeroGPU daily quota
 *   2. Gemini    — Image gen REST API                           free if billing enabled
 *   3. Kolors    — HuggingFace Space (Kwai-Kolors/Kolors-VTON)  free, SEPARATE ZeroGPU quota
 *   4. Replicate — IDM-VTON on Replicate                        paid ~$0.023/img
 *
 *  Switch to Replicate as primary: set VTON_PROVIDER=replicate in .env
 */

import { Client }   from '@gradio/client';
import axios        from 'axios';
import { uploadImage } from './supabaseService.js';

// NOTE: Do NOT read env vars at module level — dotenv hasn't loaded yet in ESM.
const REPLICATE_VERSION = '0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985';
const PROVIDER          = process.env.VTON_PROVIDER || 'huggingface';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
// Gemini image gen endpoint — updated to use proper model
const GEMINI_IMAGE_ENDPOINT = `${GEMINI_BASE}/gemini-2.0-flash-exp-image-generation:generateContent`;
// Use function so headers are read at call time (after dotenv loads)
const geminiImageHeaders = () => ({
    'x-goog-api-key': process.env.GEMINI_API_KEY,
    'Content-Type': 'application/json',
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function base64ToBlob(dataUrl) {
    const matches  = dataUrl.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const raw      = matches ? matches[2] : dataUrl;
    return new Blob([Buffer.from(raw, 'base64')], { type: mimeType });
}

function extractUrl(data) {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (data.url) return data.url;
    if (Array.isArray(data) && data.length > 0) return extractUrl(data[0]);
    return null;
}

async function urlToBase64(url) {
    if (url.startsWith('data:')) return url;
    const res  = await axios.get(url, { responseType: 'arraybuffer', timeout: 30_000 });
    const b64  = Buffer.from(res.data).toString('base64');
    const mime = res.headers['content-type'] || 'image/png';
    return `data:${mime};base64,${b64}`;
}

// ── HF token helper ─────────────────────────────────────────────────────────
const hfToken = () => {
    const t = process.env.HF_INFERENCE_API_KEY;
    return (t && !t.startsWith('your-')) ? t : undefined;
};

// ── HF Space warm-up (call when try-on page loads) ───────────────────────────
let _hfClientCache = null;
export async function warmHFSpace() {
    try {
        const tok = hfToken();
        console.log(`🔥 IDM-VTON: Pre-warming HF Space${tok ? ' (logged in ✓)' : ' (unlogged — set HF_INFERENCE_API_KEY)'}...`);
        _hfClientCache = await Client.connect('yisol/IDM-VTON', { hf_token: tok });
        console.log('✅ IDM-VTON: HF Space warmed and ready');
    } catch (e) {
        console.warn('⚠️  IDM-VTON warmup failed (non-fatal):', e.message);
        _hfClientCache = null;
    }
}

// ── Provider 1: HuggingFace Space ────────────────────────────────────────────

async function callHFSpaceOnce(personImageBase64, clothImageBase64, timeoutMs) {
    const client = _hfClientCache || await Client.connect('yisol/IDM-VTON', {
        hf_token:        hfToken(),
        status_callback: (s) => {
            if (s.stage !== 'complete') console.log(`  ↳ HF Space: ${s.stage} — ${s.message || ''}`);
        },
    });
    const predict = client.predict('/tryon', {
        dict:            { background: base64ToBlob(personImageBase64), layers: [], composite: null },
        garm_img:        base64ToBlob(clothImageBase64),
        garment_des:     'clothing item for virtual try-on',
        is_checked:      true,
        is_checked_crop: false,
        denoise_steps:   30,
        seed:            42,
    });
    const result = await Promise.race([
        predict,
        new Promise((_, r) => setTimeout(() => r(new Error('HF Space timeout')), timeoutMs)),
    ]);
    const outputUrl = extractUrl(result?.data?.[0]);
    if (!outputUrl) throw new Error('HF Space returned no image');
    return await urlToBase64(outputUrl);
}

async function callHFSpace(personImageBase64, clothImageBase64, category = 'upper_body') {
    console.log('🔌 IDM-VTON: Connecting to HF Space yisol/IDM-VTON...');
    try {
        // 45s timeout — if quota exceeded the error comes back in <5s anyway
        const b64 = await callHFSpaceOnce(personImageBase64, clothImageBase64, 45_000);
        _hfClientCache = null;
        console.log('✅ IDM-VTON: HuggingFace complete');
        return { success: true, resultImage: b64, provider: 'huggingface' };
    } catch (err1) {
        _hfClientCache = null;
        // Quota errors come back immediately — no point retrying
        if (err1.message.includes('ZeroGPU') || err1.message.includes('quota')) {
            throw new Error(`IDM-VTON daily quota exhausted (resets at midnight UTC): ${err1.message}`);
        }
        // Space sleeping — one retry after 3s
        console.warn(`⚠️  IDM-VTON attempt 1 failed: ${err1.message} — retrying once in 3s...`);
        await new Promise(r => setTimeout(r, 3000));
        const b64 = await callHFSpaceOnce(personImageBase64, clothImageBase64, 90_000);
        console.log('✅ IDM-VTON: HuggingFace complete (retry)');
        return { success: true, resultImage: b64, provider: 'huggingface' };
    }
}

// ── Provider 2: Gemini Image Generation (Fallback) ───────────────────────────
/**
 * Uses Gemini 2.0 Flash experimental image generation.
 * Sends person + garment images and asks Gemini to generate the try-on.
 * The prompt is LOCKED — we don't expose it to the user to ensure consistent output.
 */
async function callGeminiImageGen(personImageBase64, clothImageBase64, category = 'upper_body') {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set in .env');
    console.log('🤖 IDM-VTON: Trying Gemini image generation fallback...');

    // Extract raw base64 without data URL prefix
    const personRaw = personImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const clothRaw  = clothImageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Locked prompt — produces the best try-on result with Gemini
    const TRYON_PROMPT = [
        'You are a virtual try-on AI. I am giving you two images:',
        '1. A photo of a person',
        '2. A clothing garment',
        '',
        'Generate a single photorealistic image showing the SAME person wearing the garment.',
        'Rules you MUST follow:',
        '- Preserve the person\'s exact face, hair, skin tone, body shape, and pose completely unchanged',
        '- Replace ONLY the clothing area with the provided garment',
        '- Maintain natural lighting, shadows, and fabric draping',
        '- Keep the background identical to the original person photo',
        '- Do NOT add any other garments, accessories, or watermarks',
        '- Output a clean, photorealistic fashion photo'
    ].join('\n');

    const response = await axios.post(
        GEMINI_IMAGE_ENDPOINT,
        {
            contents: [{
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: personRaw } },
                    { inlineData: { mimeType: 'image/jpeg', data: clothRaw  } },
                    { text: TRYON_PROMPT },
                ]
            }],
            generationConfig: { responseModalities: ['IMAGE'], temperature: 0.2 },
        },
        { headers: geminiImageHeaders(), timeout: 120_000 }
    );

    // Extract generated image from response
    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData?.data);

    if (!imagePart) throw new Error('Gemini returned no image data');

    const mime = imagePart.inlineData.mimeType || 'image/png';
    const resultBase64 = `data:${mime};base64,${imagePart.inlineData.data}`;

    console.log('✅ IDM-VTON: Gemini image generation complete');
    return {
        success:   true,
        resultImage: resultBase64,
        provider:  'gemini_image_gen',
        note:      'Generated via Gemini 2.0 Flash (HF Space unavailable)',
    };
}

// Kolors removed — space currently has no endpoints (named_endpoints: {}, unnamed_endpoints: {})

// ── Provider 2b: LightX AI Virtual Outfit Try-On ────────────────────────────────────
/**
 * LightX API: https://docs.lightxeditor.com/api/ai-virtual-outfit-try-on
 * - No Supabase needed — uses LightX's own S3 upload
 * - Supports upper (0), lower (1), full body (2)
 * - Cost: 2 credits per try-on | Avg: ~15 seconds
 * - Get key: https://www.lightxeditor.com/api/
 *
 * Flow:
 *  1. Get presigned S3 URL for person image  (uploadImageUrl)
 *  2. PUT person image bytes to S3
 *  3. Get presigned S3 URL for garment image (uploadImageUrl)
 *  4. PUT garment image bytes to S3
 *  5. Submit try-on (aivirtualtryon)
 *  6. Poll order-status every 3s until active/failed (max 5 retries)
 */
async function uploadToLightX(base64Image, apiKey) {
    // Strip data URL prefix
    const matches  = base64Image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const rawB64   = matches ? matches[2] : base64Image;
    const bytes    = Buffer.from(rawB64, 'base64');

    // Step A: Get presigned upload URL
    const uploadRes = await axios.post(
        'https://api.lightxeditor.com/external/api/v2/uploadImageUrl',
        { uploadType: 'imageUrl', size: bytes.length, contentType: mimeType },
        { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: 15_000 }
    );
    if (uploadRes.data?.statusCode !== 2000) {
        throw new Error(`LightX upload init failed: ${JSON.stringify(uploadRes.data)}`);
    }
    const { uploadImage: putUrl, imageUrl } = uploadRes.data.body;

    // Step B: PUT image bytes to S3
    await axios.put(putUrl, bytes, {
        headers: { 'Content-Type': mimeType, 'Content-Length': bytes.length },
        timeout: 30_000,
        maxBodyLength: Infinity,
    });

    return imageUrl; // CloudFront URL valid for 24h
}

async function callLightX(personImageBase64, clothImageBase64, category = 'upper_body') {
    const apiKey = process.env.LIGHTX_API_KEY;
    if (!apiKey || apiKey.startsWith('your-')) throw new Error('LIGHTX_API_KEY not set in .env');
    console.log('💡 LightX: Uploading images...');

    const segmentationType = category === 'lower_body' ? 1 : category === 'full_body' ? 2 : 0;

    // Upload both images in parallel
    const [personUrl, garmentUrl] = await Promise.all([
        uploadToLightX(personImageBase64,  apiKey),
        uploadToLightX(clothImageBase64,   apiKey),
    ]);
    console.log('💡 LightX: Submitting try-on request...');

    // Submit try-on
    const tryOnRes = await axios.post(
        'https://api.lightxeditor.com/external/api/v2/aivirtualtryon',
        { imageUrl: personUrl, outfitImageUrl: garmentUrl, segmentationType },
        { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: 15_000 }
    );
    if (tryOnRes.data?.statusCode !== 2000) {
        throw new Error(`LightX try-on failed: ${JSON.stringify(tryOnRes.data)}`);
    }
    const { orderId, maxRetriesAllowed = 5 } = tryOnRes.data.body;
    console.log(`💡 LightX: Order submitted (orderId: ${orderId}) — polling...`);

    // Poll for result
    const maxRetries = Math.max(maxRetriesAllowed, 10); // always allow at least 10 polls
    for (let i = 0; i < maxRetries; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await axios.post(
            'https://api.lightxeditor.com/external/api/v2/order-status',
            { orderId },
            { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: 15_000 }
        );
        const { status, output } = statusRes.data?.body || {};
        console.log(`  ↳ LightX: status=${status} (${i + 1}/${maxRetries})`);

        if (status === 'active' && output) {
            const b64 = await urlToBase64(output);
            console.log('✅ LightX: Virtual try-on complete');
            return { success: true, resultImage: b64, provider: 'lightx' };
        }
        if (status === 'failed') {
            throw new Error('LightX order failed (no credit deducted)');
        }
    }
    throw new Error('LightX: Timed out waiting for result');
}

// ── Provider 3: Replicate (activate with VTON_PROVIDER=replicate) ──────
/**
 * IMPORTANT: Replicate requires image URLs, not base64.
 * We upload images to Supabase Storage first, then pass the public URLs.
 * Cost: ~$0.023/run on A100 80GB, ~17 seconds average.
 *
 * To activate: Set VTON_PROVIDER=replicate in .env
 */
async function callReplicate(personImageBase64, clothImageBase64, category = 'upper_body') {
    if (!process.env.REPLICATE_API_KEY) throw new Error('REPLICATE_API_KEY not set — add it to .env');
    console.log('🔌 IDM-VTON: Uploading images to Supabase for Replicate...');

    // Replicate requires PUBLIC URLs — upload both images to Supabase first
    const [personUpload, clothUpload] = await Promise.all([
        uploadImage(personImageBase64, 'user-uploads', 'person'),
        uploadImage(clothImageBase64,  'user-uploads', 'cloth'),
    ]);

    if (!personUpload.success || !clothUpload.success) {
        throw new Error('Failed to upload images to Supabase for Replicate. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    console.log('🎽 IDM-VTON: Running via Replicate API (A100 GPU)...');

    // Start prediction with verified latest version
    const startRes = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
            version: REPLICATE_VERSION,
            input: {
                human_img:   personUpload.url,       // Public Supabase URL
                garm_img:    clothUpload.url,         // Public Supabase URL
                garment_des: 'clothing item for virtual try-on',
                category:    category,               // 'upper_body' | 'lower_body' | 'dresses'
                crop:        false,                  // Set true if image is not 3:4 ratio
                force_dc:    category === 'dresses', // DressCode mode for dresses
                steps:       30,
                seed:        42,
            },
        },
        {
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30_000,
        }
    );

    const predictionId = startRes.data?.id;
    if (!predictionId) throw new Error(`No prediction ID from Replicate: ${JSON.stringify(startRes.data)}`);

    // Poll every 3s — Replicate is fast (~17s on A100)
    let attempts = 0;
    const maxAttempts = 40; // 40 × 3s = 2 min max
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 3000));
        attempts++;

        const poll = await axios.get(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            { headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` } }
        );

        const { status, output, error } = poll.data;
        console.log(`  ↳ Replicate IDM-VTON: ${status} (${attempts}/${maxAttempts})`);

        if (status === 'succeeded') {
            if (!output) throw new Error('Replicate succeeded but no output URL');
            // Output is a single URI string
            const resultBase64 = await urlToBase64(output);
            console.log('✅ IDM-VTON: Replicate complete (~$0.023 used)');
            return { success: true, resultImage: resultBase64, provider: 'replicate' };
        }
        if (status === 'failed') {
            throw new Error(`Replicate failed: ${error || 'unknown error'}`);
        }
        if (status === 'canceled') {
            throw new Error('Replicate prediction was canceled');
        }
    }

    throw new Error('Replicate IDM-VTON timed out after 2 min');
}

// ── Main Export ───────────────────────────────────────────────────────────────

export async function generateTryOn({ personImage, clothImage, category = 'upper_body' }) {
    if (PROVIDER === 'replicate') {
        // Replicate as primary (for production)
        console.log('🎽 IDM-VTON: Using Replicate as primary (VTON_PROVIDER=replicate)');
        try {
            return await callReplicate(personImage, clothImage, category);
        } catch (err) {
            console.warn(`⚠️  Replicate failed: ${err.message} → Falling back to HF Space`);
            try {
                return await callHFSpace(personImage, clothImage, category);
            } catch (hfErr) {
                console.warn(`⚠️  HF Space also failed: ${hfErr.message} → Falling back to Gemini`);
                return await callGeminiImageGen(personImage, clothImage, category);
            }
        }
    }

    // Standard production chain: IDM-VTON → LightX → Gemini → Replicate
    console.log('🎽 Try-on: Starting (IDM-VTON → LightX → Gemini → Replicate)');
    try {
        return await callHFSpace(personImage, clothImage, category);
    } catch (hfErr) {
        console.warn(`⚠️  IDM-VTON failed: ${hfErr.message} → Trying LightX...`);
        try {
            return await callLightX(personImage, clothImage, category);
        } catch (lightxErr) {
            console.warn(`⚠️  LightX failed: ${lightxErr.message} → Trying Gemini...`);
            try {
                return await callGeminiImageGen(personImage, clothImage, category);
            } catch (geminiErr) {
                console.warn(`⚠️  Gemini failed: ${geminiErr.message} → Checking Replicate...`);
                const repKey = process.env.REPLICATE_API_KEY;
                const hasReplicate = repKey && !repKey.startsWith('your-') && repKey.length > 20;
                if (!hasReplicate) {
                    throw new Error(
                        `All providers failed.\nIDM-VTON: ${hfErr.message}\nLightX: ${lightxErr.message}\nGemini: ${geminiErr.message}`
                    );
                }
                return await callReplicate(personImage, clothImage, category);
            }
        }
    }
}
