const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    try {
        const user = {
            name: 'Test User 2',
            email: `test_${Date.now()}@example.com`,
            phone: '1234567890',
            password: 'plainpassword'
        };

        console.log('1. Testing Registration...');
        try {
            const regRes = await axios.post(`${API_URL}/register`, user);
            console.log('Registration Success:', regRes.data);
            if (!regRes.data.token || !regRes.data.token.startsWith('dummy_token_')) {
                throw new Error('Invalid token received during registration');
            }
        } catch (err) {
            console.error('Registration Error:', err.response ? err.response.data : err.message);
        }

        console.log('\n2. Testing Login...');
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                email: user.email,
                password: user.password
            });
            console.log('Login Success:', loginRes.data);
            if (!loginRes.data.token || !loginRes.data.token.startsWith('dummy_token_')) {
                throw new Error('Invalid token received during login');
            }
        } catch (err) {
            console.error('Login Error:', err.response ? err.response.data : err.message);
        }

    } catch (err) {
        console.error('Unexpected Error:', err.message);
    }
};

testAuth();
