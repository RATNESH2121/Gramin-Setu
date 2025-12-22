const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
    try {
        console.log('--- STARTING HOUSING SCHEME VERIFICATION ---');

        // 1. Register Mock Farmer
        const farmerEmail = `farmer_${Date.now()}@example.com`;
        console.log(`\n1. Registering Farmer (${farmerEmail})...`);
        let farmerToken;
        let farmerId;
        try {
            const regRes = await axios.post(`${API_URL}/auth/register`, {
                name: 'Verification Farmer',
                email: farmerEmail,
                phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
                password: 'password123',
                village: 'TestVillage',
                district: 'TestDistrict',
                // Mock OTP bypass if possible or just rely on server ignoring it in dev if not set
                // Actually auth route requires valid OTP unless disabled. 
                // Wait, auth.register requires OTP verification first.
                // I'll skip registration if I can't bypass OTP. 
                // Let's try to LOGIN as an existing user or mock the OTP flow?
                // Or simplified: Just create a User in DB directly? No, I can't access DB easily from here without mongoose connection.
                // I'll use the 'test_role_auth.js' approach if it bypassed OTP? No, it used axios too.
                // Let's assume I can use a known seeded user or I'll try to register and hope my simplified auth allows it with mock OTP?
                // Looking at auth.js: `const storedData = otpStore.get(phone);` it necessitates OTP. 
                // But `testAuth` in `verify_auth.js` does register... maybe it uses a bypass?
                // Ah `verify_auth.js` in previous turn output line 14: `console.log('1. Testing Registration...');`. It failed?
                // I'll manually insert a user via Mongoose to be safe.
            });
            // If register fails due to OTP, I'll connect to DB and create user.
        } catch (e) {
            console.log('Registration via API failed (expected if OTP required). Creating user via Mongoose...');
        }

        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/UserModel');

        let farmer = await User.findOne({ email: 'farmer_verif@example.com' });
        if (!farmer) {
            farmer = new User({
                name: 'Verif Farmer',
                email: 'farmer_verif@example.com',
                phone: '9999999999',
                password: 'password123',
                role: 'farmer',
                village: 'VerifVillage',
                district: 'VerifDistrict'
            });
            await farmer.save();
        }
        farmerId = farmer._id;
        farmerToken = 'dummy_token_' + farmerId; // Mock token format used in auth.js
        console.log(`Farmer ID: ${farmerId}`);

        // 2. Apply for Housing
        console.log('\n2. Submitting Housing Application...');
        const appPayload = {
            applicantId: farmerId,
            familySize: 4,
            annualIncome: 50000,
            category: 'SC',
            address: {
                state: 'Punjab',
                district: 'VerifDistrict',
                block: 'Block A',
                gramPanchayat: 'GP 1',
                village: 'VerifVillage',
                latitude: 30.1,
                longitude: 75.2
            },
            currentHousingStatus: {
                ownsHouse: false,
                houseCondition: 'Kutcha',
                ownsLand: true
            },
            documents: {
                identityProof: 'http://img.com/id',
                housePhoto: 'http://img.com/house'
            }
        };

        const applyRes = await axios.post(`${API_URL}/housing-apps/apply`, appPayload);
        const appId = applyRes.data._id;
        const appPublicId = applyRes.data.applicationId;
        console.log(`Application Submitted! ID: ${appPublicId} (${appId})`);

        // 3. Admin View
        console.log('\n3. fetching All Applications (Admin)...');
        // Admin usually has no specific token check in this simplified backend, but let's see.
        const allAppsRes = await axios.get(`${API_URL}/housing-apps/all`);
        const foundApp = allAppsRes.data.find(a => a._id === appId);
        if (foundApp && foundApp.status === 'Pending') {
            console.log('PASS: Application found in Admin list with Pending status.');
        } else {
            console.error('FAIL: Application not found or status mismatch.');
        }

        // 4. Admin Approve
        console.log('\n4. Approving Application...');
        await axios.put(`${API_URL}/housing-apps/status/${appId}`, { status: 'Approved' });
        console.log('Application Approved.');

        // 5. Verify GIS Layer
        console.log('\n5. Checking GIS Layers...');
        const gisRes = await axios.get(`${API_URL}/gis/layers?role=admin`);
        const housingLayer = gisRes.data.find(l => l.id === 'housing');

        // We look for our point in housing layer
        const point = housingLayer.data.find(p => p.properties.beneficiary === 'Verif Farmer' || p.properties.beneficiary === farmerId.toString());
        // Since we populated name, it should be 'Verif Farmer'

        if (point) {
            console.log(`PASS: Verified GIS point for ${point.properties.beneficiary} at ${point.lat}, ${point.lng}`);
        } else {
            // Might be randomly generated coords in backend if not strict, but we passed lat/long.
            // Backend maps h.address.latitude.
            // Let's check if any point matches our lat/long approx.
            const matchParams = housingLayer.data.find(p => Math.abs(p.lat - 30.1) < 0.01);
            if (matchParams) {
                console.log(`PASS: Verified GIS point by coordinates. Name: ${matchParams.properties.beneficiary}`);
            } else {
                console.error('FAIL: GIS point not found.');
                console.log('Housing Layer Data Sample:', housingLayer.data.slice(0, 2));
            }
        }

        console.log('\n--- VERIFICATION COMPLETE ---');

    } catch (err) {
        console.error('Verification Failed:', err.response ? err.response.data : err.message);
    } finally {
        await mongoose.disconnect();
    }
};

runVerification();
