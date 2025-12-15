
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const EMAIL = 'jomsolution95@gmail.com';
const PASS = 'AlhamdulilLah95';

async function testAdminEndpoints() {
    console.log('--- ADMIN API DIAGNOSTIC ---');

    // 1. Login
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: EMAIL, password: PASS });
        const token = loginRes.data.access_token;
        console.log('   [OK] Token received.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Stats
        console.log('2. Fetching Stats (/admin/stats)...');
        try {
            const statsRes = await axios.get(`${API_URL}/admin/stats`, config);
            console.log('   [OK] Stats:', statsRes.data);
        } catch (err: any) {
            console.error('   [FAIL] Stats Error:', err.response?.status, err.response?.data);
        }

        // 3. Users
        console.log('3. Fetching Users (/admin/users)...');
        try {
            const usersRes = await axios.get(`${API_URL}/admin/users`, config);
            console.log(`   [OK] Users Found: ${usersRes.data.data.length}`);
            console.log('   Sample User:', usersRes.data.data[0]);
        } catch (err: any) {
            console.error('   [FAIL] Users Error:', err.response?.status, err.response?.data);
        }

    } catch (err: any) {
        console.error('CRITICAL: Login Failed', err.message);
    }
}

testAdminEndpoints();
