
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');

console.log('Current directory:', process.cwd());
console.log('Env file path:', path.resolve(__dirname, '../.env'));
console.log('Env file exists?', fs.existsSync(path.resolve(__dirname, '../.env')));

async function testConnection() {
    console.log('Testing Gemini API Connection (JS)...');
    const apiKey = process.env.GEMINI_API_KEY;

    // Debug print (first few chars)
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY is undefined.');
        process.exit(1);
    }
    console.log(`API Key found (starts with: ${apiKey.substring(0, 5)}...)`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = 'Reply with only the word: "SUCCESS"';
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Response from Gemini:', text);

        if (text.includes('SUCCESS')) {
            console.log('✅ Gemini API is FULLY FUNCTIONAL!');
        } else {
            console.log('⚠️  Received response but not expected output.');
        }

    } catch (error) {
        console.error('❌ Gemini API Connection Failed:', error.message);
    }
}

testConnection();
