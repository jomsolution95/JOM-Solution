const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '../.env.development' }); // Also try development

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dxqyjylux';
const apiKey = process.env.CLOUDINARY_API_KEY || '366425231687421';
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log(`Checking Cloudinary Config...`);
console.log(`Cloud Name: ${cloudName}`);
console.log(`API Key: ${apiKey}`);
console.log(`API Secret: ${apiSecret ? 'Loaded (Hidden)' : 'MISSING IN .ENV'}`);

if (!apiSecret) {
    console.error('❌ ERROR: CLOUDINARY_API_SECRET is missing in .env file.');
    process.exit(1);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

cloudinary.api.ping()
    .then(res => {
        console.log('✅ Connection Successful!');
        console.log('Response:', res);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err.message);
    });
