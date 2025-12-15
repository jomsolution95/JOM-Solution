
import axios from 'axios';
import mongoose from 'mongoose'; // Access DB directly to verify creation if API doesn't expose list

const API_URL = 'http://localhost:3005/api';
const EMAIL = 'jomsolution95@gmail.com';
const PASS = 'AlhamdulilLah95';
const MONGO_URI = 'mongodb+srv://jomsolution95_db_user:AlhamdulilLah95@clusterjomsolution.f6sns0s.mongodb.net/jom_solution_db?retryWrites=true&w=majority&appName=ClusterJomSolution'; // Use env ideally, but hardcoded for script speed

async function verifyBroadcast() {
    console.log('--- VERIFYING BROADCAST SYSTEM ---');

    console.log('1. Logging in...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: EMAIL, password: PASS });
        const token = loginRes.data.access_token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   [OK] Logged in.');

        console.log('2. Sending Broadcast...');
        const title = `Test Broadcast ${Date.now()}`;
        const message = 'This is an automated test of the emergency broadcast system.';

        const res = await axios.post(`${API_URL}/admin/broadcast`, {
            title,
            message,
            targetRole: 'ALL'
        }, config);

        console.log(`   [OK] Broadcast API responded. Count: ${res.data.count}`);

        if (res.data.count > 0) {
            // Check Audit Log
            const logsRes = await axios.get(`${API_URL}/admin/logs`, config);
            const log = logsRes.data.data.find((l: any) => l.action === 'BROADCAST_SENT' && l.details.title === title);
            if (log) {
                console.log('   [SUCCESS] Broadcast Audit Log found.');
            } else {
                console.warn('   [WARN] Audit Log NOT found.');
            }

            // Note: Checking specific user notifications would require DB access or logging in as that user.
            // Assuming API success + Log implies functionality, relying on 'count' return.
        } else {
            console.warn('   [WARN] Broadcast count was 0 (No users found?)');
        }

    } catch (err: any) {
        console.error('CRITICAL FAILURE:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

verifyBroadcast();
