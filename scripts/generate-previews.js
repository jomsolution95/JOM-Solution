const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:5173/cv/builder?previewMode=true'; // Requires App running
const TEMPLATE_IDS = ['modern', 'minimalist', 'corporate', 'creative', 'ats']; // IDs defined in codebase
const OUTPUT_DIR = path.resolve(__dirname, '../public/templates');

(async () => {
    console.log('Starting Template Preview Generation...');

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport to HD
    await page.setViewport({ width: 1200, height: 1600 });

    for (const id of TEMPLATE_IDS) {
        try {
            console.log(`Generating preview for: ${id}`);
            // Navigate to builder with specific template and mock data query param if implemented
            // For now, assume manual selection or URL param handling in App
            await page.goto(`${BASE_URL}&template=${id}`, { waitUntil: 'networkidle0' });

            // Wait for render
            await new Promise(r => setTimeout(r, 2000));

            // Screenshot Element (e.g., #cv-preview-container)
            const element = await page.$('#cv-preview-container');
            if (element) {
                await element.screenshot({
                    path: path.join(OUTPUT_DIR, `${id}.png`),
                    type: 'png'
                });
                console.log(`✅ Saved ${id}.png`);
            } else {
                console.error(`❌ Element not found for ${id}`);
            }
        } catch (e) {
            console.error(`Error processing ${id}:`, e);
        }
    }

    await browser.close();
    console.log('All done!');
})();
