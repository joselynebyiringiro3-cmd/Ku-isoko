const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Script to generate MoMo API User and API Key
 * Replace the SUBSCRIPTION_KEY with yours
 */

const SUBSCRIPTION_KEY = 'f32591c0eaba40bdb5a5cad407d5450a';
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

const setupMoMo = async (key, name) => {
    try {
        const apiUser = uuidv4();
        console.log(`\n--- Testing ${name} ---`);
        console.log(`Step 1: Creating API User for ${key}...`);

        await axios.post(
            `${BASE_URL}/v1_0/apiuser`,
            { providerCallbackHost: 'localhost' },
            {
                headers: {
                    'X-Reference-Id': apiUser,
                    'Ocp-Apim-Subscription-Key': key.trim(),
                },
            }
        );

        console.log('✅ API User created');

        console.log('Step 2: Generating API Key...');
        const response = await axios.post(
            `${BASE_URL}/v1_0/apiuser/${apiUser}/apikey`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': key.trim(),
                },
            }
        );

        const apiKey = response.data.apiKey;
        console.log('✅ API Key generated');

        const fs = require('fs');
        const output = `MTN_MOMO_SUBSCRIPTION_KEY=${key.trim()}\nMTN_MOMO_API_USER=${apiUser}\nMTN_MOMO_API_KEY=${apiKey}\n`;
        fs.writeFileSync('backend/credentials.txt', output);

        console.log('\n--- SUCCESS! COPY THESE ---');
        console.log(output);
        console.log('--------------------------\n');

    } catch (error) {
        console.error(`❌ Error with ${name}:`, error.response?.status, error.response?.data || error.message);
    }
};

const fs = require('fs');

const run = async () => {
    // Redirect console log to catch output or just write file
    const logFile = 'credentials.txt';
    const originalLog = console.log;
    fs.writeFileSync(logFile, ''); // Clear file

    const logToFile = (message) => {
        fs.appendFileSync(logFile, message + '\n');
        originalLog(message);
    };

    // Monkey patch console.log for this run (or just use fs in setupMoMo but this is less intrusive to the logic)
    // Actually, let's just modify the setupMoMo function to return values or write to file.
    // Simpler: Just calling the function and let's modify setupMoMo to write to file.
    await setupMoMo('730ae0ce4324424ba084963ea59ec9a3', 'Primary Key');
};

run();

