import express from 'express';
import axios from 'axios';
import { generateStyleDNA } from '../services/geminiService.js';
import { searchClothing, searchShoppingLinks } from '../services/googleSearchService.js';
import { generateTryOn, warmHFSpace } from '../services/idmVtonService.js';
import { generateOOTD } from '../services/ootdiffusionService.js';
import { removeClothingBackground } from '../services/samService.js';
import { uploadImage, checkSupabaseConnection } from '../services/supabaseService.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * Convert any image (base64 data URL or https:// URL) to base64 data URL.
 * SAM and IDM-VTON always need base64, never raw URLs.
 */
async function ensureBase64(image) {
    if (!image) return image;
    // Already base64
    if (image.startsWith('data:')) return image;
    // It's a URL — fetch and convert
    try {
        const resp = await axios.get(image, { responseType: 'arraybuffer', timeout: 20000 });
        const mime = resp.headers['content-type'] || 'image/jpeg';
        const b64  = Buffer.from(resp.data).toString('base64');
        return `data:${mime};base64,${b64}`;
    } catch (e) {
        throw new Error(`Failed to fetch image from URL: ${e.message}`);
    }
}

/**
 * GET /api/ai/health
 * Quick health check for frontend status badge
 */
router.get('/health', async (req, res) => {
    const supabase = await checkSupabaseConnection();
    // Pre-warm the IDM-VTON HF Space in background (non-blocking)
    warmHFSpace().catch(() => {});
    res.json({
        status: 'online',
        services: {
            styleDNA:  'gemini + rule_fallback',
            tryOn:     process.env.VTON_PROVIDER || 'huggingface',
            ootd:      'ootdiffusion_hf + replicate_fallback',
            search:    process.env.GOOGLE_SEARCH_API_KEY ? 'google_custom_search' : 'not_configured',
            storage:   supabase.connected ? `supabase (${supabase.buckets?.join(', ')})` : 'base64_fallback',
            bgRemoval: 'rembg → bria_rmbg → removebg',
        }
    });
});

/**
 * POST /api/ai/style-dna
 * Generate personalized style DNA using Gemini API
 */
