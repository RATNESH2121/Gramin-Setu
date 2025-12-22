const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const runTest = async () => {
    try {
        const uniqueId = Date.now();
        const adminEmail = `admin_${uniqueId}@test.com`;
        const farmerEmail = `farmer_${uniqueId}@test.com`;
        const password = 'password123';

        console.log('--- TEST START ---');

        // 1. Register Admin
        console.log(`\n1. Registering Admin (${adminEmail})...`);
        try {
            const res = await axios.post(`${API_URL}/register`, {
                name: 'Test Admin',
                email: adminEmail,
                phone: '1234567890',
                password: password,
                adminSecret: 'admin123'
            });
            console.log('Admin Register Response:', res.status, res.data.user.role);
            if (res.data.user.role !== 'admin') console.error('FAIL: Role should be admin');
        } catch (e) {
            console.error('Admin Register Error:', e.response?.data || e.message);
        }

        // 2. Login Admin
        console.log(`\n2. Logging in Admin...`);
        try {
            const res = await axios.post(`${API_URL}/login`, {
                email: adminEmail,
                password: password
            });
            console.log('Admin Login Response:', res.status, res.data.user.role);
            if (res.data.user.role !== 'admin') console.error('FAIL: Login role should be admin');
        } catch (e) {
            console.error('Admin Login Error:', e.response?.data || e.message);
        }

        // 3. Register Farmer
        console.log(`\n3. Registering Farmer (${farmerEmail})...`);
        try {
            const res = await axios.post(`${API_URL}/register`, {
                name: 'Test Farmer',
                email: farmerEmail,
                phone: '0987654321',
                password: password
                // No secret
            });
            console.log('Farmer Register Response:', res.status, res.data.user.role);
            if (res.data.user.role !== 'farmer') console.error('FAIL: Role should be farmer');
        } catch (e) {
            console.error('Farmer Register Error:', e.response?.data || e.message);
        }

        console.log('\n--- TEST END ---');

    } catch (err) {
        console.error('Fatal Error:', err);
    }
};

runTest();
