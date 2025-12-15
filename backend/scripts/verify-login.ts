
import axios from 'axios';

const API_URL = 'http://localhost:3005/api/auth/login';

async function testLogin() {
    console.log('Testing Login against:', API_URL);
    try {
        const response = await axios.post(API_URL, {
            email: 'jomsolution95@gmail.com',
            password: 'AlhamdulilLah95'
        });
        console.log('LOGIN SUCCESS!');
        console.log('Status:', response.status);
        console.log('User Roles:', response.data.user.roles);
        console.log('Token received:', !!response.data.access_token);
    } catch (error: any) {
        console.error('LOGIN FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error Message:', error.message);
            console.error('Error Code:', error.code);
            console.error('Full Error:', error);
        }
    }
}

testLogin();
