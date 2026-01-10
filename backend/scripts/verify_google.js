const axios = require('axios');

async function checkGoogleRedirect() {
    try {
        console.log('🔍 Checking Google Auth Endpoint...');
        const response = await axios.get('http://localhost:5000/api/auth/google', {
            maxRedirects: 0,
            validateStatus: (status) => status >= 300 && status < 400
        });

        console.log('✅ Received Redirect Status:', response.status);
        const location = response.headers.location;
        console.log('📍 Redirect Location:', location);

        if (location && location.includes('accounts.google.com')) {
            console.log('✅ Redirects to Google Accounts');
        } else {
            console.error('❌ Redirect does not point to Google');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        process.exit(1);
    }
}

checkGoogleRedirect();
