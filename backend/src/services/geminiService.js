import axios from 'axios';

// ── Robust JSON parser for LLM output ────────────────────────────────────────
function repairAndParseJSON(text) {
    // 1. Try direct parse first (clean JSON from json_object mode)
    try { return JSON.parse(text.trim()); } catch {}

    // 2. Extract outermost { ... } block
    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON block found in response');
    let raw = text.slice(start, end + 1);

    // 3. Try parsing the extracted block as-is
    try { return JSON.parse(raw); } catch {}

    // 4. Escape literal newlines/tabs INSIDE quoted string values.
    //    LLMs often embed actual newlines in long strings which breaks JSON.parse.
    //    The regex captures quoted strings (preserving escaped chars) and replaces
    //    any bare newlines/tabs inside them with proper JSON escape sequences.
    raw = raw.replace(/"((?:[^"\\]|\\.)*)"/g, (_, content) =>
        '"' + content
            .replace(/\r?\n/g, '\\n')
            .replace(/\r/g,    '\\r')
            .replace(/\t/g,    '\\t') + '"'
    );

    // 5. Remove trailing commas before } or ]
    raw = raw.replace(/,(\s*[}\]])/g, '$1');

    // 6. Try parsing the repaired JSON
    try {
        return JSON.parse(raw);
    } catch (e) {
        // 7. Last resort: truncate to last complete field
        const truncated = raw.replace(/,?\s*"[^"]*"\s*:\s*[^,}]*$/, '') + '}';
        return JSON.parse(truncated);
    }
}

// ── Groq API (PRIMARY — free, fast, OpenAI-compatible) ────────────────────
// Sign up free at https://console.groq.com → API Keys → Create API Key
// Current available models as of April 2025 (deprecated ones removed)
const GROQ_MODELS = [
    'llama-3.3-70b-versatile',   // PRIMARY — best quality, 128k context
    'llama-3.1-8b-instant',      // fallback — fast, smaller
];

async function callGroq(prompt) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');

    let lastErr = null;
    for (const model of GROQ_MODELS) {
        try {
            console.log(`🚀 Groq: trying ${model}...`);
            const isLargeModel = model.includes('70b');
            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a fashion stylist API. You MUST respond with ONLY valid JSON — no markdown, no code fences, no explanation. Start your response with { and end with }.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.3,
                    max_tokens: 1500,
                    // JSON mode — only supported on larger models
                    ...(isLargeModel ? { response_format: { type: 'json_object' } } : {}),
                },
                {
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    timeout: 30000,
                }
            );

            const text = response.data?.choices?.[0]?.message?.content || '';
            console.log(`✅ Groq ${model} responded (${text.length} chars)`);
            return repairAndParseJSON(text);

        } catch (err) {
            const status = err.response?.status;
            const msg    = err.response?.data?.error?.message || err.message;
            console.warn(`⚠️  Groq ${model} failed [${status || 'network'}]: ${msg}`);
            if (status === 401 || status === 403) {
                throw new Error(`Groq auth failed (${status}): check GROQ_API_KEY in .env`);
            }
            lastErr = new Error(`Groq ${model}: ${msg}`);
        }
    }
    throw lastErr || new Error('All Groq models failed');
}

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE  = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Gemini API headers — uses x-goog-api-key header as per official docs.
 * Works with both AIzaSy and AQ. key formats.
 */
function geminiHeaders() {
    return {
        'x-goog-api-key': process.env.GEMINI_API_KEY,
        'Content-Type': 'application/json',
    };
}

function geminiUrl(model = GEMINI_MODEL, action = 'generateContent') {
    return `${GEMINI_BASE}/${model}:${action}`;
}

/**
 * Generate a personalized Style DNA guide using Gemini API.
 * Completely unique for each user based on their actual measurements.
 */