router.post('/style-dna', async (req, res) => {
    try {
        const {
            gender, bodyType, heightCm, shoulderCm, waistCm,
            hipCm, occasion, confidence, skinTone
        } = req.body;

        if (!gender || !bodyType || !occasion) {
            return res.status(400).json({
                success: false,
                error: 'gender, bodyType, and occasion are required'
            });
        }

        const result = await generateStyleDNA({
            gender, bodyType, heightCm, shoulderCm,
            waistCm, hipCm, occasion, confidence, skinTone
        });

        res.json({
            success: true,
            styleDNA: result.styleDNA,
            fromGemini: result.success,
            fallback: result.fallback || false,
        });

    } catch (err) {
        console.error('Style DNA error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ai/match-collection
 * Check if internal product catalog matches the style DNA recommendations
 */
router.post('/match-collection', async (req, res) => {
    try {
        const { searchTerms = [], gender, occasion, bodyType } = req.body;

        // Fetch all products from DB
        let products = [];
        try {
            products = await Product.find({}).lean();
        } catch {
            // If DB unavailable, return no matches
            return res.json({ success: true, matches: [], hasMatches: false });
        }

        // Score each product against search terms and metadata
        const scored = products.map(p => {
            let score = 0;
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const cat = (p.category || '').toLowerCase();
            const tags = (p.tags || []).join(' ').toLowerCase();

            searchTerms.forEach(term => {
                const t = term.toLowerCase();
                if (name.includes(t)) score += 3;
                if (desc.includes(t)) score += 2;
                if (tags.includes(t)) score += 2;
                if (cat.includes(t)) score += 1;
            });

            // Gender filter
            if (p.gender && p.gender !== gender && p.gender !== 'unisex') score -= 5;

            // Occasion filter
            if (p.occasions && !p.occasions.includes(occasion)) score -= 2;

            // Body type filter
            if (p.bodyTypes && !p.bodyTypes.includes(bodyType)) score -= 1;

            return { ...p, matchScore: Math.max(0, score) };
        });

        // Sort by score. If nothing scores > 0 (no search terms / no Gemini),
        // return the full collection so users always see products
        const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
        const hasHighScore = sorted.some(p => p.matchScore >= 2);
        const matches = hasHighScore
            ? sorted.filter(p => p.matchScore >= 2).slice(0, 12)
            : sorted.slice(0, 12); // Show all (up to 12) if no strong match

        res.json({
            success: true,
            matches,
            hasMatches: matches.length > 0,
            totalProducts: products.length,
        });

    } catch (err) {
        console.error('Match collection error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ai/search-clothing
 * Brave Search fallback when collection has no matches
 */
router.post('/search-clothing', async (req, res) => {
    try {
        const { gender, bodyType, occasion, searchTerms, suggestedColors } = req.body;

        const [imageResults, shoppingLinks] = await Promise.allSettled([
            searchClothing({ gender, bodyType, occasion, searchTerms, suggestedColors }),
            searchShoppingLinks({ gender, bodyType, occasion, searchTerms }),
        ]);

        res.json({
            success: true,
            images: imageResults.status === 'fulfilled' ? imageResults.value : { results: [] },
            shopping: shoppingLinks.status === 'fulfilled' ? shoppingLinks.value : { results: [] },
        });

    } catch (err) {
        console.error('Brave search error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ai/try-on
 * IDM-VTON virtual try-on — auto-strips clothing background first
 */
router.post('/try-on', async (req, res) => {
    try {
        const { personImage: personRaw, clothImage: clothRaw, category = 'upper_body' } = req.body;

        if (!personRaw || !clothRaw) {
            return res.status(400).json({
                success: false,
                error: 'personImage and clothImage are required'
            });
        }

        // Convert URLs to base64 (SAM and IDM-VTON require base64, not URLs)
        const personImage = await ensureBase64(personRaw);
        const clothImage  = await ensureBase64(clothRaw);

        // 1. Remove clothing background
        let cleanClothImage = clothImage;
        try {
            const bgResult = await removeClothingBackground(clothImage);
            cleanClothImage = bgResult.resultImage;
            console.log('✅ Background removed via:', bgResult.provider);
        } catch (bgErr) {
            console.warn('⚠️  BG removal failed, using original image:', bgErr.message);
        }

        // 2. Generate try-on
        const result = await generateTryOn({ personImage, clothImage: cleanClothImage, category });

        // 3. Upload result
        const stored = await uploadImage(result.resultImage, 'try-on-results', 'idmvton');

        res.json({
            success:      true,
            resultImage:  stored.url,
            resultStored: stored.success,
            resultPath:   stored.path || null,
            provider:     result.provider,
        });

    } catch (err) {
        console.error('Try-on error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ai/remove-bg
 * Standalone background removal endpoint (clothing or any image)
 */
router.post('/remove-bg', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ success: false, error: 'image required' });

        const result = await removeClothingBackground(image);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/ai/try-on-ootd
 * OOTDiffusion — also strips bg before generating
 */
router.post('/try-on-ootd', async (req, res) => {
    try {
        const { personImage: personRaw, clothImage: clothRaw, category = 'upper_body' } = req.body;

        if (!personRaw || !clothRaw) {
            return res.status(400).json({ success: false, error: 'personImage and clothImage are required' });
        }

        // Convert URLs to base64
        const personImage = await ensureBase64(personRaw);
        const clothImage  = await ensureBase64(clothRaw);

        // 1. Remove clothing background (non-fatal)
        let cleanClothImage = clothImage;
        try {
            const bgResult = await removeClothingBackground(clothImage);
            cleanClothImage = bgResult.resultImage;
        } catch (bgErr) {
            console.warn('⚠️  BG removal failed, using original image:', bgErr.message);
        }

        // 2. Generate OOTDiffusion result
        const result = await generateOOTD({ personImage, clothImage: cleanClothImage, category });

        // 3. Upload result
        const stored = await uploadImage(result.resultImage, 'try-on-results', 'ootd');

        res.json({
            success:      true,
            resultImage:  stored.url,
            resultStored: stored.success,
            resultPath:   stored.path || null,
            provider:     result.provider,
            model:        result.model,
        });

    } catch (err) {
        console.error('OOTDiffusion error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
