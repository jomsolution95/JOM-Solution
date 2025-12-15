
import axios from 'axios';

const API_URL = 'http://localhost:3005/api';
const EMAIL = 'jomsolution95@gmail.com';
const PASS = 'AlhamdulilLah95';

async function verifyFeatures() {
    console.log('--- VERIFYING ADMIN FEATURES ---');

    // 1. Login
    console.log('1. Logging in...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: EMAIL, password: PASS });
        const token = loginRes.data.access_token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   [OK] Logged in.');

        // 2. Initial Logs Count
        const logsBefore = await axios.get(`${API_URL}/admin/logs`, config);
        const countBefore = logsBefore.data.meta.total;
        console.log(`   Logs Count Before: ${countBefore}`);

        // 3. Find a User to Ban (First non-admin)
        const usersRes = await axios.get(`${API_URL}/admin/users`, config);
        const victim = usersRes.data.data.find((u: any) => !u.roles.includes('super_admin') && u.isActive);

        if (victim) {
            console.log(`2. Banning User ${victim.email} (${victim._id})...`);
            await axios.post(`${API_URL}/admin/users/${victim._id}/ban`, {}, config);
            console.log('   [OK] Banned.');

            // 4. Verify Log Creation
            console.log('3. Verifying Audit Log...');
            const logsAfter = await axios.get(`${API_URL}/admin/logs`, config);
            const countAfter = logsAfter.data.meta.total;
            const newLog = logsAfter.data.data[0];

            if (countAfter > countBefore && newLog.action === 'BAN_USER') {
                console.log(`   [SUCCESS] Log created: ${newLog.action} on ${newLog.targetModel} by ${newLog.admin.email}`);
            } else {
                console.error('   [FAIL] No new log found!', newLog);
            }
        } else {
            console.log('   [SKIP] No verifyable victim found.');
        }

        // 5. Verify Escrow
        console.log('4. Verifying Escrow Data...');
        const escrowRes = await axios.get(`${API_URL}/admin/finances/escrow`, config);
        const escrows = escrowRes.data.data;
        if (escrows.length > 0) {
            console.log(`   [SUCCESS] Found ${escrows.length} escrow transactions.`);
            const target = escrows.find((e: any) => e.status === 'held');

            if (target) {
                console.log(`5. Testing Force Refund on Escrow ${target._id}...`);
                try {
                    await axios.post(`${API_URL}/admin/finances/escrow/${target._id}/resolve`, { decision: 'REFUND' }, config);
                    console.log('   [OK] Refund API called.');

                    // Verify Status Update
                    const escrowAfterRes = await axios.get(`${API_URL}/admin/finances/escrow`, config);
                    const updatedTx = escrowAfterRes.data.data.find((e: any) => e._id === target._id);
                    if (updatedTx.status === 'refunded') {
                        console.log('   [SUCCESS] Status updated to REFUNDED.');
                    } else {
                        console.error('   [FAIL] Status mismatch:', updatedTx.status);
                    }
                } catch (err: any) {
                    console.error('   [FAIL] Refund API Error:', err.message);
                }
            } else {
                console.log('   [SKIP] No HELD escrow found to refund.');
            }
        } else {
            console.warn('   [WARN] No escrow data found (Seed might be needed).');
        }

    } catch (err: any) {
        console.error('CRITICAL FAILURE:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

verifyFeatures();
