/**
 * Search Service
 * ==============
 * PRIMARY:  Serper.dev  — 2,500 free/month, no credit card, instant results
 * FALLBACK: Google Custom Search — 100/day (quota-protected with caching)
 * LAST:     Curated retail links — always works, no API needed
 *
 * Serper: https://serper.dev → Sign up free → API Keys → Copy key
 * Google: https://console.cloud.google.com → Custom Search API key
 */

import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/customsearch/v1';

// ── Serper.dev search (PRIMARY) ──────────────────────────────────────────────
async function searchWithSerper(query, gender, bodyType, occasion, term) {
    const key = process.env.SERPER_API_KEY;
    if (!key) throw new Error('SERPER_API_KEY not set');

    console.log(`🔍 Serper: "${query}"`);

    const response = await axios.post(
        'https://google.serper.dev/images',
        { q: query, num: 8, gl: 'in', hl: 'en' },
        { headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    const images = response.data?.images || [];
    console.log(`  ↳ Serper: ${images.length} results for "${query}"`);

    return images.map(img => ({
        title:      img.title     || term,
        imageUrl:   img.imageUrl  || img.thumbnailUrl,
        sourceUrl:  img.link      || img.imageUrl,
        sourcePage: img.source    || img.domain || '',
        searchTerm: term,
        query,
        provider:   'serper',
    })).filter(r => r.imageUrl);
}


// ── In-memory cache ─────────────────────────────────────────────────────────
// Key: "gender|bodyType|occasion|term"  Value: { results, ts }
const _cache     = new Map();
const CACHE_TTL  = 60 * 60 * 1000; // 1 hour

function cacheKey({ gender, bodyType, occasion, term }) {
    return `${gender}|${bodyType}|${occasion}|${term}`;
}

function getCached(key) {
    const entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
    console.log(`📦 Google CSE: cache hit for "${key}"`);
    return entry.results;
}

function setCache(key, results) {
    _cache.set(key, { results, ts: Date.now() });
}

// ── Curated fallback — clean shop links (no misleading images) ───────────────
function getCuratedFallback(gender, occasion, term = '') {
    const g   = gender === 'female' ? 'women' : 'men';
    const q   = encodeURIComponent(`${g} ${term || occasion} outfit`);
    const tag = (term || occasion).toUpperCase();

    return [
        {
            title:      `${g} ${term || occasion} – Myntra`,
            imageUrl:   null,
            sourceUrl:  `https://www.myntra.com/${g}?rawQuery=${q}`,
            sourcePage: 'myntra.com',
            searchTerm: term || occasion,
            isFallback: true, isShopLink: true,
            icon: '🛍️', label: 'Shop on Myntra', tag,
        },
        {
            title:      `${g} ${term || occasion} – Amazon`,
            imageUrl:   null,
            sourceUrl:  `https://www.amazon.in/s?k=${q}`,
            sourcePage: 'amazon.in',
            searchTerm: term || occasion,
            isFallback: true, isShopLink: true,
            icon: '📦', label: 'Shop on Amazon', tag,
        },
        {
            title:      `${g} ${term || occasion} – Ajio`,
            imageUrl:   null,
            sourceUrl:  `https://www.ajio.com/search/?text=${q}`,
            sourcePage: 'ajio.com',
            searchTerm: term || occasion,
            isFallback: true, isShopLink: true,
            icon: '✨', label: 'Shop on Ajio', tag,
        },
        {
            title:      `${g} ${term || occasion} – Flipkart`,
            imageUrl:   null,
            sourceUrl:  `https://www.flipkart.com/search?q=${q}`,
            sourcePage: 'flipkart.com',
            searchTerm: term || occasion,
            isFallback: true, isShopLink: true,
            icon: '💛', label: 'Shop on Flipkart', tag,
        },
    ];
}

// ── Single search call ──────────────────────────────────────────────────────
async function searchOneTerm({ apiKey, cx, query, gender, bodyType, occasion, term }) {
    const key = cacheKey({ gender, bodyType, occasion, term });
    const cached = getCached(key);
    if (cached) return cached;

    const response = await axios.get(BASE_URL, {
        params: { key, cx, q: query, searchType: 'image', num: 8, safe: 'active', imgType: 'photo', imgSize: 'large' },
        timeout: 10000,
    });

    const items = response.data?.items || [];
    console.log(`  ↳ Got ${items.length} results for "${query}"`);

    const results = items.map(img => ({
        title:      img.title || term,
        imageUrl:   img.link,
        sourceUrl:  img.image?.contextLink || img.link,
        sourcePage: img.displayLink || '',
        searchTerm: term,
        query,
    }));

    setCache(key, results);
    return results;
}

/**
 * Search for clothing images.
 * Priority: Serper.dev → Google CSE → Curated retail links
 */
export async function searchClothing({ gender, bodyType, occasion, searchTerms = [], suggestedColors = [] }) {
    const genderLabel = gender === 'male' ? 'men' : gender === 'female' ? 'women' : '';
    const term        = searchTerms[0] || `${occasion} outfit`;
    const color       = suggestedColors?.[0] || '';
    const query       = [genderLabel, color, term].filter(Boolean).join(' ').trim();

    // ── 1. Serper.dev (primary — 2,500 free/month) ───────────────────────────
    if (process.env.SERPER_API_KEY) {
        try {
            const results = await searchWithSerper(query, gender, bodyType, occasion, term);
            if (results.length > 0) {
                return { success: true, results: results.slice(0, 8), total: results.length, provider: 'serper' };
            }
        } catch (serperErr) {
            console.warn(`⚠️  Serper failed: ${serperErr.message} — trying Google CSE...`);
        }
    }

    // ── 2. Google CSE (fallback — 100/day with cache) ────────────────────────
    const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const GOOGLE_CX      = process.env.GOOGLE_SEARCH_CX;

    if (GOOGLE_API_KEY && GOOGLE_CX) {
        console.log(`🔍 Google CSE: "${query}" (fallback)`);
        try {
            const results = await searchOneTerm({ apiKey: GOOGLE_API_KEY, cx: GOOGLE_CX, query, gender, bodyType, occasion, term });
            if (results.length > 0) {
                return { success: true, results: results.slice(0, 8), total: results.length, provider: 'google_custom_search' };
            }
        } catch (err) {
            const status = err.response?.status;
            const msg    = err.response?.data?.error?.message || err.message;
            if (status === 429) {
                console.warn('⚠️  Google CSE quota exceeded — using curated fallback');
            } else {
                console.error(`Google CSE error: ${status} — ${msg}`);
            }
        }
    }

    // ── 3. Curated retail fallback (always works) ────────────────────────────
    console.warn('⚠️  All search providers failed — using curated retail links');
    const fallback = getCuratedFallback(gender, occasion);
    return { success: true, results: fallback, total: fallback.length, provider: 'curated_fallback', isFallback: true };
}

/**
 * Shopping links search — uses cache aggressively, skips if quota likely exceeded.
 */
export async function searchShoppingLinks({ gender, bodyType, occasion, searchTerms = [] }) {
    const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
    const GOOGLE_CX      = process.env.GOOGLE_SEARCH_CX;

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
        return { success: false, error: 'GOOGLE_SEARCH_NOT_CONFIGURED', results: [] };
    }

    const genderLabel = gender === 'female' ? 'women' : 'men';
    const term        = searchTerms[0] || occasion;
    const query       = `${genderLabel} ${term}`;
    const key         = cacheKey({ gender, bodyType, occasion, term: `web_${term}` });

    const cached = getCached(key);
    if (cached) return { success: true, results: cached, provider: 'google_custom_search_cached' };

    console.log(`🛍️ Google CSE shopping: "${query}"`);

    try {
        const response = await axios.get(BASE_URL, {
            params: { key: GOOGLE_API_KEY, cx: GOOGLE_CX, q: query, num: 6, safe: 'active' },
            timeout: 10000,
        });

        const items = (response.data?.items || []).map(r => ({
            title: r.title, url: r.link, description: r.snippet, displayUrl: r.displayLink, searchTerm: term,
        }));

        setCache(key, items);
        return { success: items.length > 0, results: items.slice(0, 6), provider: 'google_custom_search' };

    } catch (err) {
        const status = err.response?.status;
        if (status === 429) {
            console.warn('⚠️  Google CSE shopping quota exceeded — skipping');
            return { success: false, results: [], quotaExceeded: true };
        }
        console.error(`Google shopping error: ${err.response?.data?.error?.message || err.message}`);
        return { success: false, results: [] };
    }
}

export { };
