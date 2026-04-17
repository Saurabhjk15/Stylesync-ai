/**
 * Background Removal Service
 * ===========================
 * Removes the background from clothing images before sending to IDM-VTON.
 * Clean white-background clothing = significantly better try-on quality.
 *
 * Primary:  BRIA AI RMBG-1.4 via HuggingFace Inference API (free for non-commercial)
 * Fallback: Remove.bg API ($0.02/image, 50 credits free)
 * Local:    Python rembg library via our own ML service (zero cost, no rate limit)
 */

import axios from 'axios';
import FormData from 'form-data';

// ⚠️  Do NOT read process.env here — in ESM, module-level code runs before
// dotenv.config() in server.js, so all keys read here would be undefined.
// Keys are read inside each function at call time instead.
const ML_SERVICE_URL = () => process.env.ML_SERVICE_URL || 'http://localhost:5000';

/**
 * PRIMARY: BRIA RMBG-1.4 via HuggingFace Inference API
 * Free even without key (rate limited), faster with key.
 * Model: briaai/RMBG-1.4 — state-of-the-art for product/clothing images
 */
async function removeBgHuggingFace(imageBase64) {
    const HF_API_KEY = process.env.HF_INFERENCE_API_KEY; // read at call time
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const headers = {
        'Content-Type': 'application/octet-stream',
    };
    if (HF_API_KEY) {
        headers['Authorization'] = `Bearer ${HF_API_KEY}`;
    }

    const response = await axios.post(
        'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
        imageBuffer,
        {
            headers,
            responseType: 'arraybuffer',
            timeout: 30000,
        }
    );

    const resultBase64 = Buffer.from(response.data).toString('base64');
    return `data:image/png;base64,${resultBase64}`;
}

/**
 * SECONDARY: Our own ML service running rembg locally
 * Zero cost, no rate limit — requires `pip install rembg` on the ML service
 */
async function removeBgMLService(imageBase64) {
    const response = await axios.post(
        `${ML_SERVICE_URL()}/remove-bg`,
        { image: imageBase64 },
        { timeout: 20000 }
    );
    if (response.data?.result) return response.data.result;
    throw new Error('ML service bg removal returned empty result');
}

/**
 * FALLBACK: Remove.bg API
 * 50 free credits/month, $0.02/image after that
 */
async function removeBgRemoveBgAPI(imageBase64) {
    const REMOVEBG_KEY = process.env.REMOVEBG_API_KEY; // read at call time
    if (!REMOVEBG_KEY) throw new Error('REMOVEBG_API_KEY not set');

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const form = new FormData();
    form.append('image_file', imageBuffer, { filename: 'clothing.jpg', contentType: 'image/jpeg' });
    form.append('size', 'auto');

    const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        form,
        {
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': REMOVEBG_KEY,
            },
            responseType: 'arraybuffer',
            timeout: 30000,
        }
    );

    const resultBase64 = Buffer.from(response.data).toString('base64');
    return `data:image/png;base64,${resultBase64}`;
}

/**
 * Main entry — tries providers in order until one succeeds.
 * If all fail, returns the original image (try-on still works, just slightly less accurate).
 */
async function removeClothingBackground(imageBase64) {
    // Try 1: ML service (fastest if running locally or on Render)
    try {
        console.log('🪄 Background removal: trying ML service (rembg)...');
        const result = await removeBgMLService(imageBase64);
        console.log('✅ Background removed via rembg (ML service)');
        return { success: true, resultImage: result, provider: 'rembg_local' };
    } catch (e1) {
        console.warn(`⚠️  ML service bg removal failed: ${e1.message}`);
    }

    // Try 2: HuggingFace BRIA RMBG
    try {
        console.log('🪄 Background removal: trying HuggingFace BRIA RMBG...');
        const result = await removeBgHuggingFace(imageBase64);
        console.log('✅ Background removed via BRIA RMBG (HuggingFace)');
        return { success: true, resultImage: result, provider: 'bria_rmbg_hf' };
    } catch (e2) {
        console.warn(`⚠️  HuggingFace BRIA RMBG failed: ${e2.message}`);
    }

    // Try 3: Remove.bg
    try {
        console.log('🪄 Background removal: trying Remove.bg API...');
        const result = await removeBgRemoveBgAPI(imageBase64);
        console.log('✅ Background removed via Remove.bg');
        return { success: true, resultImage: result, provider: 'removebg_api' };
    } catch (e3) {
        console.warn(`⚠️  Remove.bg failed: ${e3.message}`);
    }

    // All failed — return original (graceful degradation)
    console.warn('⚠️  All background removal providers failed. Using original image.');
    return { success: false, resultImage: imageBase64, provider: 'original_fallback' };
}

export { removeClothingBackground };
