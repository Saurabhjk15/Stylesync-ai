/**
 * Supabase Storage Service
 * =========================
 * Stores AI-generated try-on results, user uploads, and bg-removed images.
 * Returns permanent public URLs instead of huge base64 strings.
 *
 * Free tier: 1GB storage, 2GB bandwidth/month — zero cost for a demo
 *
 * Setup:
 *  1. supabase.com → New project → Project API → copy URL + anon key
 *  2. Storage → New bucket → name: 'try-on-results' → Public: ON
 *  3. Storage → New bucket → name: 'user-uploads'   → Public: ON
 *  4. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env
 */

import { createClient } from '@supabase/supabase-js';


let supabase = null;

function getClient() {
    // Read at call time — NOT at module load (dotenv hasn't run yet in ESM at module init)
    const url = process.env.SUPABASE_URL;
    // Prefer service role key (bypasses RLS) — fall back to anon key
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    if (!supabase) {
        supabase = createClient(url, key, {
            auth: { persistSession: false },
        });
    }
    return supabase;
}

/**
 * Upload a base64 image to a Supabase Storage bucket.
 * Returns a permanent public URL.
 *
 * @param {string} base64Image  - Data URL (data:image/png;base64,...) or raw base64
 * @param {string} bucket       - Bucket name: 'try-on-results' | 'user-uploads'
 * @param {string} [prefix]     - Folder prefix e.g. 'idmvton' | 'ootd' | 'upload'
 * @returns {{ success, url, path, error }}
 */
export async function uploadImage(base64Image, bucket = 'try-on-results', prefix = 'result') {
    const client = getClient();

    if (!client) {
        console.warn('⚠️  Supabase not configured — returning base64 as-is');
        return { success: false, url: base64Image, error: 'SUPABASE_NOT_CONFIGURED' };
    }

    try {
        // Strip the data URL prefix if present
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
        const mimeType = matches ? matches[1] : 'image/png';
        const rawBase64 = matches ? matches[2] : base64Image;
        const extension = mimeType.split('/')[1] || 'png';

        // Create unique filename
        const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`;
        const filePath = `${prefix}/${filename}`;

        // Convert base64 to Uint8Array
        const binaryStr = atob(rawBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }

        // Upload to Supabase Storage
        const { data, error } = await client.storage
            .from(bucket)
            .upload(filePath, bytes, {
                contentType: mimeType,
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = client.storage
            .from(bucket)
            .getPublicUrl(filePath);

        const publicUrl = urlData?.publicUrl;
        console.log(`✅ Uploaded to Supabase: ${publicUrl}`);

        return {
            success: true,
            url:  publicUrl,
            path: filePath,
            bucket,
        };

    } catch (err) {
        console.error('Supabase upload error:', err.message);
        // Graceful fallback — return original base64 so try-on still works
        return {
            success: false,
            url:   base64Image,
            error: err.message,
        };
    }
}

/**
 * Delete an image from Supabase Storage (for cleanup).
 */
export async function deleteImage(bucket, filePath) {
    const client = getClient();
    if (!client) return;

    try {
        const { error } = await client.storage.from(bucket).remove([filePath]);
        if (error) throw error;
        console.log(`🗑️  Deleted from Supabase: ${filePath}`);
    } catch (err) {
        console.error('Supabase delete error:', err.message);
    }
}

/**
 * Check if Supabase is configured and reachable.
 */
export async function checkSupabaseConnection() {
    const client = getClient();
    if (!client) return { connected: false, reason: 'Not configured' };

    try {
        // Simple ping — list buckets
        const { data, error } = await client.storage.listBuckets();
        if (error) throw error;
        return {
            connected: true,
            buckets: data?.map(b => b.name) || [],
        };
    } catch (err) {
        return { connected: false, reason: err.message };
    }
}
