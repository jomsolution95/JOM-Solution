
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('No API Key found');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testAll() {
    console.log(`Testing with Key: ${apiKey.substring(0, 10)}...`);
    for (const modelName of models) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            const response = await result.response;
            console.log(`✅ SUCCESS! Response: ${response.text().trim()}`);
            process.exit(0); // Exit on first success
        } catch (error) {
            console.log(`❌ Failed. (${error.message.split('[404')[0].trim()})`);
        }
    }
    console.log('❌ All models failed.');
    process.exit(1);
}

testAll();
