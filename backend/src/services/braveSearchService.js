/**
 * Brave Search Service
 * Free tier: 2,000 queries/month
 * Sign up: https://brave.com/search/api/
 * Add BRAVE_API_KEY to .env and Render env vars
 */

const axios = require('axios');

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const BRAVE_BASE_URL = 'https://api.search.brave.com/res/v1/images/search';

/**
 * Build a highly specific clothing search query from style DNA.
 * Hardcoded format to ensure relevant product image results.
 */
function buildClothingQuery(params) {
    const {
        gender,
        bodyType,
        occasion,
        itemType,        // e.g. "high-waist wide-leg trousers"
        suggestedColor,  // e.g. "dark navy"
    } = params;

    const genderLabel = gender === 'male' ? 'men\'s' :
                        gender === 'female' ? 'women\'s' : '';

    // Highly specific query → returns product photos, not lifestyle shoots
    return `${genderLabel} ${suggestedColor || ''} ${itemType} ${occasion} outfit ` +
           `${bodyType} body type product photo white background -pinterest -instagram`.trim();
}

/**
 * Search for clothing items using Brave API.
 * @param {object} params - { gender, bodyType, occasion, searchTerms[] }
 * @returns {object} { success, results[], query }
 */
async function searchClothing(params) {
    const { gender, bodyType, occasion, searchTerms = [] } = params;

    if (!BRAVE_API_KEY) {
        console.warn('⚠️  BRAVE_API_KEY not set — returning empty search results');
        return { success: false, error: 'BRAVE_API_KEY_MISSING', results: [] };
    }

    const results = [];

    // Search for each recommended search term (max 3 to save quota)
    const termsToSearch = searchTerms.slice(0, 3);

    for (const term of termsToSearch) {
        const query = buildClothingQuery({
            gender,
            bodyType,
            occasion,
            itemType: term,
            suggestedColor: params.suggestedColors?.[0] || '',
        });

        try {
            const response = await axios.get(BRAVE_BASE_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': BRAVE_API_KEY,
                },
                params: {
                    q: query,
                    count: 5,
                    safesearch: 'moderate',
                },
                timeout: 8000,
            });

            const images = response.data?.results || [];
            images.forEach(img => {
                results.push({
                    title: img.title || term,
                    imageUrl: img.thumbnail?.src || img.url,
                    sourceUrl: img.url,
                    sourcePage: img.source || '',
                    searchTerm: term,
                    query,
                });
            });

        } catch (err) {
            console.error(`Brave search error for "${term}":`, err.message);
        }
    }

    return {
        success: results.length > 0,
        results: results.slice(0, 12), // max 12 results total
        total: results.length,
        searchedTerms: termsToSearch,
    };
}

/**
 * Web search for product pages (not images).
 * Used to give the user shopping links.
 */
async function searchShoppingLinks(params) {
    const { gender, bodyType, occasion, searchTerms = [] } = params;

    if (!BRAVE_API_KEY) {
        return { success: false, error: 'BRAVE_API_KEY_MISSING', results: [] };
    }

    const WEB_URL = 'https://api.search.brave.com/res/v1/web/search';
    const results = [];

    for (const term of searchTerms.slice(0, 2)) {
        const query = `buy ${gender === 'female' ? 'women\'s' : 'men\'s'} ${term} online ${occasion}`;

        try {
            const response = await axios.get(WEB_URL, {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': BRAVE_API_KEY,
                },
                params: {
                    q: query,
                    count: 4,
                    safesearch: 'moderate',
                    result_filter: 'web',
                },
                timeout: 8000,
            });

            const webResults = response.data?.web?.results || [];
            webResults.forEach(r => {
                results.push({
                    title: r.title,
                    url: r.url,
                    description: r.description,
                    searchTerm: term,
                });
            });

        } catch (err) {
            console.error(`Brave web search error:`, err.message);
        }
    }

    return {
        success: results.length > 0,
        results: results.slice(0, 8),
    };
}

module.exports = { searchClothing, searchShoppingLinks, buildClothingQuery };
