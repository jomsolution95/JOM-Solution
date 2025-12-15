
import axios from 'axios';

const API_URL = 'http://localhost:3005/api';
const EMAIL = 'jomsolution95@gmail.com';
const PASS = 'AlhamdulilLah95';

async function verifyScheduler() {
    console.log('--- VERIFYING SCHEDULER SYSTEM ---');

    console.log('1. Logging in...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email: EMAIL, password: PASS });
        const token = loginRes.data.access_token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   [OK] Logged in.');

        console.log('2. Scheduling Broadcast (T+10s)...');
        const executeAt = new Date(Date.now() + 20000); // 20 seconds from now

        const res = await axios.post(`${API_URL}/admin/schedule`, {
            action: 'BROADCAST',
            payload: {
                title: 'Scheduled Test',
                message: 'This message traveled through time!',
                targetRole: 'ALL'
            },
            executeAt: executeAt.toISOString()
        }, config);

        console.log('   [OK] Task Scheduled:', res.data._id);
        console.log(`   [INFO] Waiting 30s for execution (Scheduled for ${executeAt.toLocaleTimeString()})...`);

        await new Promise(r => setTimeout(r, 35000)); // Wait 35s

        console.log('3. Checking logs (Manual check suggested if API unavailable)...');
        // Ideally we check an endpoint for "completed tasks", but for now we rely on the backend terminal logs from the user.
        console.log('   [INFO] Process complete. Check backend logs for "Task executed successfully".');

    } catch (err: any) {
        console.error('CRITICAL FAILURE:', err.message);
        if (err.response) console.error('Response:', err.response.data);
    }
}

verifyScheduler();
