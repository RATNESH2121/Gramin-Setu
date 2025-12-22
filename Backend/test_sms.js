require('dotenv').config();
const axios = require('axios');

const testSMS = async () => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const phone = process.argv[2]; // Get phone from command line arg

    console.log('--- Fast2SMS Connection Test ---');
    console.log('API Key Status:', apiKey ? 'Loaded ✅' : 'Missing ❌');

    if (!apiKey) {
        console.error('Error: FAST2SMS_API_KEY is missing in .env');
        process.exit(1);
    }

    if (!phone) {
        console.error('Usage: node test_sms.js <phone_number>');
        process.exit(1);
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    console.log(`Sending Test OTP to: ${cleanPhone}`);

    try {
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            message: "Your GraminSetu OTP is 123456",
            language: "english",
            route: "q",
            numbers: cleanPhone
        }, {
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('\nResponse Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.return) {
            console.log('\n✅ SMS Request Accepted successfully!');
        } else {
            console.log('\n❌ SMS Request Failed (API returned false)');
        }

    } catch (error) {
        console.error('\n❌ HTTP Request Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testSMS();
