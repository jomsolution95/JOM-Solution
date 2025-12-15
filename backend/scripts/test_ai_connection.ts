
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    console.log('Testing Gemini API Connection...');
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.includes('REMPLACER')) {
        console.error('❌ Error: GEMINI_API_KEY is missing or still has placeholder value.');
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
