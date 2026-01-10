const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');
const OTP = require('../models/OTP');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:5000/api/auth';
const TEST_USER = {
    name: 'Test Verify User',
    email: `test_verify_${Date.now()}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!'
};

async function runVerification() {
    try {
        console.log('🚀 Starting Auth Verification Script...');

        // Connect to DB to access OTPs
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is missing in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Signup
        console.log('\nPlease ensure the server is running on port 5000...');
        console.log(`1️⃣  Attempting Signup for ${TEST_USER.email}...`);

        try {
            await axios.post(`${API_URL}/signup`, TEST_USER);
            console.log('✅ Signup request successful');
        } catch (error) {
            console.error('❌ Signup failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // 2. Get Verification OTP from DB
        console.log('2️⃣  Retrieving Verification OTP from DB...');
        // Wait a moment for DB write
        await new Promise(r => setTimeout(r, 1000));

        const verificationOtp = await OTP.findOne({ email: TEST_USER.email }).sort({ createdAt: -1 });
        if (!verificationOtp) {
            console.error('❌ No OTP found in database for user');
            process.exit(1);
        }
        console.log(`✅ Found OTP: ${verificationOtp.code}`);

        // 3. Verify Account
        console.log('3️⃣  Verifying Account...');
        try {
            const verifyRes = await axios.post(`${API_URL}/verify-otp`, {
                email: TEST_USER.email,
                code: verificationOtp.code
            });
            console.log('✅ Account Verified:', verifyRes.data.message);
        } catch (error) {
            console.error('❌ Verification failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // 4. Login
        console.log('4️⃣  Attempting Login...');
        let loginRes;
        try {
            loginRes = await axios.post(`${API_URL}/login`, {
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            console.log('✅ Login request successful. 2FA required:', loginRes.data.data.needsOTP);

            if (!loginRes.data.data.needsOTP) {
                console.warn('⚠️  Login successfully but expected needsOTP to be true for 2FA flow. Check backend logic if 2FA is mandatory.');
            }
        } catch (error) {
            console.error('❌ Login failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // 5. Get Login OTP from DB
        console.log('5️⃣  Retrieving Login OTP from DB...');
        await new Promise(r => setTimeout(r, 1000));

        // Find the newest OTP
        const loginOtp = await OTP.findOne({ email: TEST_USER.email }).sort({ createdAt: -1 });
        // It should be different/newer if the login triggered a new one
        console.log(`✅ Found OTP: ${loginOtp.code}`);

        // 6. Verify Login OTP
        console.log('6️⃣  Verifying Login OTP...');
        let authToken;
        try {
            const finalAuthRes = await axios.post(`${API_URL}/verify-otp`, {
                email: TEST_USER.email,
                code: loginOtp.code
            });
            if (finalAuthRes.data.data.token) {
                authToken = finalAuthRes.data.data.token;
                console.log('✅ Login Verified. Token received.');
            } else {
                console.error('❌ Login Verified but no token received.');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ Login OTP verification failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // 7. Test Protected Route (Get Me)
        console.log('7️⃣  Testing Protected Route (Get Me)...');
        try {
            const meRes = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            console.log('✅ Protected route accessed. User ID:', meRes.data.data.user._id);
        } catch (error) {
            console.error('❌ Protected route access failed:', error.response?.data || error.message);
            process.exit(1);
        }

        // Cleanup
        console.log('\n🧹 Cleaning up test user...');
        await User.deleteOne({ email: TEST_USER.email });
        await OTP.deleteMany({ email: TEST_USER.email });
        console.log('✅ Cleanup complete.');

        console.log('\n✨✨ FORM AUTHENTICATION VERIFICATION PASSED ✨✨');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Unexpected Error:', err);
        process.exit(1);
    }
}

runVerification();