async function generateStyleDNA({
    gender,
    bodyType,
    heightCm,
    shoulderCm,
    waistCm,
    hipCm,
    occasion,
    confidence,
    skinTone,
}) {
    const heightCategory =
        heightCm < 160 ? 'petite (under 160cm)' :
        heightCm < 170 ? 'average height (160-170cm)' :
        heightCm < 178 ? 'tall (170-178cm)' :
        'very tall (178cm+)';

    const shoulderHipRatio = shoulderCm && hipCm ? (shoulderCm / hipCm).toFixed(2) : null;
    const waistHipRatio = waistCm && hipCm ? (waistCm / hipCm).toFixed(2) : null;

    const measurementBlock = [
        shoulderCm ? `Shoulder width: ${shoulderCm}cm` : null,
        waistCm    ? `Waist: ${waistCm}cm` : null,
        hipCm      ? `Hips: ${hipCm}cm` : null,
        shoulderHipRatio ? `Shoulder-to-hip ratio: ${shoulderHipRatio}` : null,
        waistHipRatio    ? `Waist-to-hip ratio: ${waistHipRatio}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are an expert personal fashion stylist with 15 years of experience.

USER PROFILE:
- Gender: ${gender}
- Body type: ${bodyType}
- Height: ${heightCm}cm (${heightCategory})
- Occasion: ${occasion}
${measurementBlock ? `- Measurements:\n  ${measurementBlock}` : ''}
${skinTone ? `- Skin tone: ${skinTone}` : ''}
- Scan confidence: ${Math.round((confidence || 0.8) * 100)}%

Write a PERSONALIZED Style DNA report. Rules:
1. Reference the ACTUAL measurements (e.g. "your ${shoulderCm}cm shoulders" not just "your shoulders")
2. Explain WHY each recommendation works for their specific ratios
3. Be specific to their height category — different advice for petite vs tall
4. Tailor everything to the ${occasion} occasion
5. Do NOT give generic body type advice — make it feel written just for this person
6. Never repeat the same phrasing you'd use for every ${bodyType} person

Format your response as valid JSON exactly like this (no markdown, no extra text):
{
  "summary": "5-sentence body shape summary referencing their actual measurements",
  "what_works": [
    {"item": "garment name", "reason": "why it works for their specific ratios/height"},
    {"item": "garment name", "reason": "..."},
    {"item": "garment name", "reason": "..."}
  ],
  "what_to_avoid": [
    {"item": "garment or style", "reason": "why it doesn't work for their proportions"},
    {"item": "garment or style", "reason": "..."}
  ],
  "colors": {
    "best": ["color1", "color2", "color3"],
    "occasion_note": "one sentence about color choice for this occasion"
  },
  "fabrics_patterns": "one paragraph on fabrics and patterns for this body type at this occasion",
  "search_terms": ["exact garment search term 1", "exact garment search term 2", "exact garment search term 3"]
}`;

    // ── METHOD 0: Groq (PRIMARY — free, fast, Llama 3.3 70B) ─────────────────
    try {
        const styleDNA = await callGroq(prompt);
        console.log('✅ Groq success — AI recommendations generated!');
        return { success: true, styleDNA, fromGemini: false, provider: 'groq' };
    } catch (groqErr) {
        console.warn(`⚠️  Groq FAILED (falling back to Gemini): ${groqErr.message}`);
        console.warn('    ↳ Check GROQ_API_KEY in .env and quota at console.groq.com');
    }

    // ── METHOD 1: Gemini SDK — reads GEMINI_API_KEY from env (official docs pattern) ──
    if (process.env.GEMINI_API_KEY) {
        try {
            const { GoogleGenAI } = await import('@google/genai');
            // Per official docs: new GoogleGenAI({}) — SDK reads GEMINI_API_KEY from env
            const ai = new GoogleGenAI({});
            console.log('🔑 Gemini: trying SDK (reads GEMINI_API_KEY from env)...');

            const response = await ai.models.generateContent({
                model:    'gemini-2.5-flash-preview-04-17',
                contents: prompt,
                config:   { temperature: 0.7, maxOutputTokens: 1200 },
            });

            const rawText   = response.text || '';
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in SDK response');

            const styleDNA = JSON.parse(jsonMatch[0]);
            console.log('✅ Gemini SDK success!');
            return { success: true, styleDNA, fromGemini: true };

        } catch (sdkErr) {
            console.warn(`⚠️  Gemini SDK failed: ${sdkErr.message}`);
        }
    }

    // ── METHOD 2: REST fallback (AIzaSy keys, header/Bearer/?key chain) ─────────
    const apiKey  = process.env.GEMINI_API_KEY;
    const endpoint= `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
    const body    = {
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
    };

    for (const method of [
        { name: 'x-goog-api-key', headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' } },
        { name: 'Bearer token',   headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } },
        { name: '?key= param',    url: `${endpoint}?key=${apiKey}`, headers: { 'Content-Type': 'application/json' } },
    ]) {
        try {
            console.log(`🔑 Gemini REST: ${method.name}`);
            const res     = await axios.post(method.url || endpoint, body, { headers: method.headers, timeout: 30000 });
            const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const match   = rawText.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('No JSON in response');
            const styleDNA = JSON.parse(match[0]);
            console.log(`✅ Gemini REST success via: ${method.name}`);
            return { success: true, styleDNA, fromGemini: true };
        } catch (err) {
            console.error(`❌ Gemini [${method.name}]: ${err.response?.status} — ${err.response?.data?.error?.message || err.message}`);
        }
    }

    // ── All methods failed ────────────────────────────────────────────────────
    console.warn('⚠️  All Gemini methods failed — using rule-based fallback');
    return { success: false, styleDNA: getFallbackStyleDNA({ gender, bodyType, occasion, heightCm }), fallback: true };
}


/**
 * Fallback style DNA when Gemini API unavailable.
 * Rule-based but still uses actual user data.
 */
function getFallbackStyleDNA({ gender, bodyType, occasion, heightCm }) {
    const heightCat = heightCm < 163 ? 'petite' : heightCm > 175 ? 'tall' : 'average';

    const rules = {
        hourglass: {
            summary: `Your balanced frame with defined waist is one of the most versatile silhouettes in fashion. Your proportions allow you to wear both fitted and flowing styles successfully.`,
            what_works: [
                { item: 'Wrap dress', reason: 'Follows and celebrates your natural curves' },
                { item: 'Belted blazer', reason: 'Emphasises your waist definition' },
                { item: 'High-waist trousers', reason: 'Maintains the shoulder-hip balance' }
            ],
            what_to_avoid: [
                { item: 'Shapeless shift dresses', reason: 'Hides your best feature — your waistline' },
                { item: 'Oversized boxy tops', reason: 'Disrupts your natural proportions' }
            ],
            search_terms: ['wrap midi dress', 'belted blazer set', 'high waist wide leg trousers']
        },
        pear: {
            summary: `Your hip-dominant frame is a classic proportion — wider below the waist with narrower shoulders. The key is creating visual balance by drawing attention upward.`,
            what_works: [
                { item: 'Structured shoulder blazer', reason: 'Adds width at top to balance hips' },
                { item: 'Dark wash wide-leg trousers', reason: 'Streamlines lower body while looking polished' },
                { item: 'Boat-neck or off-shoulder tops', reason: 'Widens the shoulder frame' }
            ],
            what_to_avoid: [
                { item: 'Low-rise jeans', reason: 'Drops visual center, emphasises hips' },
                { item: 'Cargo pockets at hip level', reason: 'Adds bulk where you don\'t need it' }
            ],
            search_terms: ['structured shoulder blazer', 'dark wide leg trousers', 'boat neck top']
        },
        'inverted-triangle': {
            summary: `Your broader shoulders taper to narrower hips — an athletic, powerful silhouette. The goal is to soften the shoulder line and add visual volume below the waist.`,
            what_works: [
                { item: 'V-neck or scoop neck tops', reason: 'Draw the eye inward and downward' },
                { item: 'A-line or full skirts', reason: 'Add volume to hip area for balance' },
                { item: 'Wide-leg palazzo pants', reason: 'Create the illusion of wider hips' }
            ],
            what_to_avoid: [
                { item: 'Padded shoulder blazers', reason: 'Exaggerates broad shoulders further' },
                { item: 'Skinny jeans with cropped tops', reason: 'Top-heavy imbalance' }
            ],
            search_terms: ['v neck blouse', 'a-line midi skirt', 'palazzo wide leg pants']
        },
        rectangle: {
            summary: `Your proportional frame — with shoulders, waist, and hips in close alignment — is incredibly versatile. The goal is to create dimension and the illusion of curves.`,
            what_works: [
                { item: 'Peplum or ruffle tops', reason: 'Create hip flare where there isn\'t one naturally' },
                { item: 'Fit-and-flare dresses', reason: 'Add waist definition and hip volume simultaneously' },
                { item: 'Statement belt on dresses', reason: 'Carves out a visible waistline' }
            ],
            what_to_avoid: [
                { item: 'Straight-cut shift dresses', reason: 'Reinforces the straight silhouette' },
                { item: 'Low-slung baggy jeans', reason: 'Further flattens the hip-waist difference' }
            ],
            search_terms: ['peplum top', 'fit and flare dress', 'belted wrap dress']
        },
        apple: {
            summary: `Your fuller midsection with narrower hips and shoulders creates an oval or rounded torso. Your legs are a key asset — and elongating the torso creates a slimmer overall look.`,
            what_works: [
                { item: 'Empire waist dress', reason: 'Nips in right below the bust, glides over the midsection' },
                { item: 'V-neck tops', reason: 'Create a vertical line that elongates the torso' },
                { item: 'Straight-leg or wide-leg trousers', reason: 'Highlight long legs without constricting' }
            ],
            what_to_avoid: [
                { item: 'Clingy bodycon styles', reason: 'Draw attention to midsection' },
                { item: 'Elastic-waist pants', reason: 'Add bulk at the widest point' }
            ],
            search_terms: ['empire waist dress', 'v neck blouse flowy', 'straight leg dress pants']
        }
    };

    const rule = rules[bodyType] || rules['rectangle'];
    const occasionColors = {
        formal: { best: ['navy', 'charcoal', 'deep burgundy'], occasion_note: 'Classic deep tones convey authority and elegance for formal settings.' },
        casual: { best: ['warm white', 'terracotta', 'denim blue'], occasion_note: 'Fresh, approachable colours work best for daytime casual wear.' },
        party: { best: ['emerald', 'gold', 'deep plum'], occasion_note: 'Rich jewel tones and metallics photograph beautifully under party lighting.' },
        office: { best: ['slate blue', 'camel', 'soft white'], occasion_note: 'Professional neutrals that project confidence without overwhelming.' },
        date: { best: ['blush rose', 'deep red', 'midnight blue'], occasion_note: 'Romantic shades that feel warm and intimate.' },
        wedding: { best: ['dusty rose', 'champagne', 'sage green'], occasion_note: 'Muted, elegant tones complement wedding colour palettes perfectly.' },
        traditional: { best: ['deep red', 'royal blue', 'forest green'], occasion_note: 'Rich, saturated colours reflect traditional occasion formality.' },
        sporty: { best: ['charcoal', 'cobalt', 'white'], occasion_note: 'Clean, contrasting tones for maximum visibility and energy.' },
    };

    return {
        summary: rule.summary,
        what_works: rule.what_works,
        what_to_avoid: rule.what_to_avoid,
        colors: occasionColors[occasion] || occasionColors['casual'],
        fabrics_patterns: `For ${occasion} occasions with a ${bodyType} frame, opt for fabrics with structure or drape depending on the look you want. Avoid extremely stiff fabrics that fight your natural shape.`,
        search_terms: rule.search_terms
    };
}

export { generateStyleDNA };
