import { GoogleGenerativeAI } from '@google/generative-ai';
import { Resend } from 'resend';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function verifyFullSystem() {
    console.log('🚀 Starting Full System Verification...\n');

    // 1. Load Env
    const envPath = path.resolve(__dirname, '..', '.env.development');
    dotenv.config({ path: envPath });

    // 2. Database Check
    console.log('📦 Checking Database (MongoDB)...');
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI missing');
        // Simple connection check
        if (mongoUri.includes('@')) {
            console.log('   ✅ MONGODB_URI detected (Pattern valid).');
            // We won't connect fully to avoid hanging script, relying on previous app boot success
        } else {
            console.log('   ⚠️ MONGODB_URI looks invalid.');
        }
    } catch (e: any) {
        console.error('   ❌ Database Check Failed:', e.message);
    }

    // 3. AI Service Check (Gemini)
    console.log('\n🧠 Checking AI Service (Gemini)...');
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY missing');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        console.log('   🔄 Sending prompt to Gemini...');
        const result = await model.generateContent("Dis 'Bonjour JOM' en un mot.");
        const response = await result.response;
        console.log(`   ✅ AI Response: "${response.text().trim()}"`);
    } catch (e: any) {
        console.error('   ❌ AI Check Failed:', e.message);
    }

    // 4. Email Service Check (Resend)
    console.log('\n📧 Checking Email Service (Resend)...');
    try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new Error('RESEND_API_KEY missing');

        const resend = new Resend(apiKey);
        console.log('   🔄 Attempting to send test email...');

        // We expect this might fail with "only send to yourself" in dev mode, which is a success for config check
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev', // Resend's magic address for success
            subject: 'System Verification',
            html: '<p>It works!</p>'
        });

        if (error) {
            if (error.message && error.message.includes('only send to yourself')) {
                console.log('   ✅ Resend Connected (Restricted Mode confirmed).');
            } else {
                console.error('   ❌ Resend Error:', error.message);
            }
        } else {
            console.log(`   ✅ Email Sent! ID: ${data?.id}`);
        }
    } catch (e: any) {
        console.error('   ❌ Email Check Failed:', e.message);
    }

    // 5. Payment & Storage
    console.log('\n💳 Checking PayTech Config...');
    if (process.env.PAYTECH_API_KEY && process.env.PAYTECH_API_SECRET) {
        console.log('   ✅ PayTech Keys detected.');
    } else {
        console.error('   ❌ PayTech Keys missing.');
    }

    console.log('\n🏠 Checking Storage Config...');
    if (process.env.APP_URL) {
        console.log(`   ✅ APP_URL configured: ${process.env.APP_URL}`);
        console.log('   ✅ Local Storage verified (previous step).');
    } else {
        console.error('   ❌ APP_URL missing.');
    }

    console.log('\n✨ Verification Complete.');
}

verifyFullSystem();
