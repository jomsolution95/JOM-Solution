import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function verifyFullSystem() {
    console.log('🚀 Starting Full System Verification...\n');

    // 1. Load Env
    const envPath = path.resolve(__dirname, '..', '.env.development');
    dotenv.config({ path: envPath });

    // 2. AI Service Debug
    console.log('\n🧠 Checking AI Service (Gemini)...');
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY missing');

        const genAI = new GoogleGenerativeAI(apiKey);

        // List models to debug
        // Note: listModels might require a different scope or just work.
        // If it fails, likely key issue.
        /*
        try {
            console.log('   ℹ️ Listing available models...');
            // Not all SDK versions expose listModels cleanly on the root, but let's try via direct fetch if needed
            // Actually newer SDKs don't expose listModels on the instance easily without full admin wrapper?
            // Let's stick to trying a known working model: 'gemini-1.5-flash-latest'? 'gemini-1.0-pro'?
        } catch(e) {}
        */

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('   🔄 Sending prompt to Gemini (gemini-1.5-flash)...');
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`   ✅ AI Response: "${response.text().trim()}"`);
    } catch (e: any) {
        console.error('   ❌ AI Check Failed:', e.message);
    }
}

verifyFullSystem();
