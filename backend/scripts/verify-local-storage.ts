import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '../src/modules/premium/services/file-upload.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'; // Load env manually

async function verifyLocalStorage() {
    console.log('🏠 Starting Local Storage Check (Manual Mode)...');

    // Load .env
    const envPath = path.resolve(__dirname, '..', '.env.development');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log('   ✅ Loaded .env.development');
    } else {
        console.warn('   ⚠️ .env.development not found');
    }

    // Mock ConfigService
    const configService = {
        get: (key: string) => process.env[key],
    } as unknown as ConfigService;

    const fileUploadService = new FileUploadService(configService);
    fileUploadService.onModuleInit();

    const testFile = {
        fieldname: 'file',
        originalname: 'test-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4\n...Test Content...'),
        size: 100,
    } as Express.Multer.File;

    console.log('\n🔄 Attempting Upload...');
    try {
        const result = await fileUploadService.uploadFile(testFile, 'test_uploads');
        console.log('   ✅ Upload Successful!');
        console.log(`   📂 URL: ${result.url}`);
        console.log(`   🔑 Key: ${result.key}`);

        const filePath = path.resolve(__dirname, '..', 'uploads', 'test_uploads', result.key);

        if (fs.existsSync(filePath)) {
            console.log('   ✅ File written to disk verified at:', filePath);
        } else {
            console.error('   ❌ File NOT found on disk at:', filePath);
        }

        // Cleanup
        await fileUploadService.deleteFile(result.public_id);
        if (!fs.existsSync(filePath)) {
            console.log('   ✅ File deleted successfully.');
        }

    } catch (error: any) {
        console.error('   ❌ Upload Failed:', error.message);
    }
}

verifyLocalStorage();
