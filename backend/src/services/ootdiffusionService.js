/**
 * OOTDiffusion Service — Option C (AI Generation)
 * =================================================
 * Diffusion-based virtual try-on with 3 providers + Gemini fallback:
 *
 *  1. HuggingFace Space levihsu/OOTDiffusion  (free, @gradio/client)
 *  2. Gemini Image Generation                  (free fallback, uses GEMINI_API_KEY)
 *  3. Replicate cuuupid/ootdiffusion           (paid, ready when API key added)
 *
 * How it differs from IDM-VTON:
 *  – IDM-VTON: warp-based, exact cloth texture reproduction
 *  – OOTDiffusion: diffusion-based, more natural lifestyle result
 */

import { Client }   from '@gradio/client';
import axios        from 'axios';
import { uploadImage } from './supabaseService.js';

// NOTE: Do NOT read env vars at module level — dotenv hasn't loaded yet in ESM.
// All env reads happen inside functions at call time.

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const REPLICATE_MODEL   = 'cuuupid/ootdiffusion:8600197b7d047f5c8d6eda51b16a2b6b5d8e3f9b8a5b2a9d6e1f3c8b5e2a1d7';
const GEMINI_BASE       = 'https://generativelanguage.googleapis.com/v1beta/models';

const GEMINI_IMAGE_ENDPOINT = `${GEMINI_BASE}/gemini-2.0-flash-exp-image-generation:generateContent`;
const geminiImageHeaders = () => ({
    'x-goog-api-key': process.env.GEMINI_API_KEY,
    'Content-Type': 'application/json',
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function base64ToBlob(dataUrl) {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const rawBase64 = matches ? matches[2] : dataUrl;
    const buffer = Buffer.from(rawBase64, 'base64');
    return new Blob([buffer], { type: mimeType });
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
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
    const b64 = Buffer.from(res.data).toString('base64');
    const mime = res.headers['content-type'] || 'image/png';
    return `data:${mime};base64,${b64}`;
}

function getCategoryString(category = '') {
    const cat = category.toLowerCase();
    if (cat.includes('bottom') || cat.includes('pant') || cat.includes('skirt') || cat.includes('trouser')) return 'lowerbody';
    if (cat.includes('dress') || cat.includes('jumpsuit')) return 'dress';
    return 'upperbody';
}

// ── Provider: HuggingFace Space ───────────────────────────────────────────────

async function callOOTDHFSpace(personImageBase64, clothImageBase64, category = 'upper_body') {
    console.log('🔌 OOTDiffusion: Connecting to HuggingFace Space levihsu/OOTDiffusion...');

    const client = await Client.connect('levihsu/OOTDiffusion', {
        hf_token: process.env.HF_INFERENCE_API_KEY || undefined,
        status_callback: (s) => {
            if (s.stage !== 'complete') console.log(`  ↳ OOTDiffusion Space: ${s.stage} — ${s.message || ''}`);
        },
    });

    const personBlob = base64ToBlob(personImageBase64);
    const clothBlob  = base64ToBlob(clothImageBase64);
    const catStr     = getCategoryString(category);

    console.log(`🎨 OOTDiffusion: Running prediction (${catStr})...`);

    // OOTDiffusion is slower — 5 min timeout
    const predict = client.predict('/process_dc', {
        vton_img:    personBlob,
        garm_img:    clothBlob,
        category:    catStr,
        n_samples:   1,
        n_steps:     20,
        image_scale: 2.0,
        seed:        -1,
    });

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OOTDiffusion HF Space timed out after 5 min')), 300_000)
    );

    const result = await Promise.race([predict, timeout]);

    // OOTDiffusion returns a gallery — first image is the result
    const outputData = result?.data?.[0];
    const outputUrl = extractUrl(outputData);
    if (!outputUrl) throw new Error('OOTDiffusion HF Space returned no image data');

    const resultBase64 = await urlToBase64(outputUrl);
    console.log('✅ OOTDiffusion: HuggingFace generation complete');

    return {
        success:     true,
        resultImage: resultBase64,
        provider:    'ootdiffusion_hf',
        model:       'OOTDiffusion',
    };
}

// ── Provider: Replicate ───────────────────────────────────────────────────────

// ── Provider 2: Gemini Image Generation (Fallback) ───────────────────────────
/**
 * Locked prompt — user cannot change this. Ensures consistent try-on output.
 */
async function callGeminiImageGen(personImageBase64, clothImageBase64, category = 'upper_body') {
    const apiKey = process.env.GEMINI_API_KEY; // read at call time, after dotenv loads
    if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');
    console.log('🤖 OOTDiffusion: Trying Gemini image generation fallback...');

    const personRaw = personImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const clothRaw  = clothImageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Locked prompt — produces the best try-on result
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

    const parts     = response.data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData?.data);
    if (!imagePart) throw new Error('Gemini returned no image data');

    const mime = imagePart.inlineData.mimeType || 'image/png';
    const resultBase64 = `data:${mime};base64,${imagePart.inlineData.data}`;

    console.log('✅ OOTDiffusion: Gemini image generation complete');
    return {
        success:     true,
        resultImage: resultBase64,
        provider:    'gemini_image_gen',
        model:       'OOTDiffusion (Gemini fallback)',
        note:        'Generated via Gemini 2.0 Flash (HF Space unavailable)',
    };
}

