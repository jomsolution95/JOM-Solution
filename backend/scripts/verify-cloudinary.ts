import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

async function verifyCloudinary() {
    console.log('☁️ Starting Cloudinary Configuration Check...');

    // Load Env using ConfigModule to mimic App behavior
    const appContext = await NestFactory.createApplicationContext(
        ConfigModule.forRoot({
            envFilePath: '.env.development',
        })
    );
    const configService = appContext.get(ConfigService);

    const cloudName = configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get('CLOUDINARY_API_KEY');
    const apiSecret = configService.get('CLOUDINARY_API_SECRET');

    console.log(`\n📋 Configuration Detected:`);
    console.log(`   Cloud Name: ${cloudName || 'MISSING'}`);
    console.log(`   API Key:    ${apiKey || 'MISSING'}`);
    console.log(`   API Secret: ${apiSecret ? (apiSecret.startsWith('__') ? '⚠️ PLACEHOLDER' : '******' + apiSecret.slice(-4)) : 'MISSING'}`);

    if (!apiSecret || apiSecret.startsWith('__')) {
        console.error('\n❌ ERROR: Cloudinary API Secret is invalid or missing.');
        console.error('   Please update CLOUDINARY_API_SECRET in backend/.env.development');
        await appContext.close();
        process.exit(1);
    }

    // Attempt Connection / Ping
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    console.log('\n🔄 Testing Connection (Ping)...');
    try {
        const result = await cloudinary.api.ping();
        console.log('   ✅ Cloudinary Ping Successful!', result);
    } catch (error: any) {
        console.error('   ❌ Cloudinary Connection Failed:', error.message);
        process.exit(1);
    }

    await appContext.close();
}

verifyCloudinary();
