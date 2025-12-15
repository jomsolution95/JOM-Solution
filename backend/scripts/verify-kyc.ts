
import axios from 'axios';

const API_URL = 'http://localhost:3005/api';
const EMAIL = 'jomsolution95@gmail.com';
const PASS = 'AlhamdulilLah95';

async function verifyKYC() {
    console.log('--- VERIFYING KYC SYSTEM ---');

    console.log('1. Logging in...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: EMAIL, password: PASS });
        const token = loginRes.data.access_token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   [OK] Logged in.');

        console.log('2. Fetching Pending KYC...');
        const pendingRes = await axios.get(`${API_URL}/admin/kyc/pending`, config);
        const candidates = pendingRes.data.data;
        console.log(`   [OK] Found ${candidates.length} pending candidates.`);

        if (candidates.length > 0) {
            const target = candidates[0];
            console.log(`3. Validating Candidate ${target.email} (${target._id})...`);

            await axios.post(`${API_URL}/admin/kyc/${target._id}/review`, { decision: 'APPROVE' }, config);
            console.log('   [OK] Approved.');

            // Check if verified
            const usersRes = await axios.get(`${API_URL}/admin/users`, config);
            const updatedUser = usersRes.data.data.find((u: any) => u._id === target._id);
            if (updatedUser.isVerified) {
                console.log('   [SUCCESS] User is now Verified!');
            } else {
                console.error('   [FAIL] User is NOT verified!');
            }

            // Verify Log
            const logsRes = await axios.get(`${API_URL}/admin/logs`, config);
            const log = logsRes.data.data.find((l: any) => l.action === 'APPROVE_KYC' && l.targetId === target._id);
            if (log) {
                console.log('   [SUCCESS] KYC Approval Logged.');
            } else {
                console.warn('   [WARN] Log not found.');
            }

        } else {
            console.warn('   [WARN] No candidates found to verify. Check seed.');
        }

    } catch (err: any) {
        console.error('CRITICAL FAILURE:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

verifyKYC();
