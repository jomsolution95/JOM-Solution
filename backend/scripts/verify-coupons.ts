
const BASE_URL = 'http://localhost:3005/api'; // Using port 3005 as per backend state
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

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await res.json();
        return { status: res.status, data };
    } catch (e) {
        console.error(`Request failed to ${endpoint}:`, e);
        return { status: 500, data: null };
    }
}

async function login() {
    console.log('Logging in as Super Admin...');
    const res = await request('/auth/login', 'POST', SUPER_ADMIN);
    if (res.status === 200 || res.status === 201) {
        console.log('✅ Login successful');
        return res.data.access_token;
    }
    console.error('❌ Login failed:', res.data);
    return null;
}

async function verifyCouponsFlow() {
    const token = await login();
    if (!token) return;

    // 1. Create Coupon
    console.log('Creating coupon...');
    const couponCode = `TEST${Math.floor(Math.random() * 1000)}`;
    const createRes = await request('/admin/coupons', 'POST', {
        code: couponCode,
        discountType: 'PERCENTAGE',
        amount: 20,
        maxUses: 100
    }, token);

    let couponId = '';

    if (createRes.status === 201) {
        console.log('✅ Coupon created:', couponCode);
        couponId = createRes.data._id;
    } else {
        console.error('❌ Failed to create coupon:', createRes.data);
        return;
    }

    // 2. List Coupons
    console.log('Listing coupons...');
    const listRes = await request('/admin/coupons', 'GET', null, token);
    // Adjust check: ensure it's an array OR .data is array
    const couponsList = Array.isArray(listRes.data) ? listRes.data : (listRes.data.data || []);

    if (listRes.status === 200) {
        const found = couponsList.find((c: any) => c.code === couponCode);
        if (found) {
            console.log('✅ Coupon found in list');
        } else {
            console.error('❌ Coupon NOT found in list');
        }
    } else {
        console.error('❌ Failed to list coupons:', listRes.data);
    }

    // 3. Delete Coupon
    if (couponId) {
        console.log('Deleting coupon...');
        const deleteRes = await request(`/admin/coupons/${couponId}`, 'DELETE', null, token);
        if (deleteRes.status === 200) {
            console.log('✅ Coupon deleted');
        } else {
            console.error('❌ Failed to delete coupon:', deleteRes.data);
        }
    }
}

verifyCouponsFlow();
