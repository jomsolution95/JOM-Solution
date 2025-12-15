
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const content = `GEMINI_API_KEY=AIzaSyD5Xd0csqheeZbrqMTDsk2CdlvrxWajt3c`;

fs.writeFileSync(envPath, content, 'utf8');
console.log('.env file written successfully in UTF-8');
