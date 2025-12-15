
import { start } from 'repl';

const BASE_URL = 'http://localhost:3005/api';
const SUPER_ADMIN = {
    email: 'jomsolution95@gmail.com',
    password: 'AlhamdulilLah95'
};

async function request(endpoint: string, method: string = 'GET', body: any = null, token: string | null = null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config: RequestInit = {
        method,
        headers,
    };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();
    return { status: res.status, data };
}

async function login(email: string, password: string) {
    console.log(`Logging in as ${email}...`);
    const res = await request('/auth/login', 'POST', { email, password });
    if (res.status === 201 || res.status === 200) {
        console.log('✅ Login successful');
        return res.data.access_token;
    } else {
        console.error('❌ Login failed:', res.data);
        return null;
    }
}

async function createAdvertiser(token: string) {
    console.log('Creating advertiser...');
    const randomEmail = `adv_${Math.floor(Math.random() * 1000)}@test.com`;
    // Assuming we have an endpoint to create users or we just register one
    // For this script, let's assume we register a new user normally which defaults to user, then maybe upgrade?
    // Actually, let's just use the super admin as the advertiser for simplicity if allowed, or register a new one.

    // Register new user
    const res = await request('/auth/register', 'POST', {
        email: randomEmail,
        password: 'password123',
        firstName: 'Test',
        lastName: 'Advertiser',
        phone: '770000000'
    });

    if (res.status === 201) {
        console.log('✅ Advertiser registered:', randomEmail);
        // Login as this user
        const loginRes = await login(randomEmail, 'password123');
        return { token: loginRes, id: res.data._id || 'unknown' };
    }
    console.error('❌ Failed to register advertiser');
    return null;
}

async function createCampaign(token: string) {
    console.log('Creating ad campaign...');
    const campaign = {
        name: 'Test Campaign ' + Date.now(),
        type: 'BANNER',
        headline: 'Super Promo',
        description: 'Best deals in town',
        imageUrl: 'https://placehold.co/600x400',
        targetUrl: 'https://example.com',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        budget: 50000,
        placements: ['HOME_BANNER', 'SEARCH_RESULT'],
        targeting: {
            locations: ['Dakar'],
            interests: ['Tech']
        }
    };

    const res = await request('/ads', 'POST', campaign, token);
    if (res.status === 201) {
        console.log('✅ Campaign created:', res.data.campaign._id);
        return res.data.campaign._id;
    } else {
        console.error('❌ Failed to create campaign:', res.data);
        return null;
    }
}

async function verifyAdsFlow() {
    try {
        // 1. Login as Super Admin
        const adminToken = await login(SUPER_ADMIN.email, SUPER_ADMIN.password);
        if (!adminToken) return;

        // 2. Create an Advertiser (or just use a new user)
        const advertiserCtx = await createAdvertiser(adminToken); // Creating user doesn't need token usually, but let's see
        // Actually register is public usually.

        if (!advertiserCtx) return;

        // 3. Create Campaign as Advertiser
        const campaignId = await createCampaign(advertiserCtx.token);
        if (!campaignId) return;

        // 4. Admin Reviews Campaign (Approve)
        console.log('Admin reviewing campaign...');
        const reviewRes = await request(`/admin/ads/${campaignId}/review`, 'POST', { action: 'APPROVE' }, adminToken);

        if (reviewRes.status === 200 || reviewRes.status === 201) {
            console.log('✅ Campaign approved');
        } else {
            console.error('❌ Failed to approve campaign:', reviewRes.data);
        }

        // 5. Verify Campaign is Active
        console.log('Verifying public ads...');
        const adsRes = await request('/ads', 'GET', null, null); // Public endpoint
        // Check if our campaign is in the list
        const myAd = adsRes.data.find((c: any) => c._id === campaignId);
        if (myAd) {
            console.log('✅ Campaign found in public listing!');
        } else {
            console.log('⚠️ Campaign not found in public listing (might be targeting or lag)');
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

verifyAdsFlow();
