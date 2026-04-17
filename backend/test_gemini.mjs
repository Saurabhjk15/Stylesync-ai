import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
console.log('Key format:', key ? key.substring(0, 8) + '...' : 'NOT SET');
console.log('Key length:', key?.length);

try {
    const ai = new GoogleGenAI({ apiKey: key });
    const r  = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: 'Say hello in one word' });
    console.log('✅ SUCCESS:', r.text);
} catch (e) {
    console.error('❌ SDK ERROR:', e.message);
    console.error('   Status:', e.status ?? e.code ?? 'unknown');
}