// ── Provider 3: Replicate ─────────────────────────────────────────────────────
async function callOOTDReplicate(personImageBase64, clothImageBase64, category = 'upper_body') {
    if (!REPLICATE_API_KEY) throw new Error('REPLICATE_API_KEY not set in .env');
    console.log('🔌 OOTDiffusion: Uploading to Supabase for Replicate...');

    const catStr = getCategoryString(category);

    // Replicate requires public URLs — upload to Supabase first
    const [personUpload, clothUpload] = await Promise.all([
        uploadImage(personImageBase64, 'user-uploads', 'person'),
        uploadImage(clothImageBase64,  'user-uploads', 'cloth'),
    ]);

    if (!personUpload.success || !clothUpload.success) {
        throw new Error('Failed to upload images to Supabase for Replicate.');
    }

    const startRes = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
            version: REPLICATE_MODEL,
            input: {
                vton_img:    personUpload.url,
                garm_img:    clothUpload.url,
                category:    catStr,
                n_samples:   1,
                n_steps:     20,
                image_scale: 2.0,
                seed:        -1,
            },
        },
        {
            headers: {
                Authorization: `Token ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30_000,
        }
    );

    const predictionId = startRes.data?.id;
    if (!predictionId) throw new Error('No prediction ID from Replicate');

    // Poll every 5s (OOTDiffusion is slower than IDM-VTON)
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));

        const poll   = await axios.get(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            { headers: { Authorization: `Token ${REPLICATE_API_KEY}` } }
        );
        const status = poll.data?.status;
        console.log(`  ↳ Replicate OOTDiffusion: ${status} (attempt ${i + 1}/60)`);

        if (status === 'succeeded') {
            const output    = poll.data?.output;
            const outputUrl = Array.isArray(output) ? output[0] : output;
            if (!outputUrl) throw new Error('Replicate returned no output URL');

            const resultBase64 = await urlToBase64(outputUrl);
            console.log('✅ OOTDiffusion: Replicate generation complete');
            return { success: true, resultImage: resultBase64, provider: 'ootdiffusion_replicate', model: 'OOTDiffusion' };
        }
        if (status === 'failed') throw new Error(`Replicate OOTDiffusion failed: ${poll.data?.error || 'unknown'}`);
    }

    throw new Error('Replicate OOTDiffusion timed out after 5 min');
}

// ── Main Export ───────────────────────────────────────────────────────────────
//
// ⛔ VTON_PROVIDER env variable is intentionally IGNORED here.
//    Setting VTON_PROVIDER=replicate only makes Replicate PRIMARY for IDM-VTON.
//    OOTDiffusion always follows the fixed order below — never changes.
//
// Fixed order (cannot be changed via env):
//   1. HuggingFace Space  → free
//   2. Gemini Image Gen   → free (primary fallback)
//   3. Replicate          → paid (only if both above fail AND key is set)

export async function generateOOTD({ personImage, clothImage, category = 'upper_body' }) {
    console.log('🎨 OOTDiffusion: Starting generation (fixed: HF → Gemini → Replicate)...');

    // 1. HuggingFace Space (always first, free)
    try {
        return await callOOTDHFSpace(personImage, clothImage, category);
    } catch (hfErr) {
        console.warn(`⚠️  OOTDiffusion HF failed: ${hfErr.message}`);
    }

    // 2. Gemini Image Generation (always second, free)
    try {
        console.log('🔄 OOTDiffusion: Gemini image generation (fallback)...');
        return await callGeminiImageGen(personImage, clothImage, category);
    } catch (geminiErr) {
        console.warn(`⚠️  Gemini fallback failed: ${geminiErr.message}`);
    }

    // 3. Replicate — only used if both above fail AND key is present
    //    This is the last resort, not the primary.
    if (!process.env.REPLICATE_API_KEY) {
        throw new Error(
            'OOTDiffusion: HF Space and Gemini both failed. ' +
            'Add REPLICATE_API_KEY to .env to enable last-resort fallback.'
        );
    }
    console.log('🔄 OOTDiffusion: Replicate (last resort)...');
    return await callOOTDReplicate(personImage, clothImage, category);
}
